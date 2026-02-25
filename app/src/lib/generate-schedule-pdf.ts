import jsPDF from 'jspdf'
import type { TrainingSlotWithTeam } from '@/types'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const

// Colours matching the reference image
const HEADER_BG   = [255, 165, 0]   as const  // orange header row
const HEADER_FG   = [255, 255, 255] as const  // white text in header
const DAY_BG      = [255, 255, 255] as const  // white day cell
const CELL_BG     = [255, 255, 255] as const  // white data cell
const BORDER      = [200, 200, 200] as const  // light grey border
const HIGHLIGHT   = [255, 235, 200] as const  // pale orange for team cells
const TEXT_DARK   = [30,  30,  30]  as const
const TEXT_MUTED  = [120, 120, 120] as const

const PAGE_MARGIN  = 12  // mm
const ROW_HEIGHT   = 9   // mm
const HEADER_H     = 10  // mm
const TITLE_H      = 14  // mm  (space for the title block)
const DAY_COL_W    = 22  // mm
const TIME_COL_W   = 28  // mm
const MIN_VENUE_W  = 30  // mm  minimum per venue column

// ── Helpers ───────────────────────────────────────────────────────────────────

type RGB = readonly [number, number, number]

function setFill(doc: jsPDF, c: RGB)  { doc.setFillColor(c[0], c[1], c[2]) }
function setDraw(doc: jsPDF, c: RGB)  { doc.setDrawColor(c[0], c[1], c[2]) }
function setText(doc: jsPDF, c: RGB)  { doc.setTextColor(c[0], c[1], c[2]) }

function getColXs(tableLeft: number, count: number, venueW: number): number[] {
  const startX = tableLeft + DAY_COL_W + TIME_COL_W
  return Array.from({ length: count }, (_, i) => startX + i * venueW)
}

