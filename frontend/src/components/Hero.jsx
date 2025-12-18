// src/components/Hero.jsx
import React from "react";
import { Link } from "react-router-dom";


export default function Hero() {
  return (
    <section className="bg-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          Bienvenido al Portal Legal
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Accede fácilmente a leyes, calendarios y recursos legales en un solo lugar.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/ley-transito"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Leer Ley de Tránsito
          </Link>
          <Link
            to="/registro"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg shadow hover:bg-gray-300 transition"
          >
            Crear Cuenta
          </Link>
        </div>
      </div>
    </section>
  );
}