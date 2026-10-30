// Minimal CSV reader. The deck files are ordinary quoted CSV, so this handles
// the four things that actually appear in them: a leading BOM, quoted fields,
// escaped quotes ("" inside a quoted field) and commas inside quoted fields.
export function parseCsv(text) {
  const src = text.replace(/^\uFEFF/, '')
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let i = 0; i < src.length; i++) {
    const ch = src[i]

    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i++
        } else {
          quoted = false
        }
      } else {
        field += ch
      }
      continue
    }

    if (ch === '"') {
      quoted = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (ch !== '\r') {
      field += ch
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  // Drop blank lines at the end of the file.
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''))
}

// Turn rows into objects keyed by the header line.
export function csvToObjects(text) {
  const rows = parseCsv(text)
  if (rows.length === 0) return []
  const header = rows[0].map((h) => h.trim().toLowerCase())
  return rows.slice(1).map((row) =>
    Object.fromEntries(header.map((key, i) => [key, (row[i] ?? '').trim()])),
  )
}
