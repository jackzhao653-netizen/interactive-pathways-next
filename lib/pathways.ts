import { promises as fs } from "node:fs";
import path from "node:path";

export type DataPoint = {
  theme: string;
  metric: string;
  value: string;
  unit: string;
  timeframe_or_date: string;
  source_title: string;
  source_url: string;
  notes: string;
};

function parseCsvRow(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

function parseCsv(text: string) {
  const rows: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      current += char;

      if (inQuotes && next === '"') {
        current += next;
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === "\n" && !inQuotes) {
      rows.push(current.replace(/\r$/, ""));
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim().length > 0) {
    rows.push(current.replace(/\r$/, ""));
  }

  const [headerRow, ...bodyRows] = rows;
  const headers = parseCsvRow(headerRow);

  return bodyRows.map((row) => {
    const values = parseCsvRow(row);
    const record = {} as DataPoint;

    headers.forEach((header, index) => {
      const key = header as keyof DataPoint;
      record[key] = values[index] ?? "";
    });

    return record;
  });
}

export async function getDataPoints() {
  const csvPath = path.join(
    process.cwd(),
    "data",
    "member5-integration-pathways-data-points.csv",
  );
  const file = await fs.readFile(csvPath, "utf8");
  return parseCsv(file);
}
