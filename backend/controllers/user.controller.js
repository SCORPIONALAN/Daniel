import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { generartoken } from "../utils/token.js";

// Regex más estricta para emails válidos
const emailRegex = /^(?![.-])([a-zA-Z0-9._%+-]+)@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

export const register = async (req, res) => {
    try {
        const { username, email, password, sexo } = req.body;

        // Validación básica
        if (!username || !email || !password) {
            return res.status(400).json({ mensaje: "Favor de llenar todos los campos" });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({ mensaje: "Correo inválido" });
        }

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                mensaje: "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial"
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ mensaje: "El usuario o correo ya están registrados" });
        }

        // Hashear contraseña
        const salt = await bcrypt.genSalt(12);
        const hashPassword = await bcrypt.hash(password, salt);

        // Crear usuario
        const newUser = new User({
            username,
            email,
            password: hashPassword,
            sexo,
            fechaCreacion: new Date(),
            fechaUltimoAcceso: new Date(),
            esAdmin: false
        });

        await newUser.save();
        generartoken(newUser, res);

        res.status(201).json({ mensaje: "Usuario registrado correctamente" });
    } catch (error) {
        console.error("Error en registro:", error.message);
        res.status(500).json({ mensaje: "Hubo un error en el servidor" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ mensaje: "Favor de llenar todos los campos" });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({ mensaje: "Correo inválido" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ mensaje: "Credenciales incorrectas" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ mensaje: "Credenciales incorrectas" });
        }

        generartoken(user, res);
        res.status(200).json({ mensaje: `Bienvenido ${user.username}` });
    } catch (error) {
        console.error("Error en login:", error.message);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
};

export const checarAutenticado = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ mensaje: "No autenticado", esAdmin: false });
    }

    const { userId, esAdmin } = req.user;

    res.status(200).json({
      userId,
      esAdmin,
      mensaje: "Usuario autenticado"
    });
  } catch (error) {
    console.error("Error en autenticación:", error.message);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};


export const logout = (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        });
        res.status(200).json({ mensaje: "Sesión cerrada correctamente" });
    } catch (error) {
        console.error("Error en logout:", error.message);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
};
