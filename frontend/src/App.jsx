import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Importa tus componentes de página
import VisorLey from './page/VisorLey.jsx'; 
import Login from './page/login.jsx'; 
// Asume que Calendario contiene el DatePickerDropdown
import Calendario from './page/calendario.jsx'; 

// --- Componente simple para el Home ---
const Home = () => (
  <div className="p-10 text-center bg-white min-h-[calc(100vh-64px)]"> 
    <h1 className="text-3xl font-bold mb-4 text-gray-800">Bienvenido al Portal Legal</h1>
    <p className="text-gray-600 mb-6">Navega a la sección que deseas visitar.</p>
    <Link 
      to="/ley-transito" 
      className="text-white bg-blue-600 px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out font-semibold"
    >
      Leer Ley de Tránsito
    </Link>
  </div>
);

// --- Componente Principal de la Aplicación ---
export function App() {
  return (
    <BrowserRouter>
      {/* Barra de navegación optimizada */}
      <nav className="bg-gray-800 text-white p-4 shadow-lg">
        <ul className="flex gap-6 items-center max-w-6xl mx-auto">
          {/* Enlace de Marca/Inicio */}
          <li>
            <Link to="/" className="text-lg font-bold hover:text-gray-300 transition duration-100">Portal</Link>
          </li>
          
          {/* Enlaces de Contenido - El ml-auto anterior se quita para que se agrupen */}
          <li>
            <Link to="/ley-transito" className="hover:text-gray-300 transition duration-100">Ley de Tránsito</Link>
          </li>
          
          {/* Nuevo enlace de Calendario */}
          <li>
            <Link to="/calendario" className="hover:text-gray-300 transition duration-100">Calendario</Link>
          </li>
          
          {/* Enlace de Acción (Login) - Usa ml-auto para empujarlo a la derecha */}
          <li className="ml-auto">
            <Link 
              to="/login" 
              className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500 transition duration-100 font-semibold"
            >
              Login
            </Link>
          </li>
        </ul>
      </nav>

      {/* Definición de Rutas */}
      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ley-transito" element={<VisorLey />} />
          <Route path="/calendario" element={<Calendario />} /> {/* Nueva Ruta */}
          <Route path="/login" element={<Login />} /> 
        </Routes>
      </main>
    </BrowserRouter>
  );
}
  
    
  


