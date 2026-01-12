import React, { useEffect, useState } from 'react';
import axios from 'axios';
import he from 'he';
import BuscadorLey from "../components/BuscadorLey";

// =================================================================
// 1. FUNCIÓN UTILITARIA CLAVE: Maneja las estructuras { "#text": "..." }
// =================================================================
/**
 * Extrae el valor de una propiedad del JSON.
 * @param {string|object} value - El valor que puede ser un string o un objeto con la clave '#text'.
 * @returns {string} El texto decodificado listo para renderizar.
 */
const getValue = (value) => {
    if (!value) return "";

    if (typeof value === "object" && value !== null) {
        const textValue = value["#text"];
        if (textValue !== undefined && textValue !== null) {
            return he.decode(String(textValue));
        }
        return "";
    }

    return he.decode(String(value));
};

// =================================================================
// 1.1 FUNCIÓN PARA RESALTAR TEXTO BUSCADO
// =================================================================
const highlightText = (text, query) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));

    return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
            <mark
                key={i}
                className="bg-yellow-200 text-black px-1 rounded"
            >
                {part}
            </mark>
        ) : (
            part
        )
    );
};

// =================================================================
// 2. COMPONENTE PRINCIPAL: VisorLey
// =================================================================
const VisorLey = () => {
    const [ley, setLey] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [q, setQ] = useState("");

    useEffect(() => {
        const obtenerLey = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/ley-transito');
                setLey(response.data);
            } catch (err) {
                console.error("Error conectando al backend:", err);
                setError("No se pudo cargar la ley. Revisa que el backend esté corriendo.");
            } finally {
                setCargando(false);
            }
        };
        obtenerLey();
    }, []);

    if (cargando) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-blue-600 font-bold text-xl animate-pulse">
                    Cargando Ley de Tránsito...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10 text-center text-red-500 font-bold bg-red-50 border border-red-200 rounded">
                {error}
            </div>
        );
    }

    const titulo = getValue(ley?.Metadatos?.TituloNorma);
    const fecha = getValue(ley?.Identificador?.fechaPublicacion);

    const query = q.trim();
    const filteredEstructuras = query
        ? filterEstructuras(ley?.EstructurasFuncionales, query)
        : null;

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">

                {/* Encabezado */}
                <div className="bg-blue-900 p-6 text-white">
                    <h1 className="text-2xl font-bold mb-2 uppercase tracking-wide">
                        {titulo || 'Ley de Tránsito'}
                    </h1>
                    <div className="flex gap-4 text-sm font-light">
                        <span className="bg-blue-700 px-2 py-1 rounded">Ley N° 18.290</span>
                        <span className="bg-blue-700 px-2 py-1 rounded">
                            Publicación: {fecha}
                        </span>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-8 space-y-4">

                    {/* Buscador */}
                    <BuscadorLey value={q} onChange={setQ} />

                    {query && !filteredEstructuras ? (
                        <div className="p-4 text-center text-gray-600">
                            No se encontraron secciones que coincidan con "{query}".
                        </div>
                    ) : (
                        <ContenidoRecursivo
                            data={query ? filteredEstructuras : ley?.EstructurasFuncionales}
                            query={query}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// =================================================================
// 3. COMPONENTE RECURSIVO: ContenidoRecursivo
// =================================================================
const ContenidoRecursivo = ({ data, query }) => {
    if (!data) return null;

    const itemsToProcess = data.EstructuraFuncional || data;
    const items = Array.isArray(itemsToProcess)
        ? itemsToProcess
        : [itemsToProcess].filter(Boolean);

    return (
        <>
            {items.map((item, idx) => (
                <article key={idx} className="mb-6 border-b border-slate-200 pb-4 last:border-0">

                    {item.Metadatos?.TituloParte && (
                        <h3 className="text-xl font-bold text-blue-900 mb-2 mt-4">
                            {highlightText(
                                getValue(item.Metadatos.TituloParte),
                                query
                            )}
                        </h3>
                    )}

                    {item.Metadatos?.NombreParte && (
                        <p className="text-lg font-semibold text-slate-700 mb-1">
                            Artículo{" "}
                            {highlightText(
                                getValue(item.Metadatos.NombreParte),
                                query
                            )}
                        </p>
                    )}

                    {item.Texto && (
                        <p className="text-slate-600 leading-relaxed text-justify whitespace-pre-line">
                            {highlightText(
                                getValue(item.Texto),
                                query
                            )}
                        </p>
                    )}

                    {item.EstructurasFuncionales && (
                        <div className="pl-4 mt-2 border-l-2 border-blue-100 ml-1">
                            <ContenidoRecursivo
                                data={item.EstructurasFuncionales}
                                query={query}
                            />
                        </div>
                    )}
                </article>
            ))}
        </>
    );
};

// =================================================================
// 4. FILTRADO RECURSIVO
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
    const items = Array.isArray(itemsToProcess)
        ? itemsToProcess
        : [itemsToProcess].filter(Boolean);

    const result = [];

    for (const item of items) {
        let children = null;

        if (item.EstructurasFuncionales) {
            children = filterEstructuras(item.EstructurasFuncionales, q);
        }

        const selfMatches = matchesItem(item, q);

        if (selfMatches || children) {
            const copy = { ...item };
            if (children) copy.EstructurasFuncionales = children;
            result.push(copy);
        }
    }

    return result.length > 0 ? { EstructuraFuncional: result } : null;
}

export default VisorLey;
