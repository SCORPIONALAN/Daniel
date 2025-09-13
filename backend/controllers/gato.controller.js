import mongoose from 'mongoose';
import Gato from "../models/gato.model.js";
import Usuario from "../models/user.model.js";
import fs from "fs";
import path from "path";

// Carpetas de imágenes
const uploadFolder = path.join("imagenesGatosActuales");
const oldFolder = path.join("imagenesGatosAntiguo");

// Crear carpetas si no existen
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });
if (!fs.existsSync(oldFolder)) fs.mkdirSync(oldFolder, { recursive: true });

// Función auxiliar para validar tipo de imagen
const isImage = (mimetype) =>
  ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mimetype);

// Tamaño máximo de imagen (10 MB)
const MAX_SIZE = 10 * 1024 * 1024;

// Función auxiliar para geocodificar direcciones
export const geocodificarDireccion = async (direccion) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        direccion
      )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const resultado = data.results[0];
      const { lat, lng } = resultado.geometry.location;

      // Extraer componentes de la dirección
      const componentes = resultado.address_components;
      let ciudad = "";
      let estado = "";
      let codigoPostal = "";

      componentes.forEach((comp) => {
        if (comp.types.includes("locality")) ciudad = comp.long_name;
        if (comp.types.includes("administrative_area_level_1"))
          estado = comp.long_name;
        if (comp.types.includes("postal_code")) codigoPostal = comp.long_name;
      });

      return {
        direccion: resultado.formatted_address,
        coordenadas: {
          latitud: lat,
          longitud: lng,
        },
        ciudad,
        estado,
        codigoPostal,
      };
    }

    throw new Error("No se encontró la ubicación");
  } catch (error) {
    throw new Error(`Error al geocodificar: ${error.message}`);
  }
};

// Función auxiliar para mover imágenes
const moverImagenes = (imagenes, origen, destino) => {
  if (!imagenes || !Array.isArray(imagenes)) return;

  imagenes.forEach(img => {
    const nombreArchivo = img.url;
    if (!nombreArchivo) return;

    const rutaOrigen = path.join(origen, nombreArchivo);
    const rutaDestino = path.join(destino, nombreArchivo);

    if (fs.existsSync(rutaOrigen)) {
      fs.renameSync(rutaOrigen, rutaDestino);
    }
  });
};


// 1. CREAR GATO
export const crearGato = async (req, res) => {
  try {
    const datosGato = req.body;

    // Guardar imágenes en carpeta activa
    if (req.files && req.files.length > 0) {
      datosGato.fotos = req.files.map((file) => file.filename);
    }

    // Geocodificar la dirección si se proporciona
    if (datosGato.ubicacion && datosGato.ubicacion.direccion) {
      try {
        const ubicacionGeocodificada = await geocodificarDireccion(
          datosGato.ubicacion.direccion
        );
        datosGato.ubicacion = {
          ...datosGato.ubicacion,
          ...ubicacionGeocodificada,
        };
      } catch (error) {
        return res.status(400).json({
          exito: false,
          mensaje: "Error al procesar la ubicación",
          error: error.message,
        });
      }
    }

    // Agregar el ID del usuario que registra
    datosGato.registradoPor = req.user.userId;

    const nuevoGato = new Gato(datosGato);
    const gatoGuardado = await nuevoGato.save();

    await gatoGuardado.populate("registradoPor", "nombre email");

    res.status(201).json({
      exito: true,
      mensaje: "Gato registrado exitosamente",
      gato: gatoGuardado,
    });
  } catch (error) {
    console.error("Error al crear gato:", error);

    if (error.name === "ValidationError") {
      const errores = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        exito: false,
        mensaje: "Error de validación",
        errores,
      });
    }

    res.status(500).json({
      exito: false,
      mensaje: "Error interno del servidor",
      error: error.message,
    });
  }
};

