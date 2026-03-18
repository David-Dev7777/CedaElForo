import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Shield } from 'lucide-react';

export const NavMenu = ({ title, links = [] }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        let mounted = true;
        const check = async () => {
            try {
                const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
                const res = await fetch(`${API}/me`, { credentials: 'include' });
                if (!mounted) return;
                if (res.ok) {
                    const data = await res.json().catch(() => ({}));
                    setAuthenticated(true);
                    setUser(data.user || null);
                } else {
                    setAuthenticated(false);
                    setUser(null);
                }
            } catch {
                if (mounted) { setAuthenticated(false); setUser(null); }
            }
        };
        check();
        window.addEventListener('auth-changed', check);
        return () => { mounted = false; window.removeEventListener('auth-changed', check); };
    }, [location]);

    const handleLogout = async () => {
        try {
            const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
            await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' });
        } catch {}
        try { localStorage.removeItem('userId'); localStorage.removeItem('userName'); } catch {}
        setAuthenticated(false);
        setUser(null);
        window.dispatchEvent(new Event('auth-changed'));
        window.location.href = '/';
    };

    const isActive = (to) => location.pathname === to;
    const visibleLinks = links.filter(l => {
        if (authenticated && (l.to === '/login' || l.to === '/registro')) return false;
        return true;
    });

    const userName = (user && user.nombre) || localStorage.getItem('userName');

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${
            scrolled
                ? 'bg-blue-950/95 backdrop-blur-md shadow-lg shadow-blue-950/20'
                : 'bg-blue-950'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                        </div>
                        <span className="text-white font-bold text-lg tracking-tight group-hover:text-blue-200 transition-colors">
                            {title || 'Portal Legal'}
                        </span>
                    </Link>

                    {/* Links desktop */}
                    <div className="hidden md:flex items-center gap-1">
                        {visibleLinks.filter(l => !l.isButton).map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                                    isActive(link.to)
                                        ? 'text-white bg-white/15'
                                        : 'text-blue-200 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                {link.icon && <link.icon className="w-3.5 h-3.5" />}
                                {link.label}
                                {isActive(link.to) && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-400 rounded-full"></span>
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Lado derecho desktop */}
                    <div className="hidden md:flex items-center gap-2">
                        {authenticated ? (
                            <>
                                {user?.tipo_usuario === 'administrador' && (
                                    <Link
                                        to="/admin"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 border border-amber-400/20 transition-all"
                                    >
                                        <Shield className="w-3 h-3" />
                                        Admin
                                    </Link>
                                )}
                                <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                                    <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold text-white">
                                        {userName ? userName.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <span className="text-blue-200 text-sm font-medium">{userName}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="ml-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-white/10 hover:bg-red-500/80 border border-white/10 hover:border-red-400/50 transition-all duration-200"
                                >
                                    Salir
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                {visibleLinks.filter(l => l.isButton).map(link => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-white text-blue-900 hover:bg-blue-50 transition-colors shadow-sm"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Botón móvil */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Menú móvil */}
            <div className={`md:hidden transition-all duration-300 overflow-hidden ${
                isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
                <div className="px-4 pb-4 pt-2 space-y-1 border-t border-white/10">
                    {visibleLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                isActive(link.to)
                                    ? 'bg-white/15 text-white'
                                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {link.icon && <link.icon className="w-4 h-4" />}
                            {link.label}
                        </Link>
                    ))}

                    {authenticated && (
                        <div className="pt-2 border-t border-white/10 space-y-2">
                            <div className="flex items-center gap-2 px-3 py-2">
                                <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold text-white">
                                    {userName ? userName.charAt(0).toUpperCase() : '?'}
                                </div>
                                <span className="text-blue-200 text-sm">{userName}</span>
                            </div>
                            {user?.tipo_usuario === 'administrador' && (
                                <Link
                                    to="/admin"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-amber-400/20 text-amber-300"
                                >
                                    <Shield className="w-4 h-4" />
                                    Panel Admin
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
