import { useEffect, useMemo, useState } from "react";

/** UI helpers  */
function SoftCard({ className = "", innerClassName = "", children }) {
  return (
    <div className={"bg-gray-50 p-1 rounded-3xl " + className}>
      <div className={"bg-white border border-gray-200 rounded-2xl " + innerClassName}>
        {children}
      </div>
    </div>
  );
}

function Badge({ label, color = "#2563EB" }) {
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-200"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {label}
    </span>
  );
}

function Feriados() {
  const [api, setApi] = useState([]);
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  const [anyoCalendario, setAnyoCalendario] = useState(new Date().getFullYear());

  // ✅ extras UI (no cambian tu estructura)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filtros extra (opcionales)
  const [q, setQ] = useState("");
  const [soloIrrenunciables, setSoloIrrenunciables] = useState(false);

  // detalle del día seleccionado
  const [seleccion, setSeleccion] = useState({ fechaISO: null, feriado: null });

  const fecha = new Date();
  const anyoActual = fecha.getFullYear();

  const getApi = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("https://api.boostr.cl/holidays.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setApi(data?.data || []);
    } catch (e) {
      setError(e.message || "No se pudo cargar la API de feriados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getApi();
  }, []);

  const formatearFecha = (fechaISO) => {
    const [, mes, dia] = fechaISO.split("-");
    return `${dia}-${mes}`;
  };

  const formatearTipo = (extra) => {
    return extra === "Civil e Irrenunciable" ? "Irrenunciable" : extra;
  };

  // ✅ set para lookup rápido
  const feriadosSet = useMemo(() => new Set(api.map((f) => f.date)), [api]);

  // ✅ mapa para obtener el feriado por fecha (para detalle)
  const feriadosByDate = useMemo(() => {
    const m = new Map();
    for (const f of api) m.set(f.date, f);
    return m;
  }, [api]);

  const diasDelMes = new Date(anyoCalendario, mesActual + 1, 0).getDate();

  // lunes=0 ... domingo=6 (como ya lo tenías)
  const primerDiaSemana = (new Date(anyoCalendario, mesActual, 1).getDay() + 6) % 7;

  const mesAnterior = () => {
    if (mesActual === 0) {
      setMesActual(11);
      setAnyoCalendario((a) => a - 1);
    } else {
      setMesActual((m) => m - 1);
    }
  };

  const mesSiguiente = () => {
    if (mesActual === 11) {
      setMesActual(0);
      setAnyoCalendario((a) => a + 1);
    } else {
      setMesActual((m) => m + 1);
    }
  };

  const mesLabel = new Date(anyoCalendario, mesActual).toLocaleString("es-CL", { month: "long" });

  // hoy para resaltar
  const hoy = new Date();
  const hoyISO = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(
    2,
    "0"
  )}`;

  // tabla filtrada (extra de UI, no rompe tu base)
  const feriadosFiltrados = useMemo(() => {
    let list = [...api];

    if (soloIrrenunciables) list = list.filter((f) => !!f.inalienable);

    if (q.trim()) {
      const qq = q.toLowerCase();
      list = list.filter((f) => (f.title || "").toLowerCase().includes(qq));
    }

    list.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    return list;
  }, [api, q, soloIrrenunciables]);

  const stats = useMemo(() => {
    const total = api.length;
    const irr = api.filter((f) => !!f.inalienable).length;
    return { total, irr };
  }, [api]);

  const onClickDia = (fechaISO) => {
    const feriado = feriadosByDate.get(fechaISO) || null;
    setSeleccion({ fechaISO, feriado });
  };

  return (
    <div className="w-full bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header (estilo Foro.jsx) */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Feriados de Chile del año {anyoActual}
            </h1>
            <p className="text-gray-600 mt-1">
              Calendario mensual + tabla completa de feriados aplicables a todo el territorio nacional.
            </p>
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

        {/* Layout estilo Foro: calendario + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Calendario */}
          <div className="lg:col-span-2">
            <SoftCard innerClassName="p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4">
                <button
                  onClick={mesAnterior}
                  className="px-4 py-2 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 bg-white"
                >
                  ←
                </button>

                <div className="text-center min-w-0">
                  <h2 className="font-extrabold text-gray-900 capitalize truncate">
                    {mesLabel} {anyoCalendario}
                  </h2>
                  <p className="text-xs text-gray-500">Click en un día para ver detalle</p>
                </div>

                <button
                  onClick={mesSiguiente}
                  className="px-4 py-2 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 bg-white"
                >
                  →
                </button>
              </div>

              <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-600 mb-2">
                {["L", "M", "M", "J", "V", "S", "D"].map((dia) => (
                  <div key={dia} className="py-2">
                    {dia}
                  </div>
                ))}
              </div>

              {loading ? (
                <div className="text-gray-600 p-4">Cargando calendario...</div>
              ) : (
                <div className="grid grid-cols-7 gap-2 text-center">
                  {Array(primerDiaSemana)
                    .fill(null)
                    .map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}

                  {Array.from({ length: diasDelMes }, (_, i) => {
                    const dia = i + 1;
                    const fechaISO = `${anyoCalendario}-${String(mesActual + 1).padStart(2, "0")}-${String(dia).padStart(
                      2,
                      "0"
                    )}`;
                    const esFeriado = feriadosSet.has(fechaISO);
                    const esHoy = fechaISO === hoyISO;

                    return (
                      <button
                        key={fechaISO}
                        onClick={() => onClickDia(fechaISO)}
                        className={
                          "h-10 flex items-center justify-center rounded-xl border text-sm font-semibold transition " +
                          (esFeriado
                            ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
                            : "bg-white border-gray-200 hover:bg-gray-50") +
                          (esHoy ? " ring-2 ring-blue-200" : "") +
                          (seleccion.fechaISO === fechaISO ? " ring-2 ring-gray-300" : "")
                        }
                        title={esFeriado ? "Feriado" : "Día normal"}
                      >
                        {dia}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-red-600 inline-block" />Feriado
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 rounded border border-gray-300 inline-block" />Día normal
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 rounded border border-blue-200 inline-block" />Hoy
                </span>
              </div>
            </SoftCard>

            {/* Detalle del día seleccionado */}
            {seleccion?.fechaISO && (
              <SoftCard className="mt-5" innerClassName="p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900">Detalle del día</h3>
                    <p className="text-sm text-gray-600">Fecha: {formatearFecha(seleccion.fechaISO)}</p>
                  </div>

                  {seleccion.feriado ? (
                    <Badge
                      label={seleccion.feriado.inalienable ? "Irrenunciable" : "Feriado"}
                      color={seleccion.feriado.inalienable ? "#B91C1C" : "#2563EB"}
                    />
                  ) : (
                    <Badge label="No es feriado" color="#6B7280" />
                  )}
                </div>

                <div className="mt-3">
                  {seleccion.feriado ? (
                    <>
                      <p className="text-gray-900 font-semibold">{seleccion.feriado.title}</p>
                      <p className="text-sm text-gray-600 mt-1">Tipo: {formatearTipo(seleccion.feriado.extra)}</p>
                    </>
                  ) : (
                    <p className="text-gray-600">Este día no aparece como feriado.</p>
                  )}
                </div>
              </SoftCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <SoftCard innerClassName="p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Resumen</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                  <p className="text-xl font-bold">{stats.total}</p>
                  <p className="text-sm text-gray-600">Feriados</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                  <p className="text-xl font-bold">{stats.irr}</p>
                  <p className="text-sm text-gray-600">Irrenunciables</p>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl p-3">
                Tip: usa el buscador para encontrar feriados por nombre (ej: “Navidad”).
              </div>
            </SoftCard>

            <SoftCard innerClassName="p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Buscar y filtrar</h3>

              <div className="space-y-3">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar feriado..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                />

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={soloIrrenunciables}
                    onChange={(e) => setSoloIrrenunciables(e.target.checked)}
                  />Solo irrenunciables
                </label>

                <div className="flex gap-2 flex-wrap">
                  <Badge label={`Mostrando: ${feriadosFiltrados.length}`} color="#2563EB" />
                  <Badge label={`Año: ${anyoActual}`} color="#6B7280" />
                </div>
              </div>
            </SoftCard>
          </div>
        </div>

        {/* Tabla estilo Foro.jsx */}
        <SoftCard innerClassName="shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Tabla de feriados</h2>
              <p className="text-sm text-gray-600">
                Mostrando <b>{feriadosFiltrados.length}</b> de <b>{api.length}</b>
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-gray-600">Cargando feriados...</div>
          ) : feriadosFiltrados.length === 0 ? (
            <div className="p-6 text-gray-600">No hay resultados con esos filtros.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Día</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Nombre</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Tipo</th>
                  </tr>
                </thead>

                <tbody>
                  {feriadosFiltrados.map((feriado) => (
                    <tr key={feriado.date} className="border-t border-gray-200">
                      <td className="px-5 py-4 text-sm text-gray-700">{formatearFecha(feriado.date)}</td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{feriado.title}</span>
                          {feriado.inalienable && <Badge label="Irrenunciable" color="#B91C1C" />}
                        </div>
                      </td>

                      <td className={"px-5 py-4 text-sm " + (feriado.inalienable ? "text-red-700 font-semibold" : "text-gray-700")}>
                        {formatearTipo(feriado.extra)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SoftCard>
      </div>
    </div>
  );
}

export default Feriados;