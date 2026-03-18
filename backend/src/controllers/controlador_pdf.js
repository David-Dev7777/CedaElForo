import PDFDocument from 'pdfkit'



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

    const nombreLimpio = nombre?.toLowerCase().startsWith('artículo') ? nombre : `Artículo ${nombre}`

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="ley18290-art${nombre || 'articulo'}.pdf"`)

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 80, bottom: 70, left: 70, right: 70 }
    })

    doc.pipe(res)

    const pageW = doc.page.width
    const contentW = pageW - 140

    // ── Header ──────────────────────────────────────────
    doc.rect(0, 0, pageW, 90).fill('#1e3a5f')

    // Línea decorativa dorada
    doc.rect(0, 88, pageW, 3).fill('#3b82f6')

    doc
      .fillColor('#93c5fd')
      .fontSize(8)
      .font('Helvetica')
      .text('REPÚBLICA DE CHILE', 70, 18, { width: contentW, align: 'center', characterSpacing: 2 })

    doc
      .fillColor('#ffffff')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('LEY DE TRÁNSITO N° 18.290', 70, 34, { width: contentW, align: 'center' })

    doc
      .fillColor('#93c5fd')
      .fontSize(8)
      .font('Helvetica')
      .text('Biblioteca del Congreso Nacional de Chile', 70, 60, { width: contentW, align: 'center' })

    // ── Contenido ────────────────────────────────────────
    doc.y = 110

    // Título de sección si existe
    if (titulo) {
      doc
        .fillColor('#1e3a5f')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text(titulo.toUpperCase(), 70, doc.y, { width: contentW, align: 'center', characterSpacing: 1 })
        .moveDown(0.4)

      doc
        .moveTo(70, doc.y)
        .lineTo(pageW - 70, doc.y)
        .strokeColor('#e2e8f0')
        .lineWidth(0.5)
        .stroke()
        .moveDown(0.6)
    }

    // Nombre del artículo
    if (nombre) {
      // Badge azul
      const badgeText = nombreLimpio
      const badgeW = 200
      const badgeX = 70

      doc
        .rect(badgeX, doc.y, badgeW, 22)
        .fill('#eff6ff')

      doc
        .rect(badgeX, doc.y, 4, 22)
        .fill('#2563eb')

      doc
        .fillColor('#1e40af')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(badgeText, badgeX + 12, doc.y + 5, { width: badgeW - 16 })

      doc.moveDown(1.2)
    }


// Texto principal
if (texto) {
  doc
    .fillColor('#1f2937')
    .fontSize(10)
    .font('Helvetica')
    .text(texto, 70, doc.y, {
      width: contentW,
      align: 'justify',
      lineGap: 5,
      paragraphGap: 4
    })
    .moveDown(1)
}

// Subarticulos hijos
if (hijos && hijos.length > 0 || (hijos && hijos.EstructuraFuncional)) {
  const lineas = extraerTextoCompleto(hijos)

  if (lineas.length > 0) {
    // Separador
    doc
      .moveTo(70, doc.y)
      .lineTo(pageW - 70, doc.y)
      .strokeColor('#dbeafe')
      .lineWidth(1)
      .stroke()
      .moveDown(0.8)

    doc
      .fillColor('#6b7280')
      .fontSize(8)
      .font('Helvetica')
      .text('SUBARTICULOS', 70, doc.y, { characterSpacing: 1 })
      .moveDown(0.6)

    for (const linea of lineas) {
      if (linea.tipo === 'articulo') {
        doc.moveDown(0.4)
        doc
          .fillColor('#1e40af')
          .fontSize(9.5)
          .font('Helvetica-Bold')
          .text(linea.texto, 70, doc.y, { width: contentW })
          .moveDown(0.3)
      } else {
        doc
          .fillColor('#374151')
          .fontSize(9.5)
          .font('Helvetica')
          .text(linea.texto, 70, doc.y, {
            width: contentW,
            align: 'justify',
            lineGap: 4
          })
          .moveDown(0.6)
      }
    }
  }
}

    // ── Footer ───────────────────────────────────────────
    const footerY = doc.page.height - 55
    doc
      .rect(0, footerY - 5, pageW, 60)
      .fill('#f8fafc')

    doc
      .moveTo(70, footerY - 5)
      .lineTo(pageW - 70, footerY - 5)
      .strokeColor('#e2e8f0')
      .lineWidth(0.5)
      .stroke()

    doc
      .fillColor('#94a3b8')
      .fontSize(8)
      .font('Helvetica')
      .text(
        `Generado desde Ceda el Foro  •  ${new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}`,
        70, footerY + 8,
        { width: contentW, align: 'center' }
      )

    doc
      .fillColor('#cbd5e1')
      .fontSize(7)
      .text('Este documento es de carácter informativo. Verifique la versión oficial en www.bcn.cl',
        70, footerY + 22,
        { width: contentW, align: 'center' }
      )

    doc.end()

  } catch (err) {
    console.error('Error generando PDF:', err)
    res.status(500).json({ error: 'Error al generar el PDF' })
  }
}