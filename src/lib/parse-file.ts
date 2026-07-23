import * as XLSX from "xlsx";
import Papa from "papaparse";
import type { EnergyRow, Dataset } from "./data-store";

function num(v: unknown, fallback = 0): number {
  if (v == null || v === "") return fallback;
  if (typeof v === "number") return isNaN(v) ? fallback : v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/,/g, "").replace(/[^\d.\-eE]/g, ""));
    return isNaN(n) ? fallback : n;
  }
  return fallback;
}

// Convert various date formats (Excel serial, JS Date, dd/mm/yyyy, yyyy-mm-dd) to ISO YYYY-MM-DD.
function toISODate(v: unknown): string {
  if (v == null || v === "") return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "number") {
    // Excel serial date (days since 1899-12-30)
    const ms = Math.round((v - 25569) * 86400 * 1000);
    const d = new Date(ms);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  if (typeof v === "string") {
    const s = v.trim();
    // dd/mm/yyyy or dd-mm-yyyy
    const dmy = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
    if (dmy) {
      const [_, dd, mm, yy] = dmy;
      const year = yy.length === 2 ? 2000 + parseInt(yy) : parseInt(yy);
      const d = new Date(Date.UTC(year, parseInt(mm) - 1, parseInt(dd)));
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    }
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return "";
}

const REGION_MAP: Record<string, string> = {
  maharashtra: "West", gujarat: "West", "madhya pradesh": "West", goa: "West",
  "uttar pradesh": "North", delhi: "North", punjab: "North", haryana: "North",
  rajasthan: "North", "himachal pradesh": "North", uttarakhand: "North", "jammu and kashmir": "North", "jammu & kashmir": "North", chandigarh: "North", ladakh: "North",
  "tamil nadu": "South", karnataka: "South", "andhra pradesh": "South", telangana: "South", kerala: "South", puducherry: "South",
  "west bengal": "East", odisha: "East", bihar: "East", jharkhand: "East", chhattisgarh: "East", sikkim: "East",
  assam: "North-East", meghalaya: "North-East", tripura: "North-East", manipur: "North-East", mizoram: "North-East", nagaland: "North-East", "arunachal pradesh": "North-East",
};

function normalizeRow(raw: Record<string, unknown>, i: number): EnergyRow | null {
  const keys = Object.keys(raw).reduce<Record<string, unknown>>((acc, k) => {
    acc[k.toLowerCase().replace(/[\s_\-\.()]+/g, "")] = raw[k];
    return acc;
  }, {});
  const rawDate = keys.date ?? keys.day ?? keys.timestamp ?? keys.datetime ?? keys.month ?? keys.period;
  const date = toISODate(rawDate);
  const state = String(keys.state ?? keys.statename ?? keys.utility ?? keys.discom ?? "").trim();
  if (!state && !date) return null;
  const demand = num(keys.demand ?? keys.consumption ?? keys.load ?? keys.energymet ?? keys.energyrequirement ?? keys.requirement ?? keys.mw);
  const solar = num(keys.solar ?? keys.solarmw ?? keys.solargeneration);
  const wind = num(keys.wind ?? keys.windmw ?? keys.windgeneration);
  const hydro = num(keys.hydro ?? keys.hydel ?? keys.hydromw);
  const thermal = num(keys.thermal ?? keys.coal ?? keys.gas ?? keys.fossil);
  const nuclear = num(keys.nuclear ?? keys.atomic);
  const generation = num(keys.generation ?? keys.supply ?? keys.produced) || solar + wind + hydro + thermal + nuclear;
  const regionKey = state.toLowerCase();
  const region = String(keys.region ?? REGION_MAP[regionKey] ?? "N/A");
  return {
    date: date || new Date().toISOString().slice(0, 10),
    state: state || `Row ${i + 1}`,
    region,
    demand,
    generation,
    solar,
    wind,
    hydro,
    thermal,
    nuclear,
    peak: num(keys.peak ?? keys.peakdemand ?? keys.maxdemand) || Math.round(demand * 1.15),
  };
}

export async function parseFile(file: File): Promise<Dataset> {
  const name = file.name.toLowerCase();
  let rows: EnergyRow[] = [];
  if (name.endsWith(".csv")) {
    const text = await file.text();
    const parsed = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    rows = parsed.data.map((r, i) => normalizeRow(r, i)).filter(Boolean) as EnergyRow[];
  } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array", cellDates: true });
    const first = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(first, { raw: true, defval: null });
    rows = json.map((r, i) => normalizeRow(r, i)).filter(Boolean) as EnergyRow[];
  } else {
    throw new Error("Unsupported file. Please upload .csv, .xlsx or .xls");
  }

  if (rows.length === 0) {
    throw new Error(
      "No valid rows found. Ensure your file has columns like 'date' and 'state' with 'demand' (and optionally solar/wind/hydro/thermal/nuclear).",
    );
  }
  // Require at least one row with demand > 0 OR a recognizable state to consider it real data.
  const hasSignal = rows.some((r) => r.demand > 0 || r.generation > 0);
  if (!hasSignal) {
    throw new Error(
      "File parsed but no numeric demand/generation values were detected. Check your column headers (e.g. 'demand', 'solar', 'wind').",
    );
  }
  return { fileName: file.name, uploadedAt: new Date().toISOString(), rows };
}
