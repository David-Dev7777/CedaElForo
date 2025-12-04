import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import React, { useState } from 'react';
import es from 'date-fns/locale/es';

registerLocale('es', es);

function Calendario() {
  const [selectedDate, setSelectedDate] = useState(new Date()); // 👈 inicia en el mes actual

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Selecciona una Fecha
        </h2>

        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          locale="es"
          dateFormat="dd/MM/yyyy"
          showPopperArrow={false}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholderText="Haz clic para seleccionar una fecha"
        />

        {selectedDate && (
          <p className="mt-4 text-center text-gray-700">
            Fecha seleccionada: {selectedDate.toLocaleDateString('es-ES')}
          </p>
        )}
      </div>
    </div>
  );
}

export default Calendario;