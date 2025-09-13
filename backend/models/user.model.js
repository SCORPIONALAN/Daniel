import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true
    },
    sexo:{
        type: String,
        required: true
    },
    fechaCreacion:{
        type: Date,
        required: true
    },
    fechaUltimoAcceso:{
        type: Date,
    },
    esAdmin:{
        type: Boolean
    }
});
const Usuario = mongoose.model("Usuario", userSchema);
export default Usuario;