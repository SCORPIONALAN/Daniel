import jwt from "jsonwebtoken";
export const generartoken = (user, res)=>{
    const token = jwt.sign({userId: user._id, esAdmin: user.esAdmin, username: user.username }, process.env.JWT_SECRET,{
        expiresIn: "7d"
    });
    console.log(token + "si entra aca")
    res.cookie("jwt", token, {
        maxAge: 7*24*60*60*1000, // 7 dias en ms
        httpOnly: true, //Prevencion ataques XSS
        sameSite: "strict", // Prevencion ataques CSRF
        secure: process.env.NODE_ENV !== "development" // Solo sera seguro hasta que sea produccion

    })
    return token;
}