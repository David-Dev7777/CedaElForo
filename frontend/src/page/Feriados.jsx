import { useEffect, useState } from 'react';

function Feriados() {
  const [api, setApi] = useState([]);
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  const [anyoCalendario, setAnyoCalendario] = useState(new Date().getFullYear());

  const fecha = new Date();
  const anyoActual = fecha.getFullYear();

  const getApi = async () => {
    const response = await fetch('https://api.boostr.cl/holidays.json');
    const data = await response.json();
    setApi(data.data);
  };

  useEffect(() => {
    getApi();
  }, []);

  const formatearFecha = (fechaISO) => {
    const [, mes, dia] = fechaISO.split('-');
    return `${dia}-${mes}`;
  };

  const formatearTipo = (extra) => {
    return extra === 'Civil e Irrenunciable'
      ? 'Irrenunciable'
      : extra;
  };

  const feriadosSet = new Set(api.map(f => f.date));

  const diasDelMes = new Date(anyoCalendario, mesActual + 1, 0).getDate();

  const primerDiaSemana =
    (new Date(anyoCalendario, mesActual, 1).getDay() + 6) % 7;

  const mesAnterior = () => {
    if (mesActual === 0) {
      setMesActual(11);
      setAnyoCalendario(a => a - 1);
    } else {
      setMesActual(m => m - 1);
    }
  };

  const mesSiguiente = () => {
    if (mesActual === 11) {
      setMesActual(0);
      setAnyoCalendario(a => a + 1);
    } else {
      setMesActual(m => m + 1);
    }
  };

  return (
    <div className="space-y-10">

      <h1 className="text-center font-bold text-4xl">
        Feriados de Chile del año {anyoActual}.
      </h1>

      <p className="text-neutral-500 italic text-center">
        Estos son los feriados de Chile del presente año, aplicables a todo el territorio nacional.
      </p>

      {/* CALENDARIO */}
      <div className="max-w-sm mx-auto">

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={mesAnterior}
            className="px-3 py-1 border rounded cursor-pointer hover:bg-neutral-300 active:bg-neutral-400 transition"
          >
            ←
          </button>

          <h2 className="font-bold capitalize">
            {new Date(anyoCalendario, mesActual).toLocaleString('es-CL', {
              month: 'long',
            })}{' '}
            {anyoCalendario}
          </h2>

          <button
            onClick={mesSiguiente}
            className="px-3 py-1 border rounded cursor-pointer hover:bg-neutral-300 active:bg-neutral-400 transition"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 text-center font-bold mb-2">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(dia => (
            <div key={dia}>{dia}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {Array(primerDiaSemana).fill(null).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: diasDelMes }, (_, i) => {
            const dia = i + 1;
            const fechaISO = `${anyoCalendario}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const esFeriado = feriadosSet.has(fechaISO);

            return (
              <div
                key={fechaISO}
                className={`p-2 rounded ${
                  esFeriado
                    ? 'bg-red-600 text-white font-bold'
                    : 'border'
                }`}
              >
                {dia}
              </div>
            );
          })}
        </div>
      </div>

      {/* TABLA CON LOS FERIADOS */}
      <div className="text-black italic text-2xl">
        <p>Tabla de feriados:</p>
      </div>
      <table className="mx-auto border-collapse">
        <tbody>
          <tr>
            <th className="font-bold border border-neutral-600 px-6 py-2">
              Día
            </th>
            <th className="font-bold border border-neutral-600 px-6 py-2">
              Nombre
            </th>
            <th className="font-bold border border-neutral-600 px-6 py-2">
              Tipo
            </th>
          </tr>

          {api.map((feriado) => (
            <tr key={feriado.date}>
              <td className="text-center border border-neutral-600 px-6 py-2">
                {formatearFecha(feriado.date)}
              </td>

              <td className="text-center border border-neutral-600 px-6 py-2">
                {feriado.title}
              </td>

              <td
                className={`text-center border border-neutral-600 px-6 py-2 ${
                  feriado.inalienable ? 'text-red-800 font-bold' : ''
                }`}
              >
                {formatearTipo(feriado.extra)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Feriados;
