import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export interface ReportCardSubject {
  name: string
  score: number
  grade: string
  remark: string
}

export interface ReportCardData {
  student_name: string
  admission_number: string
  class_name: string
  session: string
  term: string
  subjects: ReportCardSubject[]
  total: number
  average: number
  position?: string
}

// Generates a real, downloadable PDF report card entirely in the
// browser (no server round-trip needed) using pdf-lib. Returns the
// raw bytes so the caller can trigger a download.
export async function generateReportCard(data: ReportCardData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4 in points
  const { width, height } = page.getSize()

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const primaryColor = rgb(0.69, 0.55, 0.34)
  const grayColor = rgb(0.42, 0.4, 0.36)
  const lightGray = rgb(0.93, 0.92, 0.87)
  const black = rgb(0.08, 0.07, 0.07)

  let y = height - 50

  // Header
  page.drawText('Good Foundation Group of Schools', {
    x: 50,
    y,
    size: 18,
    font: boldFont,
    color: primaryColor,
  })
  y -= 20
  page.drawText('Academic Report Card', {
    x: 50,
    y,
    size: 12,
    font,
    color: grayColor,
  })
  y -= 10
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 2,
    color: primaryColor,
  })
  y -= 30

  // Student info
  const infoLines = [
    `Student: ${data.student_name}`,
    `Admission Number: ${data.admission_number}`,
    `Class: ${data.class_name}`,
    `Session: ${data.session}   Term: ${data.term}`,
  ]
  for (const line of infoLines) {
    page.drawText(line, { x: 50, y, size: 11, font, color: black })
    y -= 18
  }
  y -= 12

  // Table header
  const colX = { subject: 50, score: 300, grade: 380, remark: 450 }
  page.drawRectangle({
    x: 50,
    y: y - 6,
    width: width - 100,
    height: 24,
    color: primaryColor,
  })
  page.drawText('Subject', { x: colX.subject + 6, y: y, size: 11, font: boldFont, color: rgb(1, 1, 1) })
  page.drawText('Score', { x: colX.score, y: y, size: 11, font: boldFont, color: rgb(1, 1, 1) })
  page.drawText('Grade', { x: colX.grade, y: y, size: 11, font: boldFont, color: rgb(1, 1, 1) })
  page.drawText('Remark', { x: colX.remark, y: y, size: 11, font: boldFont, color: rgb(1, 1, 1) })
  y -= 30

  // Table rows
  let rowIndex = 0
  for (const subject of data.subjects) {
    if (y < 100) break // stop before running off the page

    if (rowIndex % 2 === 1) {
      page.drawRectangle({
        x: 50,
        y: y - 6,
        width: width - 100,
        height: 22,
        color: lightGray,
      })
    }

    page.drawText(subject.name, { x: colX.subject + 6, y, size: 10, font, color: black })
    page.drawText(String(subject.score), { x: colX.score, y, size: 10, font, color: black })
    page.drawText(subject.grade, { x: colX.grade, y, size: 10, font, color: black })
    page.drawText(subject.remark, { x: colX.remark, y, size: 10, font, color: black })

    y -= 22
    rowIndex++
  }

  y -= 20
  page.drawLine({
    start: { x: 50, y: y + 10 },
    end: { x: width - 50, y: y + 10 },
    thickness: 1,
    color: grayColor,
  })
  y -= 10

  // Summary
  page.drawText(`Total: ${data.total}`, { x: 50, y, size: 11, font: boldFont, color: black })
  page.drawText(`Average: ${data.average}%`, { x: 220, y, size: 11, font: boldFont, color: black })
  if (data.position) {
    page.drawText(`Position: ${data.position}`, { x: 400, y, size: 11, font: boldFont, color: black })
  }

  // Footer
  page.drawText('This is a computer-generated report card. No signature required.', {
    x: 50,
    y: 50,
    size: 9,
    font,
    color: grayColor,
  })

  return pdfDoc.save()
}

// Triggers a browser download of the generated PDF bytes.
export function downloadPdfBytes(bytes: Uint8Array, filename: string) {
  // pdf-lib's Uint8Array can be typed with an ArrayBufferLike backing
  // buffer (which technically includes SharedArrayBuffer), while
  // Blob's constructor type expects a plain ArrayBuffer. Copying into
  // a fresh Uint8Array guarantees a standard ArrayBuffer and satisfies
  // TypeScript without changing anything at runtime.
  const safeBytes = new Uint8Array(bytes)
  const blob = new Blob([safeBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

    
