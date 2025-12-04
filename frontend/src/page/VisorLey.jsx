import React, { useEffect, useState } from 'react';
import axios from 'axios';
import he from 'he'; // Librería para decodificar entidades HTML


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
    
    // Si es un objeto, intenta acceder a la clave #text
    if (typeof value === "object" && value !== null) {
        // PRIORIDAD: Intentar usar #text, si existe
        const textValue = value["#text"];
        
        if (textValue !== undefined && textValue !== null) {
            return he.decode(String(textValue));
        }
        
        // Manejo de estructuras vacías o atributos
        // En este caso, solo retornamos una cadena vacía para evitar el error de React
        return "";
    }

    // Si ya es un string (o número), solo decodificamos por si acaso
    return he.decode(String(value));
};

// =================================================================
// 2. COMPONENTE PRINCIPAL: VisorLey
// =================================================================
const VisorLey = () => {
    const [ley, setLey] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const obtenerLey = async () => {
            try {
                // Ajusta esta URL si tu API tiene otro path
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

    // Renderizado de estados de carga y error
    if (cargando) return (
        <div className="flex justify-center items-center h-64">
            <div className="text-blue-600 font-bold text-xl animate-pulse">
                Cargando Ley de Tránsito...
            </div>
        </div>
    );

    if (error) return (
        <div className="p-10 text-center text-red-500 font-bold bg-red-50 border border-red-200 rounded">
            {error}
        </div>
    );

    // Los campos de Metadatos deben limpiarse con getValue()
    const titulo = getValue(ley?.Metadatos?.TituloNorma);
    const fecha = getValue(ley?.Identificador?.fechaPublicacion);

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

                {/* Contenido (usa el componente recursivo) */}
                <div className="p-8 space-y-4">
                    <ContenidoRecursivo data={ley?.EstructurasFuncionales} />
                </div>

            </div>
        </div>
    );
};

// =================================================================
// 3. COMPONENTE RECURSIVO: ContenidoRecursivo
// =================================================================
const ContenidoRecursivo = ({ data }) => {
    if (!data) return null;

    // Normalizamos: Si 'data' es un objeto con la clave 'EstructuraFuncional', lo extraemos.
    // Esto es común cuando hay una sola sub-estructura.
    const itemsToProcess = data.EstructuraFuncional || data;
    
    // Aseguramos que 'items' siempre sea un array para poder usar .map()
    const items = Array.isArray(itemsToProcess) ? itemsToProcess : [itemsToProcess].filter(Boolean);

    return (
        <>
            {items.map((item, idx) => (
                <article key={idx} className="mb-6 border-b border-slate-200 pb-4 last:border-0">
                    
                    {/* Título de la Parte o Título (e.g., TÍTULO PRELIMINAR) */}
                    {item.Metadatos?.TituloParte && (
                        <h3 className="text-xl font-bold text-blue-900 mb-2 mt-4">
                            {/* 🚨 Aplicamos getValue() */}
                            {getValue(item.Metadatos.TituloParte)} 
                        </h3>
                    )}
                    
                    {/* Número del Artículo (e.g., Art. 1°) */}
                    {item.Metadatos?.NombreParte && (
                        <p className="text-lg font-semibold text-slate-700 mb-1">
                             Artículo {getValue(item.Metadatos.NombreParte)}
                        </p>
                    )}

                    {/* Texto principal del contenido/artículo */}
                    {item.Texto && (
                        <p className="text-slate-600 leading-relaxed text-justify whitespace-pre-line">
                            {/* 🚨 Aplicamos getValue() al Texto */}
                            {getValue(item.Texto)}
                        </p>
                    )}

                    {/* Llamada Recursiva para sub-estructuras (Artículos dentro de Títulos) */}
                    {item.EstructurasFuncionales && (
                        <div className="pl-4 mt-2 border-l-2 border-blue-100 ml-1">
                            <ContenidoRecursivo data={item.EstructurasFuncionales} />
                        </div>
                    )}
                </article>
            ))}
        </>
    );
};

export default VisorLey;