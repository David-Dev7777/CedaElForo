// NavMenu.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'; // Importamos Link para navegación SPA
import { Menu, X } from 'lucide-react'; 

// Recibimos las props 'title' y 'links'
export const NavMenu = ({ title, links = [] }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [authenticated, setAuthenticated] = useState(false)
    const [user, setUser] = useState(null)

    const location = useLocation()

    useEffect(() => {
        let mounted = true
        const check = async () => {
            try {
                const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
                const res = await fetch(`${API}/api/me`, { credentials: 'include' })
                if (!mounted) return
                if (res.ok) {
                    const data = await res.json().catch(() => ({}))
                    setAuthenticated(true)
                    setUser(data.user || null)
                } else {
                    setAuthenticated(false)
                    setUser(null)
                }
            } catch (err) {
                if (!mounted) return
                setAuthenticated(false)
                setUser(null)
            }
        }

        check()

        const onAuthChanged = () => {
            // Re-ejecutar la comprobación en caso de login/logout en otra parte de la app
            check()
        }

        window.addEventListener('auth-changed', onAuthChanged)

        return () => { mounted = false; window.removeEventListener('auth-changed', onAuthChanged) }
    }, [location]) // re-ejecutar al cambiar de ruta para detectar login/logout

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    }
    
    // Si no se proporcionan enlaces, usamos un array vacío por defecto.
    // El 'title' se usará en el encabezado.
    
    return (
        // 1. Contenedor principal del menú (barra de navegación)
        <nav className="bg-blue-900 p-4 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                
                {/* 2. Título o Logo: Usa la prop 'title' */}
                <Link to="/" className="text-white text-2xl font-bold hover:text-blue-200 transition duration-150">
                    {title || "Menú"} {/* Muestra la prop o un valor por defecto */}
                </Link>

                {/* 3. Botón para el menú móvil (Sin cambios) */}
                <button 
                    onClick={toggleMenu} 
                    className="md:hidden text-white focus:outline-none"
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* 4. Lista de enlaces de navegación: Iteramos sobre la prop 'links' */}
                <ul 
                    className={`
                        md:flex md:space-x-8
                        absolute md:static top-16 left-0 w-full md:w-auto
                        bg-blue-600 md:bg-transparent p-4 md:p-0
                        flex-col md:flex-row space-y-2 md:space-y-0
                        transition-all duration-300 ease-in-out
                        ${isMenuOpen ? 'block' : 'hidden'}
                    `}
                >
                    {links
                        .filter(l => {
                            // Oculta los enlaces de login/registro si ya estamos autenticados
                            if (authenticated && (l.to === '/login' || l.to === '/registro')) return false
                            return true
                        })
                        .map((link) => (
                        <li key={link.to}>
                            <Link 
                                to={link.to} 
                                onClick={toggleMenu} // Cierra el menú en móvil al hacer click
                                className={`
                                    block py-2 md:py-0 transition duration-150 font-medium
                                    ${link.isButton 
                                        ? 'bg-white text-blue-600 px-4 rounded-lg hover:bg-blue-100 mt-2 md:mt-0 font-semibold'
                                        : 'text-white hover:text-blue-200'
                                    }
                                `}
                            >
                                {link.label}
                                {link.icon && <link.icon className="inline w-4 h-4 ml-1" />}
                            </Link>
                        </li>
                    ))}

                    {/* Estado de autenticación: muestra botón de cerrar sesión si está autenticado */}
                    {authenticated ? (
                        <li>
                            <div className="flex items-center gap-3">
                                {((user && user.nombre) || localStorage.getItem('userName')) && (
                                    <span className="text-white hidden md:inline">{(user && user.nombre) || localStorage.getItem('userName')}</span>
                                )}
                                {/* Enlace admin */}
                                {user?.tipo_usuario === 'administrador' && (
                                    <Link to="/admin" className="ml-3 bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-medium">Admin</Link>
                                )}
                                <button
                                    onClick={async () => {
                                        try {
                                            const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
                                            await fetch(`${API}/api/logout`, { method: 'POST', credentials: 'include' })
                                        } catch (err) {
                                            // ignorar error
                                        }
                                        // Limpiar estado local inmediatamente
                                        try { localStorage.removeItem('userId'); localStorage.removeItem('userName') } catch {}
                                        setAuthenticated(false)
                                        setUser(null)
                                        // Notificar a otros componentes
                                        window.dispatchEvent(new Event('auth-changed'))
                                        // Forzar recarga a la landing pública
                                        window.location.href = '/'
                                    }}
                                    className="bg-white text-blue-600 px-4 rounded-lg hover:bg-blue-100 mt-2 md:mt-0 font-semibold"
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        </li>
                    ) : null}
                </ul>
            </div>
        </nav>
    )
}