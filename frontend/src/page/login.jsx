
import axios from 'axios';

import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';


function LoginForm() {

  const Navigate = useNavigate(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const resetSuccess = location.state?.resetSuccess;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores anteriores

    // validamos que las credenciales no esten vacias
    if (!email || !password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    

    const API_URL = 'http://localhost:4000/api/login';
           try {
            const response = await axios.post(API_URL, { 
                email, 
                password 
            }, {
                withCredentials: true 
            });

            // Login Exitoso: La cookie JWT ya está guardada por el navegador.
            console.log(response.data.message);
            // Guardar userId y userName en localStorage para dependencias como el Foro y notificar a la app
            if (response.data.user) {
              try { localStorage.setItem('userId', String(response.data.user.id)) } catch {}
              try { localStorage.setItem('userName', `${response.data.user.nombre || ''} ${response.data.user.apellido || ''}`.trim()) } catch {}
            }
            // Notificar al NavMenu y otras partes que la auth cambió
            window.dispatchEvent(new Event('auth-changed'))
            // Redirigir al home público (puedes cambiar a otra ruta protegida si prefieres)
            Navigate('/')
        

        } catch (err) {
            console.error("Error en el login:", err);
            
            // 🔥 CAMBIO AQUÍ: Manejar el error JSON enviado por el backend
            if (err.response && err.response.data && err.response.data.error) {
                // Captura el mensaje de error que enviamos en el backend (ej: 'Usuario o contraseña incorrectos')
                setError(err.response.data.error);
            } else {
                // Error de red (servidor caído o CORS)
                setError("Error de conexión. Inténtalo de nuevo.");
            }
        }
       
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Iniciar Sesión </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              autoComplete="current-password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

            {resetSuccess && (
              <p className="text-green-600 text-sm text-center">Contraseña actualizada correctamente. Ya puedes iniciar sesión.</p>
            )}

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              Entrar
            </button>
          </div>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
            ¿Olvidaste tu contraseña?
          </Link>
          {/* Si el error indica bloqueo, dar una indicación clara */}
          {error && (error.toLowerCase().includes('excediste') || error.toLowerCase().includes('bloque')) && (
            <p className="text-yellow-700 text-xs">Si tu cuenta fue bloqueada por intentos fallidos, puedes solicitar restablecer la contraseña o contactar a un administrador.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginForm;