import React, { useEffect, useMemo, useState } from "react";

const API = import.meta.env?.VITE_API_URL || "http://localhost:4000/api";

/**
 * http(): siempre manda cookies y captura JSON o HTML/texto
 */
async function http(path, options = {}) {
  const url = `${API}${path}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const contentType = res.headers.get("content-type") || "";
  let data = null;
  let rawText = "";

  try {
    if (contentType.includes("application/json")) data = await res.json();
    else rawText = await res.text();
  } catch {}

  if (!res.ok) {
    const msg =
      data?.error ||
      data?.message ||
      (rawText ? rawText.slice(0, 300) : "") ||
      `Error HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = data || rawText;
    err.url = url;
    throw err;
  }

  return data ?? rawText;
}

function dateOnly(d = new Date()) {
  return new Date(d).toISOString().slice(0, 10);
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
  const [me, setMe] = useState(null);

  const [categorias, setCategorias] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [comentarios, setComentarios] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // filtros
  const [q, setQ] = useState("");
  const [catFiltro, setCatFiltro] = useState("all");
  const [sort, setSort] = useState("recent");

  // nueva publicación
  const [showNew, setShowNew] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  // edición publicación
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editContenido, setEditContenido] = useState("");
  const [editCategoriaId, setEditCategoriaId] = useState("");

  // comentarios
  const [openComments, setOpenComments] = useState({});
  const [comentarioTexto, setComentarioTexto] = useState({});

  // admin: crear categoría
  const [showNewCat, setShowNewCat] = useState(false);
  const [catNombre, setCatNombre] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catColor, setCatColor] = useState("#FF9FF3");
  const [catActiva, setCatActiva] = useState(true);

  // editar comentario
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  const isAdmin = me?.tipo_usuario === "administrador";

  const loadAll = async () => {
    setError("");
    setLoading(true);
    try {
      const [meRes, cat, pub, com] = await Promise.all([
        http("/me"),
        http("/categoriasForo"),
        http("/publicacionesForo"),
        http("/comentarios"),
      ]);

      setMe(meRes?.user || null);
      setCategorias(Array.isArray(cat) ? cat : []);
      setPublicaciones(Array.isArray(pub) ? pub : []);
      setComentarios(Array.isArray(com) ? com : []);
    } catch (e) {
      setError(e.message || "Error cargando datos");
      console.error("loadAll error:", e);
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

  const canManagePost = (post) => {
    if (!me) return false;
    return isAdmin || String(post.usuario_id) === String(me.id);
  };

  const canManageComment = (comment) => {
    if (!me) return false;
    return isAdmin || String(comment.usuario_id) === String(me.id);
  };

  const publicacionesFiltradas = useMemo(() => {
    let list = [...(publicaciones || [])];

    if (catFiltro !== "all") {
      list = list.filter((p) => String(p.categoria_id) === String(catFiltro));
    }

    if (q.trim()) {
      const qq = q.toLowerCase();
      list = list.filter((p) => {
        const t = (p.titulo || "").toLowerCase();
        const c = (p.contenido || "").toLowerCase();
        return t.includes(qq) || c.includes(qq);
      });
    }

    // Orden simple (sin reacciones)
    list.sort((a, b) => {
      if (sort === "comments") return comentariosDePub(b.id).length - comentariosDePub(a.id).length;

      // recent
      const ta = a.fecha_publicacion ? new Date(a.fecha_publicacion).getTime() : 0;
      const tb = b.fecha_publicacion ? new Date(b.fecha_publicacion).getTime() : 0;
      if (tb !== ta) return tb - ta;
      return (b.id || 0) - (a.id || 0);
    });

    return list;
  }, [publicaciones, catFiltro, q, sort, comentarios]);

  const myStats = useMemo(() => {
    const myId = me?.id;
    if (!myId) return { myPosts: 0, myComentarios: 0 };
    const myPosts = (publicaciones || []).filter((p) => String(p.usuario_id) === String(myId)).length;
    const myComentarios = (comentarios || []).filter((c) => String(c.usuario_id) === String(myId)).length;
    return { myPosts, myComentarios };
  }, [me, publicaciones, comentarios]);

  const avatarLetters = useMemo(() => {
    const n = me?.nombre?.[0] || "U";
    const a = me?.apellido?.[0] || "S";
    return (n + a).toUpperCase();
  }, [me]);

  const displayName = useMemo(() => {
    if (!me) return "Usuario";
    const full = `${me.nombre || ""} ${me.apellido || ""}`.trim();
    return full || `Usuario ${me.id}`;
  }, [me]);

  // =====================
  // ACCIONES API
  // =====================

  const crearPublicacion = async (e) => {
    e.preventDefault();
    if (!me?.id) return setError("No estás autenticado (no hay usuario en /me).");
    if (!titulo.trim() || !contenido.trim() || !categoriaId) return;

    setError("");
    setBusy(true);

    try {
      const today = dateOnly();

      await http("/publicacionesForo", {
        method: "POST",
        body: JSON.stringify({
          titulo: titulo.trim(),
          contenido: contenido.trim(),
          usuario_id: Number(me.id),
          categoria_id: Number(categoriaId),
          estado: "activa",
          fecha_publicacion: today,
          fecha_actualizacion: today,
          vistas: 0,
          "es_anónima": false,
          es_anonima: false,
        }),
      });

      setTitulo("");
      setContenido("");
      setShowNew(false);
      await loadAll();
    } catch (e2) {
      console.error("crearPublicacion error:", e2);
      setError(`No se pudo publicar: ${e2.message}`);
    } finally {
      setBusy(false);
    }
  };

  const startEditPost = (p) => {
    setEditingPostId(p.id);
    setEditTitulo(p.titulo || "");
    setEditContenido(p.contenido || "");
    setEditCategoriaId(String(p.categoria_id || (categorias[0]?.id ?? "")));
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditTitulo("");
    setEditContenido("");
    setEditCategoriaId("");
  };

  const guardarEdicionPost = async (post) => {
    if (!me?.id) return setError("No estás autenticado.");
    if (!canManagePost(post)) return setError("No puedes editar este post.");
    if (!editTitulo.trim() || !editContenido.trim() || !editCategoriaId) return;

    setError("");
    setBusy(true);

    try {
      const today = dateOnly();

      await http(`/publicacionesForo/${post.id}`, {
        method: "PUT",
        body: JSON.stringify({
          titulo: editTitulo.trim(),
          contenido: editContenido.trim(),
          usuario_id: Number(post.usuario_id),
          categoria_id: Number(editCategoriaId),
          estado: post.estado || "activa",
          fecha_publicacion: post.fecha_publicacion || today,
          fecha_actualizacion: today,
          vistas: post.vistas ?? 0,
          "es_anónima": !!post["es_anónima"],
          es_anonima: !!post.es_anonima,
        }),
      });

      cancelEditPost();
      await loadAll();
    } catch (e) {
      console.error("guardarEdicionPost error:", e);
      setError(`No se pudo actualizar: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const eliminarPost = async (post) => {
    if (!me?.id) return setError("No estás autenticado.");
    if (!canManagePost(post)) return setError("No puedes eliminar este post.");

    const ok = confirm(`¿Eliminar la publicación #${post.id}?`);
    if (!ok) return;

    setError("");
    setBusy(true);

    try {
      await http(`/publicacionesForo/${post.id}`, { method: "DELETE" });
      await loadAll();
    } catch (e) {
      console.error("eliminarPost error:", e);
      setError(`No se pudo eliminar: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const comentar = async (pubId) => {
    if (!me?.id) return setError("No estás autenticado.");
    const texto = (comentarioTexto[pubId] || "").trim();
    if (!texto) return;

    setError("");
    setBusy(true);

    try {
      const today = dateOnly();
      await http("/comentarios", {
        method: "POST",
        body: JSON.stringify({
          contenido: texto,
          usuario_id: Number(me.id),
          publicacion_id: Number(pubId),
          comentario_padre_id: null,
          estado: "activo",
          fecha_comentario: today,
          fecha_actualizacion: today,
        }),
      });

      setComentarioTexto((prev) => ({ ...prev, [pubId]: "" }));
      setOpenComments((prev) => ({ ...prev, [pubId]: true }));
      await loadAll();
    } catch (e) {
      console.error("comentar error:", e);
      setError(`No se pudo comentar: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  // Admin: crear categoría
  const crearCategoria = async (e) => {
    e.preventDefault();
    if (!isAdmin) return setError("Solo administrador puede crear categorías.");
    if (!catNombre.trim() || !catDesc.trim() || !catColor) return;

    setError("");
    setBusy(true);

    try {
      await http("/categoriasForo", {
        method: "POST",
        body: JSON.stringify({
          nombre: catNombre.trim(),
          descripcion: catDesc.trim(),
          color: catColor,
          activa: !!catActiva,
          created_at: new Date().toISOString(),
        }),
      });

      setCatNombre("");
      setCatDesc("");
      setCatColor("#FF9FF3");
      setCatActiva(true);
      setShowNewCat(false);
      await loadAll();
    } catch (e2) {
      console.error("crearCategoria error:", e2);
      setError(`No se pudo crear categoría: ${e2.message}`);
    } finally {
      setBusy(false);
    }
  };

  // Editar/eliminar comentarios
  const startEditComment = (c) => {
    setEditingCommentId(c.id);
    setEditCommentText(c.contenido || "");
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentText("");
  };

  const guardarEdicionComentario = async (c) => {
    if (!me?.id) return setError("No estás autenticado.");
    if (!canManageComment(c)) return setError("No puedes editar este comentario.");
    if (!editCommentText.trim()) return;

    setError("");
    setBusy(true);

    try {
      const today = dateOnly();
      await http(`/comentarios/${c.id}`, {
        method: "PUT",
        body: JSON.stringify({
          contenido: editCommentText.trim(),
          usuario_id: Number(c.usuario_id),
          publicacion_id: Number(c.publicacion_id),
          comentario_padre_id: c.comentario_padre_id ?? null,
          estado: c.estado || "activo",
          fecha_comentario: c.fecha_comentario || today,
          fecha_actualizacion: today,
        }),
      });

      cancelEditComment();
      await loadAll();
    } catch (e) {
      console.error("guardarEdicionComentario error:", e);
      setError(`No se pudo editar comentario: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const eliminarComentario = async (c) => {
    if (!me?.id) return setError("No estás autenticado.");
    if (!canManageComment(c)) return setError("No puedes eliminar este comentario.");

    const ok = confirm(`¿Eliminar comentario #${c.id}?`);
    if (!ok) return;

    setError("");
    setBusy(true);

    try {
      await http(`/comentarios/${c.id}`, { method: "DELETE" });
      await loadAll();
    } catch (e) {
      console.error("eliminarComentario error:", e);
      setError(`No se pudo eliminar comentario: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  // =====================
  // UI
  // =====================

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Foro de Discusión</h1>
            <p className="text-gray-600">Comparte experiencias y resuelve dudas con la comunidad</p>
          </div>

          <div className="flex gap-2">
            {isAdmin && (
              <button
                onClick={() => setShowNewCat((v) => !v)}
                className="border font-semibold px-5 py-3 rounded-xl hover:bg-gray-50 disabled:opacity-60"
                disabled={busy}
              >
                + Nueva Categoría
              </button>
            )}

            <button
              onClick={() => setShowNew((v) => !v)}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-3 rounded-xl shadow-md disabled:opacity-60"
              disabled={busy}
            >
              + Nueva Publicación
            </button>
          </div>
        </div>

        {/* error */}
        {error && (
          <div className="mb-5 border border-red-200 bg-red-50 text-red-700 rounded-xl p-4">
            <b>Error:</b> {error}
          </div>
        )}

        {/* Admin: crear categoría */}
        {showNewCat && isAdmin && (
          <div className="bg-white border rounded-2xl p-5 shadow-sm mb-5">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Crear categoría</h2>
            <form onSubmit={crearCategoria} className="space-y-3">
              <input
                value={catNombre}
                onChange={(e) => setCatNombre(e.target.value)}
                placeholder="Nombre (ej: General)"
                className="w-full border rounded-xl px-4 py-3"
              />
              <textarea
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Descripción"
                rows={3}
                className="w-full border rounded-xl px-4 py-3"
              />
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-gray-700 font-semibold">Color:</label>
                <input
                  type="color"
                  value={catColor}
                  onChange={(e) => setCatColor(e.target.value)}
                  className="h-10 w-14 border rounded-lg"
                />
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={catActiva}
                    onChange={(e) => setCatActiva(e.target.checked)}
                  />
                  Activa
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCat(false)}
                  className="px-4 py-2 rounded-xl border font-semibold hover:bg-gray-50"
                  disabled={busy}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-md disabled:opacity-60"
                  disabled={busy}
                >
                  {busy ? "Creando..." : "Crear"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* posts */}
          <div className="lg:col-span-2">
            {/* filtros */}
            <div className="bg-white border rounded-2xl p-4 shadow-sm mb-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar publicaciones..."
                  className="w-full border rounded-xl px-4 py-3"
                />

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
                </select>
              </div>
            </div>

            {/* form nueva publicación */}
            {showNew && (
              <div className="bg-white border rounded-2xl p-5 shadow-sm mb-5">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Nueva publicación</h2>

                {categorias.length === 0 ? (
                  <p className="text-gray-700">No hay categorías. Pídele al administrador que cree una.</p>
                ) : (
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
                        disabled={busy}
                      >
                        {busy ? "Publicando..." : "Publicar"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* posts */}
            {loading ? (
              <div className="bg-white border rounded-2xl p-6 shadow-sm text-gray-600">Cargando foro...</div>
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
                  const canManage = canManagePost(p);
                  const isEditing = editingPostId === p.id;

                  return (
                    <div key={p.id} className="bg-white border rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Badge label={cat?.nombre || "Sin categoría"} color={color} />
                          <span className="text-xs text-gray-500">Por: Usuario {p.usuario_id}</span>
                        </div>

                        <div className="text-sm text-gray-500 flex gap-3">
                          <span title="Comentarios">💬 {coms.length}</span>
                        </div>
                      </div>

                      {!isEditing ? (
                        <>
                          <h3 className="text-xl font-bold text-gray-900 mt-2">{p.titulo}</h3>
                          <p className="text-gray-700 mt-2 whitespace-pre-wrap">{p.contenido}</p>
                        </>
                      ) : (
                        <div className="mt-3 space-y-3">
                          <input
                            value={editTitulo}
                            onChange={(e) => setEditTitulo(e.target.value)}
                            className="w-full border rounded-xl px-4 py-3"
                            placeholder="Título"
                          />
                          <select
                            value={editCategoriaId}
                            onChange={(e) => setEditCategoriaId(e.target.value)}
                            className="w-full border rounded-xl px-4 py-3"
                          >
                            {categorias.map((c) => (
                              <option key={c.id} value={String(c.id)}>
                                {c.nombre}
                              </option>
                            ))}
                          </select>
                          <textarea
                            value={editContenido}
                            onChange={(e) => setEditContenido(e.target.value)}
                            rows={4}
                            className="w-full border rounded-xl px-4 py-3"
                            placeholder="Contenido"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={cancelEditPost}
                              disabled={busy}
                              className="px-4 py-2 rounded-xl border font-semibold hover:bg-gray-50 disabled:opacity-60"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => guardarEdicionPost(p)}
                              disabled={busy}
                              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-xl disabled:opacity-60"
                            >
                              Guardar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* acciones */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          onClick={() => setOpenComments((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                          className="px-4 py-2 rounded-xl border font-semibold hover:bg-gray-50"
                        >
                          {openComments[p.id] ? "Ocultar comentarios" : "Ver / Comentar"}
                        </button>

                        {canManage && !isEditing && (
                          <>
                            <button
                              onClick={() => startEditPost(p)}
                              disabled={busy}
                              className="px-4 py-2 rounded-xl border font-semibold hover:bg-gray-50 disabled:opacity-60"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => eliminarPost(p)}
                              disabled={busy}
                              className="px-4 py-2 rounded-xl border font-semibold hover:bg-red-50 text-red-700 border-red-200 disabled:opacity-60"
                            >
                              🗑️ Eliminar
                            </button>
                          </>
                        )}
                      </div>

                      {/* comentarios */}
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
                              coms.map((c) => {
                                const isEditingC = editingCommentId === c.id;
                                const canC = canManageComment(c);

                                return (
                                  <div key={c.id} className="border rounded-xl p-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <p className="text-xs text-gray-500 mb-1">
                                        Usuario {c.usuario_id} · Comentario #{c.id}
                                      </p>

                                      {canC && (
                                        <div className="flex gap-2">
                                          {!isEditingC ? (
                                            <>
                                              <button
                                                onClick={() => startEditComment(c)}
                                                disabled={busy}
                                                className="text-sm px-3 py-1 rounded-lg border hover:bg-gray-50 disabled:opacity-60"
                                              >
                                                ✏️ Editar
                                              </button>
                                              <button
                                                onClick={() => eliminarComentario(c)}
                                                disabled={busy}
                                                className="text-sm px-3 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-60"
                                              >
                                                🗑️ Eliminar
                                              </button>
                                            </>
                                          ) : (
                                            <>
                                              <button
                                                onClick={cancelEditComment}
                                                disabled={busy}
                                                className="text-sm px-3 py-1 rounded-lg border hover:bg-gray-50 disabled:opacity-60"
                                              >
                                                Cancelar
                                              </button>
                                              <button
                                                onClick={() => guardarEdicionComentario(c)}
                                                disabled={busy}
                                                className="text-sm px-3 py-1 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-60"
                                              >
                                                Guardar
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {!isEditingC ? (
                                      <p className="text-gray-800 whitespace-pre-wrap">{c.contenido}</p>
                                    ) : (
                                      <textarea
                                        value={editCommentText}
                                        onChange={(e) => setEditCommentText(e.target.value)}
                                        rows={3}
                                        className="w-full border rounded-xl px-3 py-2"
                                      />
                                    )}
                                  </div>
                                );
                              })
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
                  {avatarLetters}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{displayName}</p>
                  <p className="text-sm text-gray-500">
                    {me ? (
                      <>
                        ID: {me.id} · Rol: {me.tipo_usuario}
                      </>
                    ) : (
                      "No autenticado"
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold">{myStats.myPosts}</p>
                  <p className="text-sm text-gray-600">Posts</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold">{myStats.myComentarios}</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
