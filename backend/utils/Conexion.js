import mongoose from "mongoose";
export const DBconnection = async() =>{
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("Conexion correcta");
    } catch (error) {
        console.log("Fallo la conexión");
    }
}