function drawCell(
  doc: jsPDF,
  x: number, y: number, w: number, h: number,
  text: string,
  align: 'L' | 'C',
  color: RGB
): void {
  setText(doc, color)
  doc.setFontSize(8)
  if (align === 'C') {
    doc.text(text, x + w / 2, y + h / 2 + 1.5, { align: 'center' })
  } else {
    doc.text(text, x + 3, y + h / 2 + 1.5)
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export function generateSchedulePdf(
  scheduleName: string,
  slots: TrainingSlotWithTeam[]
): void {
  // ── 1. Derive unique venues (preserve first-seen order) ──────────────────
  const venueOrder: string[] = []
  for (const s of slots) {
    if (s.venue && !venueOrder.includes(s.venue)) venueOrder.push(s.venue)
  }
  // Fallback: if no venues assigned, put everything in a single "–" column
  if (venueOrder.length === 0) venueOrder.push('–')

  // ── 2. Page sizing ───────────────────────────────────────────────────────
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()   // 297 mm
  const pageH = doc.internal.pageSize.getHeight()  // 210 mm

  // Distribute remaining width among venue columns
  const usableW     = pageW - PAGE_MARGIN * 2
  const fixedW      = DAY_COL_W + TIME_COL_W
  const venueW      = Math.max(MIN_VENUE_W, (usableW - fixedW) / venueOrder.length)
  const totalTableW = fixedW + venueW * venueOrder.length

  // ── 3. Title ─────────────────────────────────────────────────────────────
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  setText(doc, TEXT_DARK)
  doc.text(scheduleName, pageW / 2, PAGE_MARGIN + 5, { align: 'center' })

  // ── 4. Header row ────────────────────────────────────────────────────────
  let y = PAGE_MARGIN + TITLE_H
  const tableLeft = PAGE_MARGIN

  setFill(doc, HEADER_BG)
  doc.rect(tableLeft, y, totalTableW, HEADER_H, 'F')

  const colXs = getColXs(tableLeft, venueOrder.length, venueW)

  drawCell(doc, tableLeft,              y, DAY_COL_W,  HEADER_H, 'Day',   'L', HEADER_FG)
  drawCell(doc, tableLeft + DAY_COL_W, y, TIME_COL_W, HEADER_H, 'Times', 'L', HEADER_FG)
  venueOrder.forEach((v, i) => {
    drawCell(doc, colXs[i], y, venueW, HEADER_H, v, 'C', HEADER_FG)
  })

  setDraw(doc, BORDER)
  doc.setLineWidth(0.3)
  doc.rect(tableLeft, y, totalTableW, HEADER_H)

  y += HEADER_H

  // ── 5. Data rows ─────────────────────────────────────────────────────────
  for (const day of DAYS) {
    const daySlots = slots.filter((s) => s.day === day)
    if (daySlots.length === 0) continue

    // Sort by start_time then venue
    const sorted = [...daySlots].sort((a, b) =>
      a.start_time.localeCompare(b.start_time) || (a.venue ?? '').localeCompare(b.venue ?? '')
    )

    // Group into time-blocks (same start/end time = one row across venue columns)
    type TimeBlock = { start: string; end: string; cells: Map<string, string> }
    const blocks: TimeBlock[] = []
    for (const s of sorted) {
      const key = `${s.start_time}–${s.end_time}`
      let block = blocks.find((b) => `${b.start}–${b.end}` === key)
      if (!block) {
        block = { start: s.start_time, end: s.end_time, cells: new Map() }
        blocks.push(block)
      }
      const venue = s.venue || '–'
      block.cells.set(venue, s.team?.name ?? '')
    }

    const dayBlockH = blocks.length * ROW_HEIGHT

    // Page overflow — start new page
    if (y + dayBlockH > pageH - PAGE_MARGIN) {
      doc.addPage()
      y = PAGE_MARGIN
    }

    // Day label cell spanning all time-block rows (vertically centred)
    setFill(doc, DAY_BG)
    doc.rect(tableLeft, y, DAY_COL_W, dayBlockH, 'F')
    setDraw(doc, BORDER)
    doc.rect(tableLeft, y, DAY_COL_W, dayBlockH)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    setText(doc, TEXT_DARK)
    doc.text(day, tableLeft + 3, y + dayBlockH / 2 + 1.5)

    // Time + venue cells
    let rowY = y
    for (const block of blocks) {
      const timeStr = `${block.start} - ${block.end}`

      // Time cell
      setFill(doc, CELL_BG)
      doc.rect(tableLeft + DAY_COL_W, rowY, TIME_COL_W, ROW_HEIGHT, 'F')
      setDraw(doc, BORDER)
      doc.rect(tableLeft + DAY_COL_W, rowY, TIME_COL_W, ROW_HEIGHT)
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      setText(doc, TEXT_MUTED)
      doc.text(timeStr, tableLeft + DAY_COL_W + 3, rowY + ROW_HEIGHT / 2 + 1.5)

      // Venue cells
      venueOrder.forEach((venue, i) => {
        const teamName = block.cells.get(venue) ?? ''
        const hasTeam  = teamName.length > 0
        setFill(doc, hasTeam ? HIGHLIGHT : CELL_BG)
        doc.rect(colXs[i], rowY, venueW, ROW_HEIGHT, 'F')
        setDraw(doc, BORDER)
        doc.rect(colXs[i], rowY, venueW, ROW_HEIGHT)
        if (hasTeam) {
          doc.setFontSize(7.5)
          doc.setFont('helvetica', 'bold')
          setText(doc, TEXT_DARK)
          const maxChars = Math.floor(venueW / 2.2)
          const label = teamName.length > maxChars ? teamName.slice(0, maxChars - 1) + '…' : teamName
          doc.text(label, colXs[i] + venueW / 2, rowY + ROW_HEIGHT / 2 + 1.5, { align: 'center' })
        }
      })

      rowY += ROW_HEIGHT
    }

    y += dayBlockH
  }

  // ── 6. Outer border ───────────────────────────────────────────────────────
  setDraw(doc, BORDER)
  doc.setLineWidth(0.4)
  doc.rect(tableLeft, PAGE_MARGIN + TITLE_H, totalTableW, y - (PAGE_MARGIN + TITLE_H))

  // ── 7. Save ───────────────────────────────────────────────────────────────
  const filename = `${scheduleName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
  doc.save(filename)
}
