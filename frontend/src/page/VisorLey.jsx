import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import he from 'he';

// =================================================================
// UTILIDADES
// =================================================================
const getValue = (value) => {
    if (!value) return "";
    if (typeof value === "object" && value !== null) {
        const textValue = value["#text"];
        if (textValue !== undefined && textValue !== null) return he.decode(String(textValue));
        return "";
    }
    return he.decode(String(value));
};

const highlightText = (text, query, activeIndex, matchIndexRef) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi"));
    return parts.map((part, i) => {
        if (part.toLowerCase() !== query.toLowerCase()) return part;
        const currentIndex = matchIndexRef.current++;
        const isActive = currentIndex === activeIndex;
        return (
            <mark
                key={i}
                data-match-index={currentIndex}
                className={`px-0.5 rounded transition-colors duration-200 ${isActive
                    ? 'bg-orange-400 text-white'
                    : 'bg-yellow-200 text-gray-900'
                    }`}
            >
                {part}
            </mark>
        );
    });
};

// =================================================================
// FILTRADO
// =================================================================
function matchesItem(item, q) {
    if (!q) return true;
    const qq = q.toLowerCase();
    const fields = [];
    if (item.Metadatos) {
        fields.push(getValue(item.Metadatos.TituloParte || ''));
        fields.push(getValue(item.Metadatos.NombreParte || ''));
        fields.push(getValue(item.Metadatos.TituloNorma || ''));
    }
    if (item.Texto) fields.push(getValue(item.Texto));
    return fields.some(f => f && f.toLowerCase().includes(qq));
}

function filterEstructuras(data, q) {
    if (!data) return null;
    const itemsToProcess = data.EstructuraFuncional || data;
    const items = Array.isArray(itemsToProcess) ? itemsToProcess : [itemsToProcess].filter(Boolean);
    const result = [];
    for (const item of items) {
        let children = null;
        if (item.EstructurasFuncionales) children = filterEstructuras(item.EstructurasFuncionales, q);
        const selfMatches = matchesItem(item, q);
        if (selfMatches || children) {
            const copy = { ...item };
            if (children) copy.EstructurasFuncionales = children;
            result.push(copy);
        }
    }
    return result.length > 0 ? { EstructuraFuncional: result } : null;
}

function countMatches(data, q) {
    if (!data || !q) return 0;
    const itemsToProcess = data.EstructuraFuncional || data;
    const items = Array.isArray(itemsToProcess) ? itemsToProcess : [itemsToProcess].filter(Boolean);
    let count = 0;
    for (const item of items) {
        const fields = [];
        if (item.Metadatos) {
            fields.push(getValue(item.Metadatos.TituloParte || ''));
            fields.push(getValue(item.Metadatos.NombreParte || ''));
        }
        if (item.Texto) fields.push(getValue(item.Texto));
        for (const f of fields) {
            const matches = f.toLowerCase().split(q.toLowerCase()).length - 1;
            count += matches;
        }
        if (item.EstructurasFuncionales) count += countMatches(item.EstructurasFuncionales, q);
    }
    return count;
}



// =================================================================
// COMPONENTE RECURSIVO
// =================================================================
const ContenidoRecursivo = ({ data, query, activeMatch, matchIndexRef, depth = 0 }) => {
    if (!data) return null;
    const itemsToProcess = data.EstructuraFuncional || data;
    const items = Array.isArray(itemsToProcess) ? itemsToProcess : [itemsToProcess].filter(Boolean);

    return (
        <>
            {items.map((item, idx) => {
                const titulo = item.Metadatos?.TituloParte ? getValue(item.Metadatos.TituloParte) : null;
                const nombre = item.Metadatos?.NombreParte ? getValue(item.Metadatos.NombreParte) : null;
                const texto = item.Texto ? getValue(item.Texto) : null;
                const isTopLevel = depth === 0;

                const descargarPDF = async () => {
                    try {
                        const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
                        const response = await fetch(`${API}/ley-transito/pdf`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({
                                titulo,
                                nombre,
                                texto,
                                hijos: item.EstructurasFuncionales || null  // enviar hijos
                            })
                        })
                        if (!response.ok) throw new Error('Error generando PDF')
                        const blob = await response.blob()
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `ley18290-art${nombre || 'articulo'}.pdf`
                        a.click()
                        URL.revokeObjectURL(url)
                    } catch (err) {
                        console.error('Error descargando PDF:', err)
                    }
                }

                return (
                    <article
                        key={idx}
                        className={`${isTopLevel
                            ? 'mb-2 rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200'
                            : 'mb-3'
                            }`}
                    >
                        {titulo && isTopLevel && (
                            <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-5 py-3 flex items-center justify-between gap-3">
                                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                                    {highlightText(titulo, query, activeMatch, matchIndexRef)}
                                </h3>
                                <button
                                    onClick={descargarPDF}
                                    title="Descargar artículo en PDF"
                                    className="flex-shrink-0 flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-150"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    PDF
                                </button>
                            </div>
                        )}

                        {titulo && !isTopLevel && (
                            <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-2 mt-3 flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-500 rounded-full inline-block"></span>
                                {highlightText(titulo, query, activeMatch, matchIndexRef)}
                            </h4>
                        )}

                        <div className={isTopLevel ? 'p-5' : ''}>
                            {nombre && (
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 whitespace-nowrap">
                                        Art.
                                    </span>
                                    <p className="text-sm font-semibold text-slate-700">
                                        {highlightText(nombre, query, activeMatch, matchIndexRef)}
                                    </p>
                                </div>
                            )}

                            {texto && (
                                <p className="text-sm text-slate-600 leading-relaxed text-justify">
                                    {highlightText(texto, query, activeMatch, matchIndexRef)}
                                </p>
                            )}

                            {item.EstructurasFuncionales && (
                                <div className={`mt-3 ${depth === 0 ? 'pl-3 border-l-2 border-blue-100' : 'pl-2 border-l border-slate-200'}`}>
                                    <ContenidoRecursivo
                                        data={item.EstructurasFuncionales}
                                        query={query}
                                        activeMatch={activeMatch}
                                        matchIndexRef={matchIndexRef}
                                        depth={depth + 1}
                                    />
                                </div>
                            )}
                        </div>
                    </article>
                );
            })}
        </>
    );
};

