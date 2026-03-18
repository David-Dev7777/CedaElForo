import React from "react";
import { Link } from "react-router-dom";
import Hero from "./Hero.jsx";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Información confiable',
    desc: 'Contenido legal directo desde fuentes oficiales del Estado de Chile.',
    color: 'bg-blue-50 text-blue-600 border-blue-100'
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Respuestas rápidas',
    desc: 'Nuestro asistente con IA responde tus consultas legales en segundos.',
    color: 'bg-violet-50 text-violet-600 border-violet-100'
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Comunidad activa',
    desc: 'Foro donde ciudadanos y expertos debaten temas legales de interés.',
    color: 'bg-teal-50 text-teal-600 border-teal-100'
  },
];

export default function Home() {
  return (
    <div className="w-full -mt-8">

      {/* Hero */}
      <Hero />

      {/* Features */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">¿Por qué elegirnos?</p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Todo lo que necesitas en un solo lugar</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className={`border rounded-2xl p-6 ${f.color.split(' ')[0]} ${f.color.split(' ')[2]}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color.split(' ')[0]} border ${f.color.split(' ')[2]}`}>
                  <span className={f.color.split(' ')[1]}>{f.icon}</span>
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-950 to-blue-900 py-14 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-blue-200 mb-8">
            Crea tu cuenta gratis y accede a toda la información legal que necesitas.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/registro"
              className="bg-white text-blue-900 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Crear cuenta gratis
            </Link>
            <Link
              to="/login"
              className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/20 transition-all duration-200 hover:scale-105"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

