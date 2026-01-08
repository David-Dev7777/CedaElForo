import React, { useEffect, useMemo, useState } from "react";

const API = "http://localhost:4000/api";

const CATEGORIAS_BASE = [
  { nombre: "Leyes de Tránsito", descripcion: "Normativa y dudas generales", color: "#2563EB" },
  { nombre: "Fiscalización", descripcion: "Controles y procedimientos", color: "#F97316" },
  { nombre: "Derechos del Conductor", descripcion: "Derechos y deberes", color: "#0EA5E9" },
  { nombre: "Educación Vial", descripcion: "Consejos y buenas prácticas", color: "#16A34A" },
  { nombre: "Casos Reales", descripcion: "Experiencias y situaciones", color: "#7C3AED" },
];

const getUserId = () => {
  const v = Number(localStorage.getItem("userId"));
  return Number.isFinite(v) && v > 0 ? v : 1;
};

async function http(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    const msg = data?.error || data?.message || `Error HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

function Badge({ label, color }) {
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {label}
    </span>
  );
}

export default function Foro() {
  const [categorias, setCategorias] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [reacciones, setReacciones] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // filtros
  const [q, setQ] = useState("");
  const [catFiltro, setCatFiltro] = useState("all");
  const [sort, setSort] = useState("recent");

  // nueva publicación (panel)
  const [showNew, setShowNew] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  // comentarios por publicación
  const [openComments, setOpenComments] = useState({}); // { [pubId]: true/false }
  const [comentarioTexto, setComentarioTexto] = useState({});

  const loadAll = async () => {
    setError("");
    setLoading(true);
    try {
      const [cat, pub, com, rea] = await Promise.all([
        http("/categoriasForo"),
        http("/publicacionesForo"),
        http("/comentarios"),
        http("/reacciones"),
      ]);
      setCategorias(cat || []);
      setPublicaciones(pub || []);
      setComentarios(com || []);
      setReacciones(rea || []);
    } catch (e) {
      setError(e.message || "Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (!categoriaId && categorias.length > 0) {
      setCategoriaId(String(categorias[0].id));
    }
  }, [categorias, categoriaId]);

  const categoriaById = (id) => categorias.find((c) => String(c.id) === String(id));

  const comentariosDePub = (pubId) =>
    (comentarios || []).filter((c) => String(c.publicacion_id) === String(pubId));

  const contarReaccionesPub = (pubId, tipo) =>
    (reacciones || []).filter(
      (r) => r.publicacion_id && String(r.publicacion_id) === String(pubId) && r.tipo === tipo
    ).length;

  const publicacionesFiltradas = useMemo(() => {
    let list = [...(publicaciones || [])];

    // filtro categoría
    if (catFiltro !== "all") {
      list = list.filter((p) => String(p.categoria_id) === String(catFiltro));
    }

    // filtro texto
    if (q.trim()) {
      const qq = q.toLowerCase();
      list = list.filter((p) => {
        const t = (p.titulo || "").toLowerCase();
        const c = (p.contenido || "").toLowerCase();
        return t.includes(qq) || c.includes(qq);
      });
    }

    // sort
    if (sort === "recent") {
      list.sort((a, b) => {
        const da = a.fecha_publicacion ? new Date(a.fecha_publicacion).getTime() : 0;
        const db = b.fecha_publicacion ? new Date(b.fecha_publicacion).getTime() : 0;
        if (db !== da) return db - da;
        return (b.id || 0) - (a.id || 0);
      });
    } else if (sort === "comments") {
      list.sort((a, b) => comentariosDePub(b.id).length - comentariosDePub(a.id).length);
    } else if (sort === "likes") {
      list.sort((a, b) => contarReaccionesPub(b.id, "like") - contarReaccionesPub(a.id, "like"));
    }

    return list;
  }, [publicaciones, catFiltro, q, sort, comentarios, reacciones]);

  const seedCategorias = async () => {
    setError("");
    setBusy(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      for (const c of CATEGORIAS_BASE) {
        await http("/categoriasForo", {
          method: "POST",
          body: JSON.stringify({
            nombre: c.nombre,
            descripcion: c.descripcion,
            color: c.color,
            activa: true,
            created_at: today,
          }),
        });
      }
      await loadAll();
    } catch (e) {
      setError(`No se pudieron crear categorías: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const crearPublicacion = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !contenido.trim() || !categoriaId) return;

    setError("");
    setBusy(true);
    try {
      const now = new Date().toISOString();
      await http("/publicacionesForo", {
        method: "POST",
        body: JSON.stringify({
          titulo: titulo.trim(),
          contenido: contenido.trim(),
          usuario_id: getUserId(),
          categoria_id: Number(categoriaId),
          estado: "publicada",
          fecha_publicacion: now,
          fecha_actualizacion: now,
          vistas: 0,
          es_anónima: false,
        }),
      });

      setTitulo("");
      setContenido("");
      setShowNew(false);
      await loadAll();
    } catch (e2) {
      setError(`No se pudo publicar: ${e2.message}`);
    } finally {
      setBusy(false);
    }
  };

  const reaccionar = async (pubId, tipo) => {
    setError("");
    setBusy(true);
    try {
      const now = new Date().toISOString();
      await http("/reacciones", {
        method: "POST",
        body: JSON.stringify({
          usuario_id: getUserId(),
          publicacion_id: Number(pubId),
          comentario_id: null,
          tipo,
          created_at: now,
        }),
      });
      await loadAll();
    } catch (e) {
      setError(`No se pudo reaccionar: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const comentar = async (pubId) => {
    const texto = (comentarioTexto[pubId] || "").trim();
    if (!texto) return;

    setError("");
    setBusy(true);
    try {
      const now = new Date().toISOString();
      await http("/comentarios", {
        method: "POST",
        body: JSON.stringify({
          contenido: texto,
          usuario_id: getUserId(),
          publicacion_id: Number(pubId),
          comentario_padre_id: null,
          estado: "activo",
          fecha_comentario: now,
          fecha_actualizacion: now,
        }),
      });

      setComentarioTexto((prev) => ({ ...prev, [pubId]: "" }));
      setOpenComments((prev) => ({ ...prev, [pubId]: true }));
      await loadAll();
    } catch (e) {
      setError(`No se pudo comentar: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const stats = useMemo(() => {
    const totalPosts = (publicaciones || []).length;
    const totalComentarios = (comentarios || []).length;
    return { totalPosts, totalComentarios };
  }, [publicaciones, comentarios]);

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Foro de Discusión</h1>
            <p className="text-gray-600">Comparte experiencias y resuelve dudas con la comunidad</p>
          </div>

          <button
            onClick={() => setShowNew((v) => !v)}
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-3 rounded-xl shadow-md disabled:opacity-60"
            disabled={busy}
          >
            + Nueva Publicación
          </button>
        </div>

        {/* error */}
        {error && (
          <div className="mb-5 border border-red-200 bg-red-50 text-red-700 rounded-xl p-4">
            <b>Error:</b> {error}
          </div>
        )}

        {/* layout 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* columna izquierda (posts) */}
          <div className="lg:col-span-2">
            {/* filtros */}
            <div className="bg-white border rounded-2xl p-4 shadow-sm mb-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar publicaciones..."
                    className="w-full border rounded-xl px-4 py-3"
                  />
                </div>

                <select
                  value={catFiltro}
                  onChange={(e) => setCatFiltro(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                >
                  <option value="all">Todas las categorías</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </option>
                  ))}
                </select>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                >
                  <option value="recent">Más recientes</option>
                  <option value="comments">Más comentadas</option>
                  <option value="likes">Más likes</option>
                </select>
              </div>
            </div>

            {/* seed categorías si no hay */}
            {!loading && categorias.length === 0 && (
              <div className="bg-white border rounded-2xl p-5 shadow-sm mb-5">
                <p className="text-gray-700 mb-3">
                  No hay categorías en la base de datos. Cárgalas con un clic:
                </p>
                <button
                  onClick={seedCategorias}
                  disabled={busy}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-3 rounded-xl shadow-md disabled:opacity-60"
                >
                  {busy ? "Cargando..." : "Cargar categorías base"}
                </button>
              </div>
            )}

            {/* form nueva publicación */}
            {showNew && (
              <div className="bg-white border rounded-2xl p-5 shadow-sm mb-5">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Nueva publicación</h2>

                <form onSubmit={crearPublicacion} className="space-y-3">
                  <input
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Título de tu publicación..."
                    className="w-full border rounded-xl px-4 py-3"
                  />

                  <select
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3"
                    disabled={categorias.length === 0}
                  >
                    {categorias.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>

                  <textarea
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    placeholder="Escribe tu publicación..."
                    rows={4}
                    className="w-full border rounded-xl px-4 py-3"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNew(false)}
                      className="px-4 py-2 rounded-xl border font-semibold hover:bg-gray-50"
                      disabled={busy}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-md disabled:opacity-60"
                      disabled={busy || categorias.length === 0}
                    >
                      {busy ? "Publicando..." : "Publicar"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* posts */}
            {loading ? (
              <div className="bg-white border rounded-2xl p-6 shadow-sm text-gray-600">
                Cargando foro...
              </div>
            ) : publicacionesFiltradas.length === 0 ? (
              <div className="bg-white border rounded-2xl p-6 shadow-sm text-gray-600">
                No hay publicaciones para mostrar.
              </div>
            ) : (
              <div className="space-y-4">
                {publicacionesFiltradas.map((p) => {
                  const cat = categoriaById(p.categoria_id);
                  const color = cat?.color || "#2563EB";
                  const coms = comentariosDePub(p.id);

                  return (
                    <div key={p.id} className="bg-white border rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Badge label={cat?.nombre || "Sin categoría"} color={color} />
                        </div>

                        <div className="text-sm text-gray-500 flex gap-3">
                          <span title="Comentarios">💬 {coms.length}</span>
                          <span title="Likes">👍 {contarReaccionesPub(p.id, "like")}</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mt-2">{p.titulo}</h3>
                      <p className="text-gray-700 mt-2 whitespace-pre-wrap">
                        {p.contenido}
                      </p>

                      {/* acciones */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          onClick={() => reaccionar(p.id, "like")}
                          disabled={busy}
                          className="px-4 py-2 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 disabled:opacity-60"
                        >
                          👍 Like ({contarReaccionesPub(p.id, "like")})
                        </button>
                        <button
                          onClick={() => reaccionar(p.id, "dislike")}
                          disabled={busy}
                          className="px-4 py-2 rounded-xl border font-semibold hover:bg-gray-50 disabled:opacity-60"
                        >
                          👎 Dislike ({contarReaccionesPub(p.id, "dislike")})
                        </button>

                        <button
                          onClick={() =>
                            setOpenComments((prev) => ({ ...prev, [p.id]: !prev[p.id] }))
                          }
                          className="px-4 py-2 rounded-xl border font-semibold hover:bg-gray-50"
                        >
                          {openComments[p.id] ? "Ocultar comentarios" : "Ver / Comentar"}
                        </button>
                      </div>

                      {/* panel comentarios dentro del post */}
                      {openComments[p.id] && (
                        <div className="mt-5 border-t pt-4">
                          <div className="flex gap-2 mb-3">
                            <input
                              value={comentarioTexto[p.id] || ""}
                              onChange={(e) =>
                                setComentarioTexto((prev) => ({ ...prev, [p.id]: e.target.value }))
                              }
                              placeholder="Escribe un comentario..."
                              className="flex-1 border rounded-xl px-4 py-2"
                            />
                            <button
                              onClick={() => comentar(p.id)}
                              disabled={busy}
                              className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-xl"
                            >
                              Comentar
                            </button>
                          </div>

                          <div className="space-y-2">
                            {coms.length === 0 ? (
                              <p className="text-gray-600">Aún no hay comentarios.</p>
                            ) : (
                              coms.map((c) => (
                                <div key={c.id} className="border rounded-xl p-3">
                                  <p className="text-gray-800 whitespace-pre-wrap">{c.contenido}</p>
                                  <p className="text-xs text-gray-500 mt-1">Comentario #{c.id}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* sidebar */}
          <div className="space-y-5">
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Tu Perfil</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold">
                  AS
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Usuario Demo</p>
                  <p className="text-sm text-gray-500">Modo prueba (sin login)</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold">{stats.totalPosts}</p>
                  <p className="text-sm text-gray-600">Posts</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold">{stats.totalComentarios}</p>
                  <p className="text-sm text-gray-600">Comentarios</p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Reglas del Foro</h3>
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                <li>Mantén el respeto hacia otros usuarios</li>
                <li>Publica en la categoría correcta</li>
                <li>Evita spam y contenido repetido</li>
                <li>Usa títulos descriptivos</li>
              </ul>
            </div>

            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Enlaces útiles</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>📘 Ley de Tránsito actualizada</li>
                <li>📄 Manual del conductor</li>
                <li>⚖️ Recursos legales</li>
                <li>📞 Contactos de emergencia</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