// 2. OBTENER GATOS CON PAGINACIÓN
export const obtenerGatos = async (req, res) => {
  try {
    const {
      pagina = 1,
      limite = 12,
      estado = "disponible",
      ciudad,
      edad,
      sexo,
      tamaño,
      busqueda,
      latitud,
      longitud,
      distancia = 10,
    } = req.query;

    const saltar = (parseInt(pagina) - 1) * parseInt(limite);

    // Construir filtros
    let filtros = {
      activo: true,
    };

    if (estado && estado !== "todos") {
      filtros.estado = estado;
    }

    if (ciudad) {
      filtros["ubicacion.ciudad"] = new RegExp(ciudad, "i");
    }

    if (edad) {
      filtros.edad = parseInt(edad);
    }

    if (sexo && sexo !== "todos") {
      filtros.sexo = sexo;
    }

    if (tamaño && tamaño !== "todos") {
      filtros.tamaño = tamaño;
    }

    if (busqueda) {
      filtros.$text = { $search: busqueda };
    }

    if (latitud && longitud) {
      filtros["ubicacion.punto"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitud), parseFloat(latitud)],
          },
          $maxDistance: parseFloat(distancia) * 1000,
        },
      };
    }

    const [gatos, total] = await Promise.all([
      Gato.find(filtros)
        .populate("registradoPor", "nombre email")
        .populate("adopcion.adoptante", "nombre email")
        .sort({ fechaRegistro: -1 })
        .skip(saltar)
        .limit(parseInt(limite))
        .lean(),
      Gato.countDocuments(filtros),
    ]);

    const totalPaginas = Math.ceil(total / parseInt(limite));
    const paginaActual = parseInt(pagina);

    res.json({
      exito: true,
      gatos,
      paginacion: {
        paginaActual,
        totalPaginas,
        total,
        limite: parseInt(limite),
        tieneAnterior: paginaActual > 1,
        tieneSiguiente: paginaActual < totalPaginas,
      },
      filtros: {
        estado,
        ciudad,
        edad,
        sexo,
        tamaño,
        busqueda,
        coordenadas:
          latitud && longitud ? { latitud, longitud, distancia } : null,
      },
    });
  } catch (error) {
    console.error("Error al obtener gatos:", error);
    res.status(500).json({
      exito: false,
      mensaje: "Error al obtener los gatos",
      error: error.message,
    });
  }
};

// 3. OBTENER GATO ESPECÍFICO
export const obtenerGatoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        exito: false,
        mensaje: "ID de gato no válido",
      });
    }

    const gato = await Gato.findOne({ _id: id, activo: true })
      .populate("registradoPor", "nombre email telefono")
      .populate("adopcion.adoptante", "nombre email")
      .populate("favoritosPor.usuario", "nombre");

    if (!gato) {
      return res.status(404).json({
        exito: false,
        mensaje: "Gato no encontrado",
      });
    }

    gato.incrementarVistas().catch((err) =>
      console.error("Error al incrementar vistas:", err)
    );

    const gatosSimilares = await Gato.find({
      _id: { $ne: id },
      "ubicacion.ciudad": gato.ubicacion.ciudad,
      estado: "disponible",
      activo: true,
    })
      .limit(4)
      .select("nombre fotos edad sexo")
      .lean();

    res.json({
      exito: true,
      gato,
      gatosSimilares,
    });
  } catch (error) {
    console.error("Error al obtener gato:", error);
    res.status(500).json({
      exito: false,
      mensaje: "Error al obtener el gato",
      error: error.message,
    });
  }
};

