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
import Footer from './components/Footer.jsx';
import Hero from './components/Hero.jsx';
import Home from './components/Home.jsx';
import Feriados from './page/Feriados.jsx';

const mainNavLinks = [
    { to: "/ley-transito", label: "Ley de Tránsito", isButton: false },
    { to: "/Feriados.jsx", label: "Feriados Chile", isButton: false },
    { to: "/login",  isButton: true , icon: User},
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
          <Route path="/Feriados.jsx" element={<Feriados />} /> {/* Nueva Ruta */}
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
  
    
  


