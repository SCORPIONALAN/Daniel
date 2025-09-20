"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ENDPOINTS } from "@/lib/api";

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sexo, setSexo] = useState("macho");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica frontend
    if (!username || !email || !password) {
      setMensaje("Favor de llenar todos los campos");
      return;
    }

    try {
      const res = await fetch(ENDPOINTS.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password, sexo }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMensaje(data.mensaje || "Ocurrió un error");
        return;
      }

      setMensaje(data.mensaje);
      router.push("/pages/login"); // Redirige al login después de registrarse
    } catch (error) {
      console.error("Error en fetch:", error);
      setMensaje("Error al conectar con el servidor");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-orange-50 px-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-20 max-w-md w-full border border-pink-200 relative overflow-hidden">

        {/* Fondo decorativo de gatos */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=600&q=80')] bg-cover bg-center rounded-3xl pointer-events-none"></div>

        {/* Botón de regreso */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-5 left-5 bg-pink-400 text-white font-bold px-4 py-2 rounded-xl hover:bg-pink-500 transition-colors duration-300 z-10"
        >
          ← Regresar
        </button>

        <h2 className="text-4xl font-extrabold text-center text-pink-600 mb-8 drop-shadow-lg z-10 relative">
          Crea tu cuenta en <span className="text-orange-400">CatHub</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nombre de Usuario</label>
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Correo</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Sexo</label>
            <select
              value={sexo}
              onChange={(e) => setSexo(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
            >
              <option value="macho">Macho</option>
              <option value="hembra">Hembra</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-400 text-white font-bold py-2 rounded-xl hover:bg-pink-500 transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            Registrarse
          </button>
        </form>

        {mensaje && (
          <p className="mt-4 text-center text-red-500 font-medium z-10 relative">{mensaje}</p>
        )}

        {/* Link a login */}
        <p className="mt-6 text-center text-gray-700 relative z-10">
          ¿Ya tienes cuenta?{" "}
          <button
            onClick={() => router.push("/pages/login")}
            className="text-pink-400 font-bold hover:text-pink-500 transition-colors duration-300"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}
