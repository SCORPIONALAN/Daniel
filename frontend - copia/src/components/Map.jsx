"use client";

import { useEffect, useRef } from "react";

export default function MapComponent() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD2xkNKHun9x2ibBsC403nzSWq-ksqC7aE`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (!mapRef.current) return;

      // Crear mapa centrado en Ciudad de México
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 19.432608, lng: -99.133209 },
        zoom: 5,
      });

      // Marcadores de refugios (puedes modificar estos datos)
      const refugios = [
        { nombre: "Refugio Gatos CDMX", lat: 19.432608, lng: -99.133209 },
        { nombre: "Refugio Gatitos Guadalajara", lat: 20.659698, lng: -103.349609 },
        { nombre: "Refugio Peludos Puebla", lat: 19.041297, lng: -98.206197 },
      ];

      refugios.forEach((refugio) => {
        new window.google.maps.Marker({
          position: { lat: refugio.lat, lng: refugio.lng },
          map,
          title: refugio.nombre,
        });
      });
    }
  }, []);

  return (
    <div
      ref={mapRef}
      className="w-full h-96 rounded-2xl border border-gray-300 shadow-md"
    />
  );
}
