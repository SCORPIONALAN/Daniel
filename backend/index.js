import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { DBconnection } from './utils/Conexion.js';
import user from './routes/user.route.js';
import gatos from './routes/gato.route.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))

app.use("/api/usuarios", user)
app.use("/api/gatos", gatos);
// Si no existe la ruta
app.use((req, res, next) => {
    res.status(404).json({ 
        status: 404, 
        message: "Página no encontrada" 
    });
});

// Por si se cae el server
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: 500, message: "Error en el servidor" });
});

// Corre el servicio
app.listen(PORT, ()=>{
    console.log("Servidor Corriendo desde ", PORT);
    DBconnection();
})