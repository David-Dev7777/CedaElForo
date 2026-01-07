import { useEffect, useState } from 'react';

function CalendarioFeriados({ feriados }) {
  const [mes, setMes] = useState(new Date().getMonth());
  const [anyo, setAnyo] = useState(new Date().getFullYear());

  const feriadosSet = new Set(feriados.map(f => f.date));

  const diasMes = new Date(anyo, mes + 1, 0).getDate();
  const primerDia = new Date(anyo, mes, 1).getDay();

  return (
    <div className="w-80 mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setMes(m => m === 0 ? 11 : m - 1)}>◀</button>
        <h2 className="font-bold">
          {new Date(anyo, mes).toLocaleString('es-CL', { month: 'long' })} {anyo}
        </h2>
        <button onClick={() => setMes(m => m === 11 ? 0 : m + 1)}>▶</button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {['D','L','M','M','J','V','S'].map(d => (
          <div key={d} className="font-bold">{d}</div>
        ))}

        {Array(primerDia).fill(null).map((_, i) => <div key={i} />)}

        {Array.from({ length: diasMes }, (_, i) => {
          const dia = i + 1;
          const fecha = `${anyo}-${String(mes + 1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;

          return (
            <div
              key={fecha}
              className={`p-2 rounded ${
                feriadosSet.has(fecha)
                  ? 'bg-red-500 text-white font-bold'
                  : ''
              }`}
            >
              {dia}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarioFeriados;
