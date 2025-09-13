import mongoose from 'mongoose';
// Schema para las coordenadas geográficas
const CoordenadasSchema = new mongoose.Schema({
  latitud: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitud: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  }
}, { _id: false });

// Schema para la ubicación completa
const UbicacionSchema = new mongoose.Schema({
  direccion: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  coordenadas: {
    type: CoordenadasSchema,
    required: true
  },
  ciudad: {
    type: String,
    trim: true,
    maxlength: 100
  },
  estado: {
    type: String,
    trim: true,
    maxlength: 100
  },
  codigoPostal: {
    type: String,
    trim: true,
    maxlength: 10
  },
  // Para búsquedas geoespaciales más eficientes
  punto: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitud, latitud] - ORDEN IMPORTANTE para GeoJSON
      required: true
    }
  }
}, { _id: false });

// Schema para información médica
const InfoMedicaSchema = new mongoose.Schema({
  vacunas: [{
    nombre: String,
    fecha: Date,
    veterinario: String
  }],
  esterilizado: {
    type: Boolean,
    default: false
  },
  condicionesMedicas: [String],
  ultimaRevision: Date,
  veterinarioEncargado: String
}, { _id: false });

// Schema principal del gato
const GatoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del gato es obligatorio'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  
  edad: {
    type: Number,
    min: [0, 'La edad no puede ser negativa'],
    max: [30, 'Edad máxima no válida']
  },
  
  // Edad aproximada si no se conoce exactamente
  edadAproximada: {
    type: String,
    enum: ['cachorro', 'joven', 'adulto', 'senior'],
    required: function() {
      return !this.edad;
    }
  },
  
  sexo: {
    type: String,
    enum: ['macho', 'hembra'],
    required: true
  },
  
  raza: {
    type: String,
    default: 'Mestizo',
    trim: true,
    maxlength: 50
  },
  
  color: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  tamaño: {
    type: String,
    enum: ['pequeño', 'mediano', 'grande'],
    required: true
  },
  
  estado: {
    type: String,
    enum: ['disponible', 'adoptado', 'en_tratamiento', 'reservado', 'no_disponible'],
    default: 'disponible'
  },
  
  // Información de comportamiento
  personalidad: [{
    type: String,
    enum: ['cariñoso', 'juguetón', 'tranquilo', 'activo', 'tímido', 'sociable', 'independiente']
  }],
  
  buenoCon: {
    niños: { type: Boolean, default: null },
    perros: { type: Boolean, default: null },
    otrosGatos: { type: Boolean, default: null }
  },
  
  // Fotos del gato
  fotos: [{
    url: {
      type: String,
      required: true
    },
    descripcion: String,
    esPrincipal: {
      type: Boolean,
      default: false
    },
    fechaSubida: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Información de ubicación (tu consulta principal)
  ubicacion: {
    type: UbicacionSchema,
    required: true
  },
  
  // Información médica
  infoMedica: InfoMedicaSchema,
  
  // Información de contacto del refugio/cuidador
  contacto: {
    nombreRefugio: String,
    telefono: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /\d{10}/.test(v); // Validación básica para teléfono
        },
        message: 'Número de teléfono no válido'
      }
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Email no válido'
      }
    },
    horarioAtencion: String
  },
  
  // Información de adopción
  adopcion: {
    requisitos: [String],
    costo: {
      type: Number,
      min: 0,
      default: 0
    },
    incluye: [String], // vacunas, esterilización, etc.
    fechaAdopcion: Date,
    adoptante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    }
  },
  
  // Metadatos
  fechaRegistro: {
    type: Date,
    default: Date.now
  },
  
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  
  registradoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  
  // Para analytics y estadísticas
  vistas: {
    type: Number,
    default: 0
  },
  
  favoritosPor: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    },
    fecha: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Campo para soft delete
  activo: {
    type: Boolean,
    default: true
  }
  
}, {
  timestamps: true, // Agrega automáticamente createdAt y updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar las consultas
GatoSchema.index({ estado: 1 });
GatoSchema.index({ 'ubicacion.punto': '2dsphere' }); // Para búsquedas geoespaciales
GatoSchema.index({ fechaRegistro: -1 });
GatoSchema.index({ nombre: 'text', descripcion: 'text' }); // Para búsquedas de texto
GatoSchema.index({ 'ubicacion.ciudad': 1, estado: 1 });

// Middleware para actualizar fechaActualizacion
GatoSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  
  // Sincronizar coordenadas con punto GeoJSON
  if (this.ubicacion && this.ubicacion.coordenadas) {
    this.ubicacion.punto = {
      type: 'Point',
      coordinates: [
        this.ubicacion.coordenadas.longitud,
        this.ubicacion.coordenadas.latitud
      ]
    };
  }
  
  // Asegurar que solo una foto sea principal
  if (this.fotos && this.fotos.length > 0) {
    const fotosPrincipales = this.fotos.filter(foto => foto.esPrincipal);
    if (fotosPrincipales.length > 1) {
      this.fotos.forEach((foto, index) => {
        foto.esPrincipal = index === 0;
      });
    }
  }
  
  next();
});

// Métodos virtuales
GatoSchema.virtual('edadFormateada').get(function() {
  if (this.edad) {
    return this.edad === 1 ? '1 año' : `${this.edad} años`;
  }
  return this.edadAproximada;
});

GatoSchema.virtual('fotoPrincipal').get(function() {
  const fotoPrincipal = this.fotos.find(foto => foto.esPrincipal);
  return fotoPrincipal || this.fotos[0] || null;
});

// Métodos estáticos
GatoSchema.statics.buscarCercanos = function(latitud, longitud, distanciaKm = 10) {
  return this.find({
    'ubicacion.punto': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitud, latitud]
        },
        $maxDistance: distanciaKm * 1000 // Convertir km a metros
      }
    },
    estado: 'disponible',
    activo: true
  });
};

GatoSchema.statics.buscarPorCiudad = function(ciudad) {
  return this.find({
    'ubicacion.ciudad': new RegExp(ciudad, 'i'),
    estado: 'disponible',
    activo: true
  }).sort({ fechaRegistro: -1 });
};

// Métodos de instancia
GatoSchema.methods.marcarComoAdoptado = function(adoptante) {
  this.estado = 'adoptado';
  this.adopcion.fechaAdopcion = new Date();
  this.adopcion.adoptante = adoptante;
  return this.save();
};

GatoSchema.methods.incrementarVistas = function() {
  this.vistas += 1;
  return this.save();
};

export default mongoose.model('Gato', GatoSchema);