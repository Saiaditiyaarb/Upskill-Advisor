export type CSVRow = Record<string, string>

export function parseCSV(text: string): CSVRow[] {
  // Handles simple header+rows CSV with commas. Quoted fields not supported (not needed for metrics).
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const cols = line.split(",")
    const row: CSVRow = {}
    headers.forEach((h, i) => {
      row[h] = (cols[i] ?? "").trim()
    })
    return row
  })
}
