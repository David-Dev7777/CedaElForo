import React, { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

// ===== UI helpers =====
function SoftCard({ className = "", innerClassName = "", children }) {
  return (
    <div className={"bg-gray-50 p-1 rounded-3xl " + className}>
      <div className={"bg-white border border-gray-200 rounded-2xl " + innerClassName}>
        {children}
      </div>
    </div>
  );
}

function initialsFromName(nombre, apellido, fallback = "US") {
  const n = (nombre || "").trim();
  const a = (apellido || "").trim();
  const i1 = n ? n[0] : "";
  const i2 = a ? a[0] : "";
  const out = (i1 + i2).toUpperCase();
  return out || fallback;
}

function Avatar({ letters }) {
  return (
    <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold shrink-0">
      {letters}
    </div>
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

function StatusPill({ active }) {
  return (
    <span
      className={
        "text-[11px] font-semibold px-2 py-0.5 rounded-full border " +
        (active
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-red-50 text-red-700 border-red-200")
      }
    >
      {active ? "Activo" : "Bloqueado"}
    </span>
  );
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Form (crear/editar)
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    tipo_usuario: "ciudadano",
    activo: true,
  });
  const [editId, setEditId] = useState(null);

  // Filtros UI
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | blocked

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/usuarios`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setEditId(null);
    setForm({
      nombre: "",
      apellido: "",
      email: "",
      password: "",
      tipo_usuario: "ciudadano",
      activo: true,
    });
  };

  const editar = (u) => {
    setEditId(u.id);
    setForm({
      nombre: u.nombre || "",
      apellido: u.apellido || "",
      email: u.email || "",
      password: "",
      tipo_usuario: u.tipo_usuario || "ciudadano",
      activo: !!u.activo,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const crearOActualizar = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones cliente (como tenías)
    const emailRegex = /^\S+@\S+\.\S+$/;
    const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!form.nombre || !form.apellido || !form.email || (!editId && !form.password)) {
      setError("Completa todos los campos requeridos");
      return;
    }
    if (!emailRegex.test(form.email)) {
      setError("El correo ingresado no tiene formato válido");
      return;
    }
    if (!editId) {
      if (!pwdRegex.test(form.password)) {
        setError("La contraseña debe tener mínimo 8 caracteres, incluir letras, números y un carácter especial");
        return;
      }
    } else {
      if (form.password && !pwdRegex.test(form.password)) {
        setError("La contraseña debe tener mínimo 8 caracteres, incluir letras, números y un carácter especial");
        return;
      }
    }

    setBusy(true);
    try {
      if (editId) {
        const payload = {
          email: form.email,
          password: form.password || undefined,
          nombre: form.nombre,
          apellido: form.apellido,
          tipo_usuario: form.tipo_usuario,
          activo: form.activo === true || form.activo === "true",
        };

        const res = await fetch(`${API}/api/usuarios/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `HTTP ${res.status}`);
        }

        await fetchUsuarios();
        resetForm();
        return;
      }

      const payload = {
        email: form.email,
        password_hash: form.password,
        nombre: form.nombre,
        apellido: form.apellido,
        tipo_usuario: form.tipo_usuario,
        activo: form.activo === true || form.activo === "true",
      };

      const res = await fetch(`${API}/api/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      await fetchUsuarios();
      resetForm();
    } catch (err) {
      setError(err.message || "Error creando/actualizando usuario");
    } finally {
      setBusy(false);
    }
  };

  const eliminar = async (id) => {
    const ok = confirm("¿Eliminar usuario?");
    if (!ok) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/usuarios/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchUsuarios();
    } catch (err) {
      setError(err.message || "Error eliminando");
    } finally {
      setBusy(false);
    }
  };

  const desbloquear = async (id) => {
    const ok = confirm("¿Desbloquear usuario?");
    if (!ok) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/usuarios/${id}/unlock`, { method: "POST", credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      await fetchUsuarios();
    } catch (err) {
      setError(err.message || "Error desbloqueando");
    } finally {
      setBusy(false);
    }
  };

  const usuariosFiltrados = useMemo(() => {
    let list = [...(usuarios || [])];

    // role filter
    if (roleFilter !== "all") {
      list = list.filter((u) => String(u.tipo_usuario) === String(roleFilter));
    }

    // status filter
    if (statusFilter === "active") list = list.filter((u) => u.activo !== false);
    if (statusFilter === "blocked") list = list.filter((u) => u.activo === false);

    // search
    if (q.trim()) {
      const qq = q.toLowerCase();
      list = list.filter((u) => {
        const full = `${u.nombre || ""} ${u.apellido || ""}`.toLowerCase();
        const email = (u.email || "").toLowerCase();
        const id = String(u.id || "");
        return full.includes(qq) || email.includes(qq) || id.includes(qq);
      });
    }

    // sort: admins first, then by id desc
    list.sort((a, b) => {
      const ra = a.tipo_usuario === "administrador" ? 1 : 0;
      const rb = b.tipo_usuario === "administrador" ? 1 : 0;
      if (rb !== ra) return rb - ra;
      return (b.id || 0) - (a.id || 0);
    });

    return list;
  }, [usuarios, q, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = usuarios.length;
    const admins = usuarios.filter((u) => u.tipo_usuario === "administrador").length;
    const activos = usuarios.filter((u) => u.activo !== false).length;
    const bloqueados = total - activos;
    return { total, admins, activos, bloqueados };
  }, [usuarios]);

  return (
    <div className="w-full bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Administración de Usuarios</h1>
            <p className="text-gray-600 mt-1">Crea, edita, bloquea/desbloquea y gestiona los roles</p>
          </div>

          <div className="flex gap-2">
            {editId && (
              <button
                onClick={resetForm}
                className="px-4 py-3 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 bg-white disabled:opacity-60"
                disabled={busy}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <SoftCard className="mb-5" innerClassName="p-4 border-red-200">
            <div className="bg-red-50 text-red-700 rounded-xl p-4 border border-red-200">
              <b>Error:</b> {error}
            </div>
          </SoftCard>
        )}

        {/* Formulario Crear / Editar */}
        <SoftCard className="mb-6" innerClassName="p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{editId ? "Editar usuario" : "Crear usuario"}</h2>
              <p className="text-sm text-gray-600">
                {editId ? `Editando ID #${editId}` : "Completa los campos para registrar un nuevo usuario"}
              </p>
            </div>

            <span className="text-xs text-gray-500">
              {busy ? "Procesando..." : " "}
            </span>
          </div>

          <form onSubmit={crearOActualizar} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 font-semibold">Nombre</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 font-semibold">Apellido</label>
              <input
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                placeholder="Apellido"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-gray-600 font-semibold">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 font-semibold">
                {editId ? "Nueva contraseña (opcional)" : "Contraseña"}
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder={editId ? "Dejar vacío para mantener" : "Mín. 8 + especial"}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 font-semibold">Rol</label>
              <select
                name="tipo_usuario"
                value={form.tipo_usuario}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white"
              >
                <option value="ciudadano">Ciudadano</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>

            <div className="md:col-span-6 flex items-center justify-between gap-3 mt-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={!!form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                />
                Activo
              </label>

              <button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-md disabled:opacity-60"
                disabled={busy}
              >
                {busy ? "Guardando..." : editId ? "Guardar cambios" : "Crear usuario"}
              </button>
            </div>
          </form>
        </SoftCard>

        {/* Stats + Filtros */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <SoftCard innerClassName="p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">Resumen</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                <p className="text-xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                <p className="text-xl font-bold">{stats.admins}</p>
                <p className="text-sm text-gray-600">Admins</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                <p className="text-xl font-bold">{stats.activos}</p>
                <p className="text-sm text-gray-600">Activos</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                <p className="text-xl font-bold">{stats.bloqueados}</p>
                <p className="text-sm text-gray-600">Bloqueados</p>
              </div>
            </div>
          </SoftCard>

          <div className="lg:col-span-2">
            <SoftCard innerClassName="p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Buscar y filtrar</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por nombre, email o ID..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                />

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                >
                  <option value="all">Todos los roles</option>
                  <option value="ciudadano">Ciudadano</option>
                  <option value="administrador">Administrador</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="blocked">Bloqueados</option>
                </select>
              </div>
            </SoftCard>
          </div>
        </div>

        {/* Lista */}
        <SoftCard innerClassName="shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Usuarios</h2>
              <p className="text-sm text-gray-600">
                Mostrando <b>{usuariosFiltrados.length}</b> de <b>{usuarios.length}</b>
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-gray-600">Cargando usuarios...</div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="p-6 text-gray-600">No hay usuarios para mostrar.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Usuario</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Email</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Rol</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Estado</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {usuariosFiltrados.map((u) => {
                    const letters = initialsFromName(u.nombre, u.apellido, String(u.id ?? "U").slice(0, 2));
                    const full = `${u.nombre || ""} ${u.apellido || ""}`.trim() || `Usuario #${u.id}`;
                    const active = u.activo !== false;

                    return (
                      <tr key={u.id} className="border-t border-gray-200">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar letters={letters} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-gray-900 truncate">{full}</p>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">ID #{u.id}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {u.apellido ? "" : "—"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-700">{u.email}</td>

                        <td className="px-5 py-4">
                          <RolePill role={u.tipo_usuario} />
                        </td>

                        <td className="px-5 py-4">
                          <StatusPill active={active} />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <button
                              onClick={() => editar(u)}
                              disabled={busy}
                              className="px-4 py-2 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 disabled:opacity-60 bg-white"
                            >
                              ✏️ Editar
                            </button>

                            <button
                              onClick={() => eliminar(u.id)}
                              disabled={busy}
                              className="px-4 py-2 rounded-xl border font-semibold hover:bg-red-50 text-red-700 border-red-200 disabled:opacity-60 bg-white"
                            >
                              🗑️ Eliminar
                            </button>

                            {!active && (
                              <button
                                onClick={() => desbloquear(u.id)}
                                disabled={busy}
                                className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
                              >
                                ✅ Desbloquear
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SoftCard>
      </div>
    </div>
  );
}
