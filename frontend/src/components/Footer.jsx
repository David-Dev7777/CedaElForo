import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ nombreEmpresa }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-blue-950 text-white w-full shadow-lg z-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">

          {/* Logo y copyright */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <p className="text-blue-200 text-xs">
              © {currentYear}{' '}
              <span className="font-semibold text-white">{nombreEmpresa || 'Portal Legal'}</span>
              {' '}— Todos los derechos reservados.
            </p>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-1">
            <Link
              to="/politica-privacidad"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-blue-300 hover:text-white hover:bg-white/10 transition-all duration-150"
            >
              Política de Privacidad
            </Link>
            <span className="text-white/20 text-xs">|</span>
            <Link
              to="/terminos-uso"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-blue-300 hover:text-white hover:bg-white/10 transition-all duration-150"
            >
              Términos de Uso
            </Link>
          </nav>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
