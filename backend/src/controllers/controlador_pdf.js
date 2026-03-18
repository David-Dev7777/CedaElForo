import PDFDocument from 'pdfkit'

// Extrae texto recursivamente de las estructuras hijas
function extraerTextoCompleto(estructuras, lineas = []) {
  if (!estructuras) return lineas
  const items = estructuras.EstructuraFuncional || estructuras
  const arr = Array.isArray(items) ? items : [items].filter(Boolean)
  for (const item of arr) {
    if (item.Metadatos?.NombreParte) {
      const nombre = typeof item.Metadatos.NombreParte === 'object'
        ? item.Metadatos.NombreParte['#text'] || ''
        : item.Metadatos.NombreParte
      lineas.push({ tipo: 'articulo', texto: `Artículo ${nombre}` })
    }
    if (item.Texto) {
      const texto = typeof item.Texto === 'object'
        ? item.Texto['#text'] || ''
        : item.Texto
      if (texto.trim()) lineas.push({ tipo: 'texto', texto: texto.trim() })
    }
    if (item.EstructurasFuncionales) {
      extraerTextoCompleto(item.EstructurasFuncionales, lineas)
    }
  }
  return lineas
}

export const descargarArticuloPDF = (req, res) => {
  try {
    const { titulo, nombre, texto, hijos } = req.body

    if (!texto && !nombre && !hijos) {
      return res.status(400).json({ error: 'No se proporcionó contenido para el PDF' })
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="ley18290-art${nombre || 'articulo'}.pdf"`)

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 60, right: 60 }
    })

    doc.pipe(res)

    // Header
    doc.rect(0, 0, doc.page.width, 80).fill('#1e3a5f')
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold')
      .text('REPÚBLICA DE CHILE', 60, 20, { align: 'center' })
      .fontSize(14).text('LEY DE TRÁNSITO N° 18.290', 60, 38, { align: 'center' })
      .fontSize(9).font('Helvetica').fillColor('#93c5fd')
      .text('Biblioteca del Congreso Nacional de Chile', 60, 60, { align: 'center' })

    doc.moveDown(3)

    // Título sección
    if (titulo) {
      doc.fillColor('#1e3a5f').fontSize(13).font('Helvetica-Bold')
        .text(titulo.toUpperCase(), { align: 'center' }).moveDown(0.5)
      doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y)
        .strokeColor('#3b82f6').lineWidth(1).stroke().moveDown(0.8)
    }

    // Artículo principal
    if (nombre) {
      doc.fillColor('#1e40af').fontSize(11).font('Helvetica-Bold')
        .text(`Artículo ${nombre}`).moveDown(0.5)
    }
    if (texto) {
      doc.fillColor('#374151').fontSize(10).font('Helvetica')
        .text(texto, { align: 'justify', lineGap: 4 }).moveDown(0.8)
    }

    // Subarticulos hijos
    if (hijos && hijos.length > 0) {
      const lineas = extraerTextoCompleto(hijos)
      for (const linea of lineas) {
        if (linea.tipo === 'articulo') {
          doc.moveDown(0.5)
            .fillColor('#1e40af').fontSize(10).font('Helvetica-Bold')
            .text(linea.texto).moveDown(0.3)
        } else {
          doc.fillColor('#374151').fontSize(10).font('Helvetica')
            .text(linea.texto, { align: 'justify', lineGap: 4 }).moveDown(0.5)
        }
      }
    }

    // Footer
    const footerY = doc.page.height - 50
    doc.moveTo(60, footerY).lineTo(doc.page.width - 60, footerY)
      .strokeColor('#e2e8f0').lineWidth(0.5).stroke()
    doc.fillColor('#94a3b8').fontSize(8).font('Helvetica')
      .text(`Generado desde Ceda el Foro — ${new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}`,
        60, footerY + 10, { align: 'center' })

    doc.end()
  } catch (err) {
    console.error('Error generando PDF:', err)
    res.status(500).json({ error: 'Error al generar el PDF' })
  }
}