// =================================================================
// COMPONENTE PRINCIPAL
// =================================================================
const VisorLey = () => {
    const [ley, setLey] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [q, setQ] = useState("");
    const [activeMatch, setActiveMatch] = useState(0);
    const [totalMatches, setTotalMatches] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const searchRef = useRef(null);
    const contentRef = useRef(null);
    const matchIndexRef = useRef(0);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

    useEffect(() => {
        const obtenerLey = async () => {
            try {
                const response = await axios.get(`${API_URL}/`);
                setLey(response.data);
            } catch (err) {
                setError("No se pudo cargar la ley. Revisa que el backend esté corriendo.");
            } finally {
                setCargando(false);
            }
        };
        obtenerLey();
    }, []);

    // Debounce busqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setQ(searchInput);
            setActiveMatch(0);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Contar coincidencias
    useEffect(() => {
        if (!q || !ley) { setTotalMatches(0); return; }
        const filtered = filterEstructuras(ley?.EstructurasFuncionales, q);
        const count = filtered ? countMatches(filtered, q) : 0;
        setTotalMatches(count);
        setActiveMatch(0);
    }, [q, ley]);

    // Navegar a match activo
    useEffect(() => {
        if (!q) return;
        const el = contentRef.current?.querySelector(`[data-match-index="${activeMatch}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [activeMatch, q]);

    const handlePrev = () => setActiveMatch(i => (i - 1 + totalMatches) % totalMatches);
    const handleNext = () => setActiveMatch(i => (i + 1) % totalMatches);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); handleNext(); }
        if (e.key === 'Escape') { setSearchInput(''); searchRef.current?.blur(); }
    };

    if (cargando) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-blue-800 font-semibold text-lg">Cargando Ley de Tránsito...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md">
                    <div className="text-red-400 text-4xl mb-3">⚠</div>
                    <p className="text-red-700 font-semibold">{error}</p>
                </div>
            </div>
        );
    }

    const titulo = getValue(ley?.Metadatos?.TituloNorma);
    const fecha = getValue(ley?.Identificador?.fechaPublicacion);
    const query = q.trim();
    const filteredEstructuras = query ? filterEstructuras(ley?.EstructurasFuncionales, query) : null;
    matchIndexRef.current = 0;

    return (
        <div className="min-h-screen bg-slate-100 font-sans">

            {/* Header estático — solo título y badges */}
            <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                            <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-0.5">República de Chile</p>
                            <h1 className="text-xl font-bold leading-tight">Ley de Tránsito N° 18.290</h1>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        <span className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                            Ley N° 18.290
                        </span>
                        <span className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                            Publicación: {fecha}
                        </span>
                    </div>
                </div>
            </div>

            {/* Buscador sticky */}
            <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-2.5">
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            ref={searchRef}
                            type="text"
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Buscar en la ley... (ej: multa, licencia, velocidad)"
                            className="flex-1 text-slate-800 placeholder-slate-400 text-sm focus:outline-none bg-transparent py-0.5"
                        />
                        {query && totalMatches > 0 && (
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-500 whitespace-nowrap bg-white px-2 py-1 rounded-lg border border-slate-200">
                                    {activeMatch + 1} / {totalMatches}
                                </span>
                                <button onClick={handlePrev} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                </button>
                                <button onClick={handleNext} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <button onClick={() => setSearchInput('')} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {query && totalMatches === 0 && (
                            <span className="text-xs text-red-400 whitespace-nowrap">Sin resultados</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-5xl mx-auto px-6 py-8" ref={contentRef}>

                {query && (
                    <div className="mb-4 flex items-center gap-2">
                        <span className="text-sm text-slate-500">
                            {totalMatches > 0
                                ? <><span className="font-semibold text-blue-700">{totalMatches}</span> coincidencias para <span className="font-semibold text-slate-700">"{query}"</span></>
                                : <>No se encontraron resultados para <span className="font-semibold text-slate-700">"{query}"</span></>
                            }
                        </span>
                    </div>
                )}

                {query && !filteredEstructuras ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                        <div className="text-slate-300 text-5xl mb-4">🔍</div>
                        <p className="text-slate-500 font-medium">No se encontraron secciones que coincidan con "{query}"</p>
                        <button onClick={() => setSearchInput('')} className="mt-4 text-blue-600 text-sm hover:underline">Limpiar búsqueda</button>
                    </div>
                ) : (
                    <ContenidoRecursivo
                        data={query ? filteredEstructuras : ley?.EstructurasFuncionales}
                        query={query}
                        activeMatch={activeMatch}
                        matchIndexRef={matchIndexRef}
                    />
                )}
            </div>
        </div>
    );
};

export default VisorLey;