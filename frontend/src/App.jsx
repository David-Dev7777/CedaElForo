import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { User } from 'lucide-react';

// Importa tus componentes de página
import VisorLey from './page/VisorLey.jsx'; 
import Login from './page/login.jsx'; 
import  {NavMenu} from'./page/menu.jsx';
// Asume que Calendario contiene el DatePickerDropdown
import Calendario from './page/calendario.jsx'; 
import Registro from './page/Registro.jsx'
import Carousel from './components/Carousel.jsx';
import Footer from './components/Footer.jsx';

const myImages = [
  "https://articulo.mercadolibre.cl/MLC-615387026-ley-de-transito-sexta-edicion-editorial-juridica-de-chile-_JM",
  "https://www.dercocenter.cl/noticias/guia-de-las-principales-senales-de-transito-en-chile",
  "https://gruasams.cl/leyes/nuevas-leyes-de-transito-en-chile/"
];

// --- Componente simple para el Home ---
const Home = () => (
  <div className="p-10 text-center bg-white min-h-[calc(100vh-64px)]"> 
    <h1 className="text-3xl font-bold mb-4 text-gray-800">Bienvenido al Portal Legal</h1>
    <p className="text-gray-600 mb-6">Navega a la sección que deseas visitar.</p>

    {/* Aquí insertamos el componente Carousel */}
    <div className="mb-10">
      <Carousel images={myImages} autoSlide={true} autoSlideInterval={5000} />
    </div>

    <Link 
      to="/ley-transito" 
      className="text-white bg-blue-600 px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out font-semibold"
    >
      Leer Ley de Tránsito
    </Link>
  </div>
);

const mainNavLinks = [
    { to: "/ley-transito", label: "Ley de Tránsito", isButton: false },
    { to: "/calendario", label: "Calendario", isButton: false },
    { to: "/login",  isButton: true , icon: User},
]

const loginNavLinks = [
    { to: "/registro", label: "registro", isButton: false },
    { to: "/login", label: "Iniciar Sesión", isButton: true },
]

// --- Componente Principal de la Aplicación ---
export function App() {
  return (
    <BrowserRouter>
    <div className="flex flex-col min-h-screen gap-8">
      {/* Barra de navegación optimizada */}
      <NavMenu title="Portal Legal" links={mainNavLinks} /> 

      {/* Definición de Rutas */}
      <main className="max-w-6xl mx-auto p-4 pb-20 min-h-screen mt-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ley-transito" element={<VisorLey />} />
          <Route path="/calendario" element={<Calendario />} /> {/* Nueva Ruta */}
          <Route path="/login" element={<Login />} /> 
          <Route path="/registro" element={<Registro />} />
        </Routes>
      </main>

      {/* Footer con nombre de la empresa */}
      <Footer nombreEmpresa="Ceda el Foro" className="mt-12" />

      </div>
    </BrowserRouter>
  );
}
  
    
  


