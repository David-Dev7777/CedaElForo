import { useState } from 'react'

export default function ModalPDF({ item, titulo, nombre, texto, onClose }) {
  const [incluirHijos, setIncluirHijos] = useState(false)
  const [descargando, setDescargando] = useState(false)

  const descargar = async () => {
    setDescargando(true)
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
      const response = await fetch(`${API}/ley-transito/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          titulo,
          nombre,
          texto,
          hijos: incluirHijos ? (item.EstructurasFuncionales || null) : null
        })
      })
      if (!response.ok) throw new Error('Error generando PDF')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ley18290-art${nombre || 'articulo'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      onClose()
    } catch (err) {
      console.error('Error descargando PDF:', err)
    } finally {
      setDescargando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Vista previa del PDF</p>
              <p className="text-blue-200 text-xs">Ley de Tránsito N° 18.290</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Vista previa */}
        <div className="p-6">

          {/* Simulación hoja PDF */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden mb-5">

            {/* Header del PDF */}
            <div className="bg-blue-950 px-4 py-3 text-center">
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest">República de Chile</p>
              <p className="text-white text-sm font-bold">Ley de Tránsito N° 18.290</p>
            </div>

            {/* Contenido */}
            <div className="p-4 space-y-3 max-h-56 overflow-y-auto">
              {titulo && (
                <div className="border-b border-slate-200 pb-2">
                  <p className="text-blue-900 text-xs font-bold uppercase tracking-wide">{titulo}</p>
                </div>
              )}
              {nombre && (
                <p className="text-blue-700 text-xs font-bold">Artículo {nombre}</p>
              )}
              {texto && (
                <p className="text-slate-600 text-xs leading-relaxed text-justify line-clamp-6">{texto}</p>
              )}
              {incluirHijos && item.EstructurasFuncionales && (
                <div className="border-t border-slate-200 pt-2">
                  <p className="text-slate-400 text-xs italic">+ Subarticulos incluidos...</p>
                </div>
              )}
            </div>

            {/* Footer del PDF */}
            <div className="bg-slate-100 border-t border-slate-200 px-4 py-2 text-center">
              <p className="text-slate-400 text-xs">
                Generado desde Ceda el Foro — {new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Opción subarticulos */}
          {item.EstructurasFuncionales && (
            <label className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors mb-5">
              <input
                type="checkbox"
                checked={incluirHijos}
                onChange={e => setIncluirHijos(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <div>
                <p className="text-blue-800 text-sm font-semibold">Incluir subarticulos</p>
                <p className="text-blue-500 text-xs">Agrega todos los artículos hijos al PDF</p>
              </div>
            </label>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={descargar}
              disabled={descargando}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              {descargando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}