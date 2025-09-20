// app/pages/inicio/page.jsx
"use client";
import Navbar from "@/components/Navbar";
import Image from "next/image";

export default function Inicio() {
  const gatos = [
    "https://nupec.com/wp-content/uploads/2022/02/cat-watching-2021-08-26-15-42-24-utc.jpg",
    "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
    "https://images.unsplash.com/photo-1605460375648-278bcbd579a6",
    "https://nupec.com/wp-content/uploads/2021/02/Captura-de-pantalla-2021-02-08-a-las-13.59.48.png",
    "https://static.nationalgeographicla.com/files/styles/image_3200/public/nationalgeographic_703697.webp?w=1600&h=1121",
    "https://onlyfresh.com/cdn/shop/articles/Amanova_cibo_per_gattini.jpg?v=1643198842&width=1100",
    "https://static.nationalgeographicla.com/files/styles/image_3200/public/75552.jpg?w=1900&h=1267",
    "https://thecatsmile.com/wp-content/uploads/2019/07/que-comen-gatos.jpg",
  ];

  return (
    <>
        <Navbar/>
        <div className="w-full max-w-6xl mx-auto">
        {/* Sección principal */}
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-12">
            Bienvenido a CatHub 🐾
        </h1>

        {/* Grid de preguntas */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">¿Quiénes somos?</h2>
            <p className="text-gray-600">
                Somos un grupo de amantes de los gatos comprometidos en rescatar,
                cuidar y encontrar un hogar para felinos en situación vulnerable.
            </p>
            </div>

            <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">
                Iniciativa de proyecto FES Aragón
            </h2>
            <p className="text-gray-600">
                Este proyecto surge en la FES Aragón como una iniciativa social y
                académica para fomentar el cuidado responsable de los animales y la
                adopción consciente.
            </p>
            </div>

            <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">Contacto</h2>
            <p className="text-gray-600">
                <strong>Daniel Cortés González</strong>  
                <br /> Email: daniel.cortes@example.com  
                <br /> Tel: +52 55 1234 5678
            </p>
            </div>
        </div>

        {/* Collage de imágenes */}
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Nuestros michis 🐱
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gatos.map((src, index) => (
            <div
                key={index}
                className="relative w-full h-40 sm:h-48 md:h-56 rounded-xl overflow-hidden shadow-md"
            >
                <Image
                src={`${src}?auto=format&fit=crop&w=600&q=80`}
                alt={`Gato ${index + 1}`}
                fill
                className="object-cover"
                />
            </div>
            ))}
        </div>
        </div>
    </>
  );
}
