"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ENDPOINTS } from "@/lib/api";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [isAdmin, setAdmin] = useState(false);
  const router = useRouter();

  // Verificar sesión
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(ENDPOINTS.checkAuth, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) {
          setIsLogged(false);
          return;
        }

        const data = await res.json();
        setAdmin(data.esAdmin);
        setIsLogged(true);
      } catch {
        setIsLogged(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(ENDPOINTS.logout, { method: "POST", credentials: "include" });
      setIsLogged(false);
      router.replace("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <nav className="bg-white shadow-md rounded-xl p-4 flex items-center justify-between max-w-7xl mx-auto">
      {/* LOGO */}
      <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-pink-500">
        CatHub
      </Link>

      {/* Menú hamburguesa para mobile */}
      <button
        className="sm:hidden px-3 py-2 border rounded-md text-gray-700 border-gray-400"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "Cerrar" : "Menú"}
      </button>

      {/* Links */}
      <div
        className={`flex-col sm:flex-row sm:flex gap-4 mt-4 sm:mt-0 ${
          isOpen ? "flex" : "hidden"
        }`}
      >
        {!isLogged ? (
          <>
            <Link href="/pages/nosotros" className="px-3 py-2 rounded-md hover:bg-pink-100 transition">
              Quienes Somos
            </Link>
            <Link href="/pages/login" className="px-3 py-2 rounded-md hover:bg-pink-100 transition">
              Inicia Sesion
            </Link>
            <Link href="/pages/register" className="px-3 py-2 rounded-md hover:bg-pink-100 transition">
              Registrate!
            </Link>
          </>
        ) : (
          <>
            <Link href="/pages/home" className="px-3 py-2 rounded-md hover:bg-pink-100 transition">
              Home
            </Link>
            <Link href="/pages/noticias" className="px-3 py-2 rounded-md hover:bg-pink-100 transition">
              Noticias
            </Link>
            {isAdmin && (
              <Link href="/pages/crea-noticia" className="px-3 py-2 rounded-md hover:bg-pink-100 transition">
                Agrega Noticia
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-pink-400 text-white rounded-md hover:bg-pink-500 transition"
            >
              Cerrar Sesión
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
