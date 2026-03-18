import PDFDocument from 'pdfkit'

export const descargarArticuloPDF = (req, res) => {
  try {
    const { titulo, nombre, texto } = req.body

    if (!texto && !nombre) {
      return res.status(400).json({ error: 'No se proporcionó contenido para el PDF' })
    }

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="ley18290-${nombre || 'articulo'}.pdf"`)

    // Crear documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 60, right: 60 }
    })

    // Pipe directo a la respuesta
    doc.pipe(res)

    // Header del documento
    doc
      .rect(0, 0, doc.page.width, 80)
      .fill('#1e3a5f')

    doc
      .fillColor('#ffffff')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('REPÚBLICA DE CHILE', 60, 20, { align: 'center' })
      .fontSize(14)
      .text('LEY DE TRÁNSITO N° 18.290', 60, 38, { align: 'center' })
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#93c5fd')
      .text('Biblioteca del Congreso Nacional de Chile', 60, 60, { align: 'center' })

    // Línea decorativa
    doc.moveDown(3)

    // Título de sección
    if (titulo) {
      doc
        .fillColor('#1e3a5f')
        .fontSize(13)
        .font('Helvetica-Bold')
        .text(titulo.toUpperCase(), { align: 'center' })
        .moveDown(0.5)

      doc
        .moveTo(60, doc.y)
        .lineTo(doc.page.width - 60, doc.y)
        .strokeColor('#3b82f6')
        .lineWidth(1)
        .stroke()
        .moveDown(0.8)
    }

    // Nombre del artículo
    if (nombre) {
      doc
        .fillColor('#1e40af')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`Artículo ${nombre}`, { align: 'left' })
        .moveDown(0.5)
    }

    // Texto del artículo
    if (texto) {
      doc
        .fillColor('#374151')
        .fontSize(10)
        .font('Helvetica')
        .text(texto, {
          align: 'justify',
          lineGap: 4
        })
    }

    // Footer
    const footerY = doc.page.height - 50
    doc
      .moveTo(60, footerY)
      .lineTo(doc.page.width - 60, footerY)
      .strokeColor('#e2e8f0')
      .lineWidth(0.5)
      .stroke()

    doc
      .fillColor('#94a3b8')
      .fontSize(8)
      .font('Helvetica')
      .text(
        `Generado desde Ceda el Foro — ${new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}`,
        60, footerY + 10,
        { align: 'center' }
      )

    doc.end()

  } catch (err) {
    console.error('Error generando PDF:', err)
    res.status(500).json({ error: 'Error al generar el PDF' })
  }
}