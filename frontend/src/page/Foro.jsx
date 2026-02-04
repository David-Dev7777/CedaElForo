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

function safeParseDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ✅ FECHA + HORA (AM/PM)
function fmtDateTime(v) {
  const d = safeParseDate(v);
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

function initialsFromName(nombre, apellido, fallback = "US") {
  const n = (nombre || "").trim();
  const a = (apellido || "").trim();
  const i1 = n ? n[0] : "";
  const i2 = a ? a[0] : "";
  const out = (i1 + i2).toUpperCase();
  return out || fallback;
}

function Badge({ label, color }) {
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-200"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {label}
    </span>
  );
}

function RolePill({ role }) {
  if (!role) return null;
  const isAdmin = role === "administrador";
  return (
    <span
      className={
        "text-[11px] font-semibold px-2 py-0.5 rounded-full border " +
        (isAdmin
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-gray-50 text-gray-700 border-gray-200")
      }
      title={role}
    >
      {isAdmin ? "Admin" : role}
    </span>
  );
}

function Avatar({ letters }) {
  return (
    <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold shrink-0">
      {letters}
    </div>
  );
}

/**
 * Card con “borde suave” (gris clarito) alrededor, SIN poner el background general en gris.
 * - outer: bg-gray-50 (ese borde suave)
 * - inner: bg-white + border
 */
function SoftCard({ className = "", innerClassName = "", children }) {
  return (
    <div className={"bg-gray-50 p-1 rounded-3xl " + className}>
      <div className={"bg-white border border-gray-200 rounded-2xl " + innerClassName}>
        {children}
      </div>
    </div>
  );
}

export default function Foro() {
  const [me, setMe] = useState(null);

  const [categorias, setCategorias] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [reacciones, setReacciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // ✅ para mostrar nombres en posts/comentarios

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

  // editar comentario
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  // ====== ADMIN: editor de categorías ======
  const [showCatManager, setShowCatManager] = useState(false);

  // crear categoría (dentro del manager)
  const [catNombre, setCatNombre] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catColor, setCatColor] = useState("#FF9FF3");
  const [catActiva, setCatActiva] = useState(true);

  // edición de categorías existentes
  const [catEdits, setCatEdits] = useState({}); // { [id]: {nombre, descripcion, color, activa} }

  const isAdmin = me?.tipo_usuario === "administrador";

  async function fetchUsuariosSafe() {
    /**
     * ✅ FIX: para ciudadanos puede que /usuarios esté restringido.
     * Intentamos varios endpoints comunes. Si ninguno existe, devolvemos [] sin romper UI.
     */
    const candidates = ["/usuarios", "/users", "/usuariosForo", "/usuariosPublicos", "/usuarios/publicos"];
    for (const path of candidates) {
      try {
        const u = await http(path);
        if (Array.isArray(u)) return u;
        if (Array.isArray(u?.rows)) return u.rows;
      } catch {}
    }
    return [];
  }

  const loadAll = async () => {
    setError("");
    setLoading(true);
    try {
      const [meRes, cat, pub, com, rea, usrs] = await Promise.all([
        http("/me"),
        http("/categoriasForo"),
        http("/publicacionesForo"),
        http("/comentarios"),
        http("/reacciones"),
        fetchUsuariosSafe(),
      ]);

      setMe(meRes?.user || null);
      setCategorias(Array.isArray(cat) ? cat : []);
      setPublicaciones(Array.isArray(pub) ? pub : []);
      setComentarios(Array.isArray(com) ? com : []);
      setReacciones(Array.isArray(rea) ? rea : []);
      setUsuarios(Array.isArray(usrs) ? usrs : []);
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

  // cuando abres el manager, prepara el buffer de edición
  useEffect(() => {
    if (!showCatManager) return;
    const buf = {};
    for (const c of categorias) {
      buf[c.id] = {
        nombre: c.nombre ?? "",
        descripcion: c.descripcion ?? "",
        color: c.color ?? "#FF9FF3",
        activa: typeof c.activa === "boolean" ? c.activa : true,
      };
    }
    setCatEdits(buf);
  }, [showCatManager, categorias]);

  // ======================================================
  // USERS (para avatar+nombre en posts/comentarios)
  // ======================================================

  const usersById = useMemo(() => {
    const m = new Map();
    for (const u of usuarios || []) {
      if (u?.id != null) m.set(String(u.id), u);
    }
    // incluye "me" por si no viene en /usuarios
    if (me?.id != null && !m.has(String(me.id))) m.set(String(me.id), me);
    return m;
  }, [usuarios, me]);

  // ✅ helpers para detectar nombres “embebidos” en publicaciones/comentarios (si el backend ya los manda)
  function pickEmbeddedUserFromEntity(entity) {
    if (!entity) return null;

    // posibles nombres de campos (por si vienen desde un JOIN)
    const nombre =
      entity.nombre_usuario ??
      entity.usuario_nombre ??
      entity.nombre ??
      entity.user_nombre ??
      entity.userName ??
      entity.first_name ??
      entity.nombres ??
      "";

    const apellido =
      entity.apellido_usuario ??
      entity.usuario_apellido ??
      entity.apellido ??
      entity.user_apellido ??
      entity.last_name ??
      entity.apellidos ??
      "";

    const tipo_usuario =
      entity.tipo_usuario ??
      entity.usuario_tipo ??
      entity.rol ??
      entity.role ??
      "";

    const id =
      entity.usuario_id ??
      entity.user_id ??
      entity.id_usuario ??
      null;

    const hasName = String(nombre || "").trim() || String(apellido || "").trim();
    if (!hasName) return null;

    return {
      id,
      nombre: String(nombre || "").trim(),
      apellido: String(apellido || "").trim(),
      tipo_usuario: String(tipo_usuario || "").trim(),
    };
  }

  const getUser = (id, fallbackEntity = null) => {
    const u = usersById.get(String(id));
    if (u) return u;

    // ✅ si no tenemos endpoint de usuarios (ciudadano), intenta sacar nombre del post/comentario
    const embedded = pickEmbeddedUserFromEntity(fallbackEntity);
    if (embedded) return embedded;

    return { id, nombre: "", apellido: "", tipo_usuario: "" };
  };

  const userDisplayName = (id, fallbackEntity = null) => {
    const u = getUser(id, fallbackEntity);
    const full = `${u?.nombre || ""} ${u?.apellido || ""}`.trim();
    return full || `Usuario #${id}`;
  };

  const userInitials = (id, fallbackEntity = null) => {
    const u = getUser(id, fallbackEntity);
    const fallback = String(id ?? "U").slice(0, 2).toUpperCase();
    return initialsFromName(u?.nombre, u?.apellido, fallback);
  };

  // ======================================================
  // Helpers foro
  // ======================================================

  const categoriaById = (id) => categorias.find((c) => String(c.id) === String(id));

  const comentariosDePub = (pubId) =>
    (comentarios || []).filter((c) => String(c.publicacion_id) === String(pubId));

  // ======================================================
  // REACCIONES
  // ======================================================

  // Publicación: comentario_id null
  const reaccionesDePub = (pubId) =>
    (reacciones || []).filter(
      (r) =>
        r.publicacion_id &&
        String(r.publicacion_id) === String(pubId) &&
        (r.comentario_id === null || r.comentario_id === undefined)
    );

  const contarImportantes = (pubId) => reaccionesDePub(pubId).filter((r) => r.tipo === "important").length;

  // ✅ por publicación: likes y me gustas separados
  const contarLikesPub = (pubId) => reaccionesDePub(pubId).filter((r) => r.tipo === "like").length;
  const contarLovesPub = (pubId) => reaccionesDePub(pubId).filter((r) => r.tipo === "love").length;

  // ✅ total
  const contarPositivas = (pubId) => contarLikesPub(pubId) + contarLovesPub(pubId);

  const isDestacada = (post) => contarImportantes(post.id) > 0;

  const miReaccionEnPub = (pubId) =>
    (reacciones || []).find(
      (r) =>
        String(r.usuario_id) === String(me?.id) &&
        String(r.publicacion_id) === String(pubId) &&
        (r.comentario_id === null || r.comentario_id === undefined)
    );

  // Comentario: comentario_id = id del comentario
  const reaccionesDeComentario = (comentarioId) =>
    (reacciones || []).filter((r) => String(r.comentario_id) === String(comentarioId));

  const contarLikesComentario = (comentarioId) => reaccionesDeComentario(comentarioId).filter((r) => r.tipo === "like").length;
  const contarLovesComentario = (comentarioId) => reaccionesDeComentario(comentarioId).filter((r) => r.tipo === "love").length;

  const miReaccionEnComentario = (comentarioId) =>
    (reacciones || []).find((r) => String(r.usuario_id) === String(me?.id) && String(r.comentario_id) === String(comentarioId));

  // ======================================================
  // PERMISOS
  // ======================================================

  const canManagePost = (post) => {
    if (!me) return false;
    return isAdmin || String(post.usuario_id) === String(me.id);
  };

  const canManageComment = (comment) => {
    if (!me) return false;
    return isAdmin || String(comment.usuario_id) === String(me.id);
  };

  // ======================================================
  // FILTROS / ORDEN
  // ======================================================

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

    // Orden: destacadas primero, luego sort
    list.sort((a, b) => {
      const da = isDestacada(a) ? 1 : 0;
      const db = isDestacada(b) ? 1 : 0;
      if (db !== da) return db - da;

      if (sort === "comments") return comentariosDePub(b.id).length - comentariosDePub(a.id).length;
      if (sort === "positives") return contarPositivas(b.id) - contarPositivas(a.id);

      const ta = a.fecha_publicacion ? new Date(a.fecha_publicacion).getTime() : 0;
      const tb = b.fecha_publicacion ? new Date(b.fecha_publicacion).getTime() : 0;
      if (tb !== ta) return tb - ta;
      return (b.id || 0) - (a.id || 0);
    });

    return list;
  }, [publicaciones, catFiltro, q, sort, comentarios, reacciones]);

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

  // ======================================================
  // ACCIONES API
  // ======================================================

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
    } catch (error) {
      console.error("crearPublicacion error:", error);
      setError(`No se pudo publicar: ${error.message}`);
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

  // ======================================================
  // REACCIONAR
  // ======================================================

  const reaccionar = async ({ publicacionId, comentarioId, tipo }) => {
    if (!me?.id) return setError("No estás autenticado.");

    const allowed = new Set(["like", "love", "important"]);
    if (!allowed.has(tipo)) return setError(`Tipo no permitido: ${tipo}`);

    // important solo en publicaciones y solo admin
    if (tipo === "important") {
      if (!isAdmin) return setError("Solo administrador puede destacar (important).");
      if (comentarioId != null) return setError("No se puede destacar un comentario, solo publicaciones.");
    }

    setError("");
    setBusy(true);
    try {
      await http("/reacciones", {
        method: "POST",
        body: JSON.stringify({
          usuario_id: Number(me.id),
          publicacion_id: Number(publicacionId),
          comentario_id: comentarioId == null ? null : Number(comentarioId),
          tipo,
          created_at: new Date().toISOString(),
        }),
      });

      await loadAll();
    } catch (e) {
      console.error("reaccionar error:", e);
      setError(`No se pudo reaccionar: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  // Admin: quitar TODOS los "important" de una publicación (de cualquier admin)
  const adminQuitarDestacadosDePost = async (pubId) => {
    if (!isAdmin) return setError("Solo administrador.");
    const importantes = reaccionesDePub(pubId).filter((r) => r.tipo === "important");
    if (importantes.length === 0) return;

    const ok = confirm(`¿Quitar destacado(s) de esta publicación? (${importantes.length})`);
    if (!ok) return;

    setError("");
    setBusy(true);
    try {
      await Promise.all(importantes.map((r) => http(`/reacciones/${r.id}`, { method: "DELETE" })));
      await loadAll();
    } catch (e) {
      console.error("adminQuitarDestacadosDePost error:", e);
      setError(`No se pudo quitar destacado: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  // ======================================================
  // CATEGORÍAS: crear / editar / eliminar
  // ======================================================

  const crearCategoria = async (e) => {
    e.preventDefault();
    if (!isAdmin) return setError("Solo administrador puede gestionar categorías.");
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
      await loadAll();
    } catch (error) {
      console.error("crearCategoria error:", error);
      setError(`No se pudo crear categoría: ${error.message}`);
    } finally {
      setBusy(false);
    }
  };

  const updateCatEdit = (id, patch) => {
    setCatEdits((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...patch },
    }));
  };

  const guardarCategoria = async (id) => {
    if (!isAdmin) return setError("Solo administrador puede gestionar categorías.");
    const data = catEdits[id];
    if (!data?.nombre?.trim() || !data?.descripcion?.trim() || !data?.color) {
      return setError("Nombre, descripción y color son obligatorios.");
    }

    setError("");
    setBusy(true);
    try {
      await http(`/categoriasForo/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          nombre: data.nombre.trim(),
          descripcion: data.descripcion.trim(),
          color: data.color,
          activa: !!data.activa,
        }),
      });
      await loadAll();
    } catch (e) {
      console.error("guardarCategoria error:", e);
      setError(`No se pudo actualizar categoría: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const eliminarCategoria = async (id) => {
    if (!isAdmin) return setError("Solo administrador puede gestionar categorías.");
    const ok = confirm(`¿Eliminar categoría #${id}?`);
    if (!ok) return;

    setError("");
    setBusy(true);
    try {
      await http(`/categoriasForo/${id}`, { method: "DELETE" });
      await loadAll();
    } catch (e) {
      console.error("eliminarCategoria error:", e);
      setError(`No se pudo eliminar categoría: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  // ======================================================
  // COMENTARIOS: editar / eliminar
  // ======================================================

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

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="w-full bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Foro de Discusión</h1>
            <p className="text-gray-600 mt-1">Comparte experiencias y resuelve dudas con la comunidad</p>
          </div>

          <div className="flex gap-2">
            {isAdmin && (
              <button
                onClick={() => setShowCatManager(true)}
                className="border border-gray-200 bg-white font-semibold px-5 py-3 rounded-xl hover:bg-gray-50 disabled:opacity-60 shadow-sm"
                disabled={busy}
              >
                ✏️ Editar categorías
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
          <SoftCard className="mb-5" innerClassName="p-4 border-red-200">
            <div className="bg-red-50 text-red-700 rounded-xl p-4 border border-red-200">
              <b>Error:</b> {error}
            </div>
          </SoftCard>
        )}

        {/* ====== MODAL / PANEL: EDITAR CATEGORÍAS ====== */}
        {showCatManager && isAdmin && (
          <SoftCard className="mb-5" innerClassName="p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-bold text-gray-900">Editar categorías</h2>
              <button
                onClick={() => setShowCatManager(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 disabled:opacity-60 bg-white"
                disabled={busy}
              >
                Cerrar
              </button>
            </div>

            {/* crear nueva */}
            <SoftCard className="mb-4" innerClassName="p-4">
              <h3 className="font-bold text-gray-900 mb-3">Agregar nueva categoría</h3>
              <form onSubmit={crearCategoria} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="md:col-span-1">
                  <label htmlFor="nombre" className="text-xs text-gray-600 font-semibold">Nombre</label>
                  <input
                    id="nombre"
                    value={catNombre}
                    onChange={(e) => setCatNombre(e.target.value)}
                    placeholder="Ej: General"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="descripcion" className="text-xs text-gray-600 font-semibold">Descripción</label>
                  <input
                    id="descripcion"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Ej: Temas generales del foro"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white"
                  />
                </div>

                <div className="md:col-span-1 flex items-center gap-3">
                  <div>
                    <label htmlFor="color" className="text-xs text-gray-600 font-semibold">Color</label>
                    <input
                      id="color"
                      type="color"
                      value={catColor}
                      onChange={(e) => setCatColor(e.target.value)}
                      className="h-10 w-14 border border-gray-200 rounded-lg bg-white"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-700 mt-5">
                    <input type="checkbox" checked={catActiva} onChange={(e) => setCatActiva(e.target.checked)} />Activa
                  </label>

                  <button
                    type="submit"
                    className="ml-auto bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-xl disabled:opacity-60"
                    disabled={busy}
                  >
                    {busy ? "Guardando..." : "Agregar"}
                  </button>
                </div>
              </form>
            </SoftCard>

            {/* lista + edición */}
            <div className="space-y-3">
              {categorias.length === 0 ? (
                <p className="text-gray-600">No hay categorías.</p>
              ) : (
                categorias.map((c) => {
                  const ed = catEdits[c.id] || {
                    nombre: c.nombre ?? "",
                    descripcion: c.descripcion ?? "",
                    color: c.color ?? "#FF9FF3",
                    activa: typeof c.activa === "boolean" ? c.activa : true,
                  };

                  return (
                    <SoftCard key={c.id} innerClassName="p-4">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <Badge label={`#${c.id}`} color={ed.color || "#2563EB"} />
                          <span className="text-sm text-gray-500">Editar categoría</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => guardarCategoria(c.id)}
                            disabled={busy}
                            className="px-4 py-2 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 disabled:opacity-60"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => eliminarCategoria(c.id)}
                            disabled={busy}
                            className="px-4 py-2 rounded-xl border border-red-200 text-red-700 font-semibold hover:bg-red-50 disabled:opacity-60 bg-white"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div className="md:col-span-1">
                          <label className="text-xs text-gray-600 font-semibold">Nombre</label>
                          <input
                            value={ed.nombre}
                            onChange={(e) => updateCatEdit(c.id, { nombre: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs text-gray-600 font-semibold">Descripción</label>
                          <input
                            value={ed.descripcion}
                            onChange={(e) => updateCatEdit(c.id, { descripcion: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white"
                          />
                        </div>

                        <div className="md:col-span-1 flex items-center gap-3">
                          <div>
                            <label className="text-xs text-gray-600 font-semibold">Color</label>
                            <input
                              type="color"
                              value={ed.color}
                              onChange={(e) => updateCatEdit(c.id, { color: e.target.value })}
                              className="h-10 w-14 border border-gray-200 rounded-lg bg-white"
                            />
                          </div>

                          <label className="flex items-center gap-2 text-sm text-gray-700 mt-5">
                            <input
                              type="checkbox"
                              checked={!!ed.activa}
                              onChange={(e) => updateCatEdit(c.id, { activa: e.target.checked })}
                            />
                            Activa
                          </label>
                        </div>
                      </div>
                    </SoftCard>
                  );
                })
              )}
            </div>
          </SoftCard>
        )}

        {/* layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* posts */}
          <div className="lg:col-span-2">
            {/* filtros */}
            <SoftCard className="mb-5" innerClassName="p-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar publicaciones..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                />

                <select
                  value={catFiltro}
                  onChange={(e) => setCatFiltro(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                >
                  <option value="recent">Más recientes</option>
                  <option value="comments">Más comentadas</option>
                  <option value="positives">Más positivas</option>
                </select>
              </div>
            </SoftCard>

            {/* form nueva publicación */}
            {showNew && (
              <SoftCard className="mb-5" innerClassName="p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Nueva publicación</h2>

                {categorias.length === 0 ? (
                  <p className="text-gray-700">No hay categorías. Pídele al administrador que cree una.</p>
                ) : (
                  <form onSubmit={crearPublicacion} className="space-y-3">
                    <input
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Título de tu publicación..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                    />

                    <select
                      value={categoriaId}
                      onChange={(e) => setCategoriaId(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
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
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowNew(false)}
                        className="px-4 py-2 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 bg-white"
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
              </SoftCard>
            )}

            {/* posts */}
            {loading ? (
              <SoftCard innerClassName="p-6 shadow-sm">
                <div className="text-gray-600">Cargando foro...</div>
              </SoftCard>
            ) : publicacionesFiltradas.length === 0 ? (
              <SoftCard innerClassName="p-6 shadow-sm">
                <div className="text-gray-600">No hay publicaciones para mostrar.</div>
              </SoftCard>
            ) : (
              <div className="space-y-4">
                {publicacionesFiltradas.map((p) => {
                  const cat = categoriaById(p.categoria_id);
                  const color = cat?.color || "#2563EB";
                  const coms = comentariosDePub(p.id);
                  const canManage = canManagePost(p);
                  const isEditing = editingPostId === p.id;

                  const myTipo = miReaccionEnPub(p.id)?.tipo || null;

                  const likesPub = contarLikesPub(p.id);
                  const lovesPub = contarLovesPub(p.id);
                  const positivos = likesPub + lovesPub;

                  const importantes = contarImportantes(p.id);
                  const destacada = isDestacada(p);

                  const pubFecha = p.fecha_publicacion || p.created_at;
                  const pubUpd = p.fecha_actualizacion;

                  const autor = getUser(p.usuario_id, p);

                  return (
                    <SoftCard
                      key={p.id}
                      innerClassName={
                        "shadow-sm overflow-hidden " + (destacada ? "border-yellow-300" : "border-gray-200")
                      }
                    >
                      {destacada && (
                        <div className="bg-yellow-50 border-b border-yellow-200 px-5 py-2 text-sm text-yellow-800 font-semibold flex items-center gap-2">
                          ⭐ Publicación destacada
                        </div>
                      )}

                      <div className="p-5">
                        {/* header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar letters={userInitials(p.usuario_id, p)} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-gray-900 truncate">
                                  {userDisplayName(p.usuario_id, p)}
                                </p>
                                <RolePill role={autor?.tipo_usuario} />
                                <Badge label={cat?.nombre || "Sin categoría"} color={color} />
                              </div>

                              {/* ✅ ahora con hora */}
                              <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                                <span>Publicado: {fmtDateTime(pubFecha)}</span>
                                {pubUpd && pubUpd !== pubFecha && <span className="text-gray-400">•</span>}
                                {pubUpd && pubUpd !== pubFecha && <span>Editado: {fmtDateTime(pubUpd)}</span>}
                              </div>
                            </div>
                          </div>

                          {/* contador total se queda */}
                          <div className="text-sm text-gray-500 flex gap-3 shrink-0">
                            <span title="Comentarios">💬 {coms.length}</span>
                            <span title="Positivas (total)">👍/❤️ {positivos}</span>
                          </div>
                        </div>

                        {!isEditing ? (
                          <>
                            <h3 className="text-xl font-extrabold text-gray-900 mt-4">{p.titulo}</h3>
                            <p className="text-gray-700 mt-2 whitespace-pre-wrap leading-relaxed">{p.contenido}</p>
                          </>
                        ) : (
                          <div className="mt-4 space-y-3">
                            <input
                              value={editTitulo}
                              onChange={(e) => setEditTitulo(e.target.value)}
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                              placeholder="Título"
                            />
                            <select
                              value={editCategoriaId}
                              onChange={(e) => setEditCategoriaId(e.target.value)}
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
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
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                              placeholder="Contenido"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={cancelEditPost}
                                disabled={busy}
                                className="px-4 py-2 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 disabled:opacity-60 bg-white"
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
                        <div className="flex flex-wrap gap-2 mt-5">
                          <button
                            onClick={() => reaccionar({ publicacionId: p.id, comentarioId: null, tipo: "like" })}
                            disabled={busy}
                            className={
                              "px-4 py-2 rounded-xl font-semibold disabled:opacity-60 border border-gray-200 " +
                              (myTipo === "like"
                                ? "bg-blue-700 text-white hover:bg-blue-800"
                                : "bg-white hover:bg-gray-50")
                            }
                          >
                            👍 Likes ({likesPub})
                          </button>

                          <button
                            onClick={() => reaccionar({ publicacionId: p.id, comentarioId: null, tipo: "love" })}
                            disabled={busy}
                            className={
                              "px-4 py-2 rounded-xl font-semibold disabled:opacity-60 border border-gray-200 " +
                              (myTipo === "love"
                                ? "bg-pink-600 text-white hover:bg-pink-700"
                                : "bg-white hover:bg-gray-50")
                            }
                          >
                            ❤️ Me gustas ({lovesPub})
                          </button>

                          {isAdmin && (
                            <>
                              {importantes === 0 && (
                                <button
                                  onClick={() => reaccionar({ publicacionId: p.id, comentarioId: null, tipo: "important" })}
                                  disabled={busy}
                                  className="px-4 py-2 rounded-xl font-semibold disabled:opacity-60 border border-gray-200 bg-white hover:bg-yellow-50"
                                  title="Destacar publicación"
                                >
                                  ⭐ Destacar
                                </button>
                              )}

                              {importantes > 0 && (
                                <button
                                  onClick={() => adminQuitarDestacadosDePost(p.id)}
                                  disabled={busy}
                                  className="px-4 py-2 rounded-xl border font-semibold hover:bg-red-50 text-red-700 border-red-200 disabled:opacity-60 bg-white"
                                  title="Quita el destacado de TODOS los administradores"
                                >
                                  🧹 Quitar destacado
                                </button>
                              )}
                            </>
                          )}

                          <button
                            onClick={() => setOpenComments((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                            className="px-4 py-2 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 bg-white"
                          >
                            {openComments[p.id] ? "Ocultar comentarios" : "Ver / Comentar"}
                          </button>

                          {canManage && !isEditing && (
                            <>
                              <button
                                onClick={() => startEditPost(p)}
                                disabled={busy}
                                className="px-4 py-2 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 disabled:opacity-60 bg-white"
                              >
                                ✏️ Editar
                              </button>
                              <button
                                onClick={() => eliminarPost(p)}
                                disabled={busy}
                                className="px-4 py-2 rounded-xl border font-semibold hover:bg-red-50 text-red-700 border-red-200 disabled:opacity-60 bg-white"
                              >
                                🗑️ Eliminar
                              </button>
                            </>
                          )}
                        </div>

                        {/* comentarios */}
                        {openComments[p.id] && (
                          <div className="mt-5 border-t border-gray-200 pt-4">
                            <SoftCard innerClassName="p-3">
                              <div className="flex gap-2">
                                <input
                                  value={comentarioTexto[p.id] || ""}
                                  onChange={(e) => setComentarioTexto((prev) => ({ ...prev, [p.id]: e.target.value }))}
                                  placeholder="Escribe un comentario..."
                                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 bg-white"
                                />
                                <button
                                  onClick={() => comentar(p.id)}
                                  disabled={busy}
                                  className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-xl"
                                >
                                  Comentar
                                </button>
                              </div>
                            </SoftCard>

                            <div className="space-y-3 mt-3">
                              {coms.length === 0 ? (
                                <p className="text-gray-600">Aún no hay comentarios.</p>
                              ) : (
                                coms.map((c) => {
                                  const isEditingC = editingCommentId === c.id;
                                  const canC = canManageComment(c);

                                  const myTipoC = miReaccionEnComentario(c.id)?.tipo || null;
                                  const likesC = contarLikesComentario(c.id);
                                  const lovesC = contarLovesComentario(c.id);

                                  const cFecha = c.fecha_comentario || c.created_at;
                                  const cUpd = c.fecha_actualizacion;

                                  const autorC = getUser(c.usuario_id, c);

                                  return (
                                    <SoftCard key={c.id} innerClassName="p-4">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 min-w-0">
                                          <Avatar letters={userInitials(c.usuario_id, c)} />
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <p className="font-bold text-gray-900 truncate">
                                                {userDisplayName(c.usuario_id, c)}
                                              </p>
                                              <RolePill role={autorC?.tipo_usuario} />
                                              <span className="text-xs text-gray-400">•</span>
                                              <span className="text-xs text-gray-500">Comentario #{c.id}</span>
                                            </div>

                                            {/* ✅ ahora con hora */}
                                            <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                                              <span>Comentó: {fmtDateTime(cFecha)}</span>
                                              {cUpd && cUpd !== cFecha && <span className="text-gray-400">•</span>}
                                              {cUpd && cUpd !== cFecha && <span>Editado: {fmtDateTime(cUpd)}</span>}
                                            </div>
                                          </div>
                                        </div>

                                        {canC && (
                                          <div className="flex gap-2">
                                            {!isEditingC ? (
                                              <>
                                                <button
                                                  onClick={() => startEditComment(c)}
                                                  disabled={busy}
                                                  className="text-sm px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-60 bg-white"
                                                >
                                                  ✏️ Editar
                                                </button>
                                                <button
                                                  onClick={() => eliminarComentario(c)}
                                                  disabled={busy}
                                                  className="text-sm px-3 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-60 bg-white"
                                                >
                                                  🗑️ Eliminar
                                                </button>
                                              </>
                                            ) : (
                                              <>
                                                <button
                                                  onClick={cancelEditComment}
                                                  disabled={busy}
                                                  className="text-sm px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-60 bg-white"
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
                                        <p className="text-gray-800 whitespace-pre-wrap mt-3 leading-relaxed">{c.contenido}</p>
                                      ) : (
                                        <textarea
                                          value={editCommentText}
                                          onChange={(e) => setEditCommentText(e.target.value)}
                                          rows={3}
                                          className="w-full border border-gray-200 rounded-xl px-3 py-2 mt-3 bg-white"
                                        />
                                      )}

                                      {/* Reacciones de comentario */}
                                      <div className="flex flex-wrap gap-2 mt-4">
                                        <button
                                          onClick={() => reaccionar({ publicacionId: p.id, comentarioId: c.id, tipo: "like" })}
                                          disabled={busy}
                                          className={
                                            "px-3 py-1.5 rounded-lg font-semibold text-sm disabled:opacity-60 border border-gray-200 " +
                                            (myTipoC === "like"
                                              ? "bg-blue-700 text-white hover:bg-blue-800"
                                              : "bg-white hover:bg-gray-50")
                                          }
                                          title={`Likes: ${likesC}`}
                                        >
                                          👍 Like ({likesC})
                                        </button>

                                        <button
                                          onClick={() => reaccionar({ publicacionId: p.id, comentarioId: c.id, tipo: "love" })}
                                          disabled={busy}
                                          className={
                                            "px-3 py-1.5 rounded-lg font-semibold text-sm disabled:opacity-60 border border-gray-200 " +
                                            (myTipoC === "love"
                                              ? "bg-pink-600 text-white hover:bg-pink-700"
                                              : "bg-white hover:bg-gray-50")
                                          }
                                          title={`Me gusta: ${lovesC}`}
                                        >
                                          ❤️ Me gusta ({lovesC})
                                        </button>
                                      </div>
                                    </SoftCard>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </SoftCard>
                  );
                })}
              </div>
            )}
          </div>

          {/* sidebar */}
          <div className="space-y-5">
            <SoftCard innerClassName="p-5 shadow-sm">
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
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                  <p className="text-xl font-bold">{myStats.myPosts}</p>
                  <p className="text-sm text-gray-600">Posts</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                  <p className="text-xl font-bold">{myStats.myComentarios}</p>
                  <p className="text-sm text-gray-600">Comentarios</p>
                </div>
              </div>

              {/* ✅ FIX: este aviso solo tiene sentido para admin (para que lo arregle en backend).
                 Para ciudadano NO lo mostramos. */}
              {isAdmin && usuarios.length === 0 && (
                <div className="mt-4 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl p-3">
                  Nota: no se encontró endpoint de usuarios ("/usuarios" o "/users"). Por eso, en publicaciones/comentarios
                  se mostrará “Usuario #ID”.
                </div>
              )}
            </SoftCard>

            <SoftCard innerClassName="p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Reglas del Foro</h3>
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                <li>Mantén el respeto hacia otros usuarios</li>
                <li>Publica en la categoría correcta</li>
                <li>Evita spam y contenido repetido</li>
                <li>Usa títulos descriptivos</li>
              </ul>
            </SoftCard>
          </div>
        </div>
      </div>
    </div>
  );
}
