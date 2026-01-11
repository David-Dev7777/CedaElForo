import { useMemo, useState } from "react";
import he from "he";

const normalizarTexto = (texto = "") =>
  he
    .decode(String(texto))
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const extraerArticulos = (estructura, acumulado = []) => {
  if (!estructura) return acumulado;

  const items = estructura.EstructuraFuncional || estructura;
  const array = Array.isArray(items) ? items : [items];

  array.forEach((item) => {
    if (item.Texto) {
      acumulado.push({
        titulo: item.Metadatos?.NombreParte || "Artículo",
        texto: item.Texto,
      });
    }

    if (item.EstructurasFuncionales) {
      extraerArticulos(item.EstructurasFuncionales, acumulado);
    }
  });

  return acumulado;
};

export default function BuscadorLey({ ley }) {
  const [busqueda, setBusqueda] = useState("");

  const articulos = useMemo(() => {
    if (!ley?.EstructurasFuncionales) return [];
    return extraerArticulos(ley.EstructurasFuncionales);
  }, [ley]);

  const resultados = useMemo(() => {
    if (!busqueda.trim()) return [];

    const query = normalizarTexto(busqueda);

    return articulos
      .map((articulo) => {
        const textoNormalizado = normalizarTexto(articulo.texto);
        const coincidencias = textoNormalizado.split(query).length - 1;

        return coincidencias > 0
          ? { ...articulo, score: coincidencias }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);
  }, [busqueda, articulos]);

  return (
    <div className="mb-10">
      <input
        type="text"
        placeholder="Buscar artículos, conceptos o palabras clave…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
      />

      {busqueda && (
        <div className="mt-4 bg-white rounded-lg shadow divide-y">
          {resultados.length === 0 && (
            <p className="p-4 text-slate-500">No se encontraron resultados.</p>
          )}

          {resultados.map((res, idx) => (
            <div
              key={idx}
              className="p-4 hover:bg-slate-50 cursor-pointer transition"
            >
              <h4 className="font-bold text-blue-900 mb-1">
                {res.titulo}
              </h4>
              <p className="text-sm text-slate-600 line-clamp-3">
                {he.decode(String(res.texto))}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
