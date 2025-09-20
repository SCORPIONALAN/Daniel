"use client";
import Navbar from "@/components/Navbar";
import ProtectedPage from "@/components/ProtectedPage";
import React from "react";
import MapComponent from "@/components/Map"; // Si quieres un mapa de refugios

export default function Home() {
  return (
    <ProtectedPage>
      <Navbar />
      <main className="bg-gray-50 min-h-screen text-gray-800 flex flex-col items-center px-6">
        
        {/* Hero */}
        <section className="w-full max-w-4xl text-center mt-20 mb-16">
          <h2 className="text-5xl font-extrabold mb-6 tracking-wide">
            Bienvenido a <span className="text-orange-500">CatHub</span>
          </h2>
          <p className="text-xl text-gray-600">
            La plataforma para amantes de los gatos: adopciones, noticias y 
            refugios disponibles en <span className="text-green-500">Ciudad de México </span> 
            y <span className="text-green-500"> Guadalajara</span>.
          </p>
        </section>

        {/* Sobre Nosotros */}
        <section className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-10 mb-16">
          <h2 className="text-3xl font-bold mb-6 border-b border-gray-200 pb-3">
            Quiénes Somos
          </h2>
          <p className="text-lg leading-relaxed mb-4 text-gray-700">
            En <span className="text-orange-500 font-semibold">CatHub</span> nos apasiona el bienestar de los gatos. 
            Nuestra misión es conectar a los gatos que necesitan un hogar con 
            personas responsables y amantes de los animales.
          </p>
          <p className="text-lg leading-relaxed mb-4 text-gray-700">
            CatHub es un proyecto académico de la FES Aragón, enfocado en crear 
            una plataforma donde refugios, voluntarios y adoptantes puedan interactuar 
            de manera segura y eficiente. Además, compartimos noticias, tips de cuidado 
            y eventos relacionados con el mundo felino.
          </p>
          <p className="text-lg leading-relaxed text-gray-700">
            Si quieres contactarnos, puedes escribir a <span className="font-semibold">Daniel Cortes Gonzalez</span>, 
            quien lidera este proyecto y se asegura de que cada gato reciba la atención 
            que merece.
          </p>
        </section>

        {/* Sección de imágenes tipo collage */}
        <section className="w-full max-w-6xl mb-16">
          <h2 className="text-3xl font-bold text-center mb-6">Gatos en CatHub</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              "https://nupec.com/wp-content/uploads/2022/02/cat-watching-2021-08-26-15-42-24-utc.jpg",
                "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
                "https://images.unsplash.com/photo-1605460375648-278bcbd579a6",
                "https://nupec.com/wp-content/uploads/2021/02/Captura-de-pantalla-2021-02-08-a-las-13.59.48.png",
                "https://static.nationalgeographicla.com/files/styles/image_3200/public/nationalgeographic_703697.webp?w=1600&h=1121",
                "https://onlyfresh.com/cdn/shop/articles/Amanova_cibo_per_gattini.jpg?v=1643198842&width=1100",
                "https://static.nationalgeographicla.com/files/styles/image_3200/public/75552.jpg?w=1900&h=1267",
                "https://thecatsmile.com/wp-content/uploads/2019/07/que-comen-gatos.jpg",
            ].map((src, index) => (
              <div key={index} className="rounded-xl overflow-hidden shadow-md hover:scale-105 transform transition">
                <img src={src} alt={`Gato ${index + 1}`} className="w-full h-48 object-cover" />
              </div>
            ))}
          </div>
        </section>

        {/* Mapa de refugios */}
        <section className="w-full max-w-5xl mb-16">
          <h2 className="text-3xl font-bold text-center mb-6">Refugios Participantes</h2>
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
            <MapComponent />
          </div>
        </section>
      </main>
    </ProtectedPage>
  );
}
