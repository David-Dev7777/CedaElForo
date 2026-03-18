import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 min-h-[88vh] flex items-center">

      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-800/10 rounded-full blur-3xl"></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Lado izquierdo — texto */}
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-blue-100 text-xs font-semibold uppercase tracking-widest">Portal Legal Chile</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Tu guía legal
              <span className="block text-blue-300 mt-1">al alcance</span>
              <span className="block text-white">de todos</span>
            </h1>

            <p className="text-blue-200 text-lg leading-relaxed mb-8 max-w-lg">
              Accede a la Ley de Tránsito chilena, consulta feriados, participa en el foro legal y resuelve tus dudas con nuestro asistente inteligente.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/ley-transito"
                className="inline-flex items-center gap-2 bg-white text-blue-900 font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-blue-50 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Ver Ley de Tránsito
              </Link>
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Crear cuenta gratis
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-white/10">
              {[
                { label: 'Artículos legales', value: '+300' },
                { label: 'Usuarios activos', value: '+150' },
                { label: 'Consultas al foro', value: '+500' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-blue-300 text-xs font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Lado derecho — cards de features */}
          <div className={`transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  ),
                  title: 'Ley de Tránsito',
                  desc: 'Ley N°18.290 completa y con buscador',
                  color: 'from-blue-600 to-blue-700',
                  to: '/ley-transito'
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  ),
                  title: 'Foro Legal',
                  desc: 'Consultas y debates de la comunidad',
                  color: 'from-indigo-600 to-indigo-700',
                  to: '/foro'
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  ),
                  title: 'Asistente IA',
                  desc: 'Resuelve dudas legales al instante',
                  color: 'from-violet-600 to-violet-700',
                  to: '/ley-transito'
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ),
                  title: 'Feriados Chile',
                  desc: 'Calendario oficial actualizado',
                  color: 'from-teal-600 to-teal-700',
                  to: '/feriados'
                },
              ].map((card, i) => (
                <Link
                  key={i}
                  to={card.to}
                  className="group bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/25 backdrop-blur-sm rounded-2xl p-5 transition-all duration-200 hover:scale-105 hover:shadow-xl"
                >
                  <div className={`w-11 h-11 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                    {card.icon}
                  </div>
                  <p className="text-white font-semibold text-sm mb-1">{card.title}</p>
                  <p className="text-blue-300 text-xs leading-relaxed">{card.desc}</p>
                </Link>
              ))}
            </div>

            {/* Chatbot hint */}
            <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Asistente legal disponible 24/7</p>
                <p className="text-blue-300 text-xs">Haz clic en el botón 💬 para consultar sobre la Ley de Tránsito</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
