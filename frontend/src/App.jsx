import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { User } from 'lucide-react';
import ProtectedRoute from './components/ProtectedRoute'
import Chatbot from './components/Chatbot'

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
import Foro from "./page/Foro.jsx";
import AdminUsuarios from './page/AdminUsuarios.jsx'
import AdminRoute from './components/AdminRoute'
import ForgotPassword from './page/ForgotPassword.jsx'
import ResetPassword from './page/ResetPassword.jsx'
import PoliticaPrivacidad from "./page/PoliticaPrivacidad.jsx";
import TerminosUso from "./page/TerminosUso.jsx";

const mainNavLinks = [
  { to: "/ley-transito", label: "Ley de Tránsito", isButton: false },
  { to: "/feriados", label: "Feriados Chile", isButton: false },
  { to: "/foro", label: "Foro", isButton: false },
  { to: "/login", label: "Iniciar sesión", isButton: true , icon: User},
  { to: "/registro", label: "Registro", isButton: false }
]

// --- Componente Principal de la Aplicación ---
export function App() {
  return (
    <BrowserRouter>
    <div className="flex flex-col min-h-screen gap-8">
      {/* Barra de navegación optimizada */}
      <NavMenu title="Portal Legal" links={mainNavLinks} /> 

      {/* Chatbot global (se carga en todas las vistas) */}
      <Chatbot />

      {/* Definición de Rutas */}
      <main className="max-w-6xl mx-auto p-4 pb-20 min-h-screen mt-8">
        <Routes>
          {/* Rutas públicas: Home, Login, Registro */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas protegidas (requieren sesión/JWT) */}
          <Route path="/ley-transito" element={<ProtectedRoute><VisorLey /></ProtectedRoute>} />
          <Route path="/Feriados.jsx" element={<ProtectedRoute><Feriados /></ProtectedRoute>} /> {/* Nueva Ruta */}
          <Route path="/foro" element={<ProtectedRoute><Foro /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminUsuarios /></AdminRoute>} />
          {/* puedes añadir más rutas protegidas aquí */}
          <Route path="/ley-transito" element={<VisorLey />} />
          <Route path="/feriados" element={<Feriados />} /> {/* Nueva Ruta */}
          <Route path="/foro" element={<Foro />} />
          <Route path="/login" element={<Login />} /> 
          <Route path="/registro" element={<Registro />} />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/terminos-uso" element={<TerminosUso />} />
        </Routes>
      </main>

      {/* Footer con nombre de la empresa */}
      <Footer nombreEmpresa="Ceda el Foro" className="mt-12" />

      </div>
    </BrowserRouter>
  );
}
  
    
  


