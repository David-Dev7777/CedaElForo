import React from 'react';

// Define el componente Footer con una prop para el nombre de la empresa
const Footer = ({ nombreEmpresa }) => {
  // Obtenemos el año actual
  const currentYear = new Date().getFullYear(); 

  return (
    // <footer className="...">
    // bg-gray-900: Fondo oscuro (casi negro)
    // text-white: Texto blanco
    // w-full: Ancho completo
    // p-4: Padding de 1rem en todos los lados
    // fixed bottom-0: Fija el footer en la parte inferior de la ventana
    // shadow-lg: Agrega una sombra
    <footer className="bg-blue-900 text-white w-full p-4 fixed bottom-0 shadow-lg z-10">
      
      {/* Contenedor del contenido */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
        
        {/* Sección de Copyright */}
        <p className="mb-2 md:mb-0 text-center md:text-left">
          &copy; {currentYear} {nombreEmpresa || 'Mi Aplicación'}. 
          Todos los derechos reservados.
        </p>
        
        {/* Navegación del Footer */}
        <nav className="space-x-4">
          <a 
            href="/politica-privacidad" 
            // text-gray-400: Enlaces de color gris claro
            // hover:text-white: Se vuelven blancos al pasar el mouse
            className="text-gray-400 hover:text-white transition duration-300"
          >
            Política de Privacidad
          </a>
          <span className="text-gray-600">|</span> 
          <a 
            href="/terminos-uso" 
            className="text-gray-400 hover:text-white transition duration-300"
          >
            Términos de Uso
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;