// 4. ACTUALIZAR GATO
export const actualizarGato = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("El id es " + id)
    const actualizaciones = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        exito: false,
        mensaje: "ID de gato no válido",
      });
    }

    const gatoExistente = await Gato.findOne({ _id: id, activo: true });

    if (!gatoExistente) {
      return res.status(404).json({
        exito: false,
        mensaje: "Gato no encontrado",
      });
    }

    if (
      gatoExistente.registradoPor.toString() !== req.user.id &&
      req.user.esAdmin
    ) {
      return res.status(403).json({
        exito: false,
        mensaje: "No tienes permisos para actualizar este gato",
      });
    }

    if (req.files && req.files.length > 0) {
      const nuevasImagenes = req.files.map((file) => file.filename);
      actualizaciones.fotos = [
        ...(gatoExistente.fotos || []),
        ...nuevasImagenes,
      ];
    }

    if (actualizaciones.ubicacion && actualizaciones.ubicacion.direccion) {
      try {
        const ubicacionGeocodificada = await geocodificarDireccion(
          actualizaciones.ubicacion.direccion
        );
        actualizaciones.ubicacion = {
          ...actualizaciones.ubicacion,
          ...ubicacionGeocodificada,
        };
      } catch (error) {
        return res.status(400).json({
          exito: false,
          mensaje: "Error al procesar la nueva ubicación",
          error: error.message,
        });
      }
    }

    const gatoActualizado = await Gato.findByIdAndUpdate(id, actualizaciones, {
      new: true,
      runValidators: true,
    }).populate("registradoPor", "nombre email");

    res.json({
      exito: true,
      mensaje: "Gato actualizado exitosamente",
      gato: gatoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar gato:", error);

    if (error.name === "ValidationError") {
      const errores = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        exito: false,
        mensaje: "Error de validación",
        errores,
      });
    }

    res.status(500).json({
      exito: false,
      mensaje: "Error al actualizar el gato",
      error: error.message,
    });
  }
};

// 5. ELIMINAR GATO (Soft Delete + mover imágenes)
export const eliminarGato = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        exito: false,
        mensaje: "ID de gato no válido",
      });
    }

    const gato = await Gato.findOne({ _id: id, activo: true });

    if (!gato) {
      return res.status(404).json({
        exito: false,
        mensaje: "Gato no encontrado",
      });
    }

    if (
      gato.registradoPor.toString() !== req.user.userId &&
      req.user.esAdmin
    ) {
      return res.status(403).json({
        exito: false,
        mensaje: "No tienes permisos para eliminar este gato",
      });
    }

    // Mover imágenes a carpeta OLD
    moverImagenes(gato.fotos, uploadFolder, oldFolder);

    await Gato.findByIdAndUpdate(id, { activo: false });

    res.json({
      exito: true,
      mensaje: "Gato eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar gato:", error);
    res.status(500).json({
      exito: false,
      mensaje: "Error al eliminar el gato",
      error: error.message,
    });
  }
};

// 6. MARCAR COMO ADOPTADO
export const marcarComoAdoptado = async (req, res) => {
  try {
    const { id } = req.params;
    const { adoptanteId, costo, notas } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        exito: false,
        mensaje: "ID de gato no válido",
      });
    }

    const gato = await Gato.findById(id);

    if (!gato) {
      return res.status(404).json({
        exito: false,
        mensaje: "Gato no encontrado",
      });
    }

    if (gato.estado !== "disponible") {
      return res.status(400).json({
        exito: false,
        mensaje: "Este gato no está disponible para adopción",
      });
    }

    gato.estado = "adoptado";
    gato.adopcion.fechaAdopcion = new Date();
    gato.adopcion.adoptante = adoptanteId;
    if (costo) gato.adopcion.costo = costo;
    if (notas) gato.adopcion.notas = notas;

    await gato.save();

    res.json({
      exito: true,
      mensaje: "Gato marcado como adoptado exitosamente",
      gato,
    });
  } catch (error) {
    console.error("Error al marcar como adoptado:", error);
    res.status(500).json({
      exito: false,
      mensaje: "Error al procesar la adopción",
      error: error.message,
    });
  }
};

// 7. BUSCAR GATOS CERCANOS
export const buscarGatosCercanos = async (req, res) => {
  try {
    const { latitud, longitud, distancia = 10 } = req.query;

    if (!latitud || !longitud) {
      return res.status(400).json({
        exito: false,
        mensaje: "Se requieren latitud y longitud",
      });
    }

    const gatos = await Gato.buscarCercanos(
      parseFloat(latitud),
      parseFloat(longitud),
      parseFloat(distancia)
    ).populate("registradoPor", "nombre email");

    res.json({
      exito: true,
      gatos,
      parametros: {
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud),
        distancia: parseFloat(distancia),
      },
    });
  } catch (error) {
    console.error("Error al buscar gatos cercanos:", error);
    res.status(500).json({
      exito: false,
      mensaje: "Error al buscar gatos cercanos",
      error: error.message,
    });
  }
};
