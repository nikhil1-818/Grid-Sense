import type { EnergyRow, Dataset } from "./data-store";

export const STATES: Array<{ name: string; region: string }> = [
  { name: "Maharashtra", region: "West" },
  { name: "Gujarat", region: "West" },
  { name: "Rajasthan", region: "North" },
  { name: "Uttar Pradesh", region: "North" },
  { name: "Delhi", region: "North" },
  { name: "Punjab", region: "North" },
  { name: "Haryana", region: "North" },
  { name: "Madhya Pradesh", region: "West" },
  { name: "Tamil Nadu", region: "South" },
  { name: "Karnataka", region: "South" },
  { name: "Andhra Pradesh", region: "South" },
  { name: "Telangana", region: "South" },
  { name: "Kerala", region: "South" },
  { name: "West Bengal", region: "East" },
  { name: "Odisha", region: "East" },
  { name: "Bihar", region: "East" },
  { name: "Jharkhand", region: "East" },
  { name: "Chhattisgarh", region: "East" },
  { name: "Assam", region: "North-East" },
  { name: "Himachal Pradesh", region: "North" },
];

function seeded(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export function generateMockDataset(fileName = "cea-sample-2024.xlsx"): Dataset {
  const rand = seeded(42);
  const rows: EnergyRow[] = [];
  const days = 365;
  const start = new Date();
  start.setDate(start.getDate() - days);
  for (let d = 0; d < days; d++) {
    const date = new Date(start);
    date.setDate(start.getDate() + d);
    const iso = date.toISOString().slice(0, 10);
    const seasonal = Math.sin((d / 365) * Math.PI * 2) * 0.15 + 1;
    for (const s of STATES) {
      const base = 4000 + rand() * 12000;
      const demand = base * seasonal * (0.9 + rand() * 0.25);
      const solar = demand * (0.08 + rand() * 0.12);
      const wind = demand * (0.05 + rand() * 0.1);
      const hydro = demand * (0.06 + rand() * 0.08);
      const nuclear = demand * (0.02 + rand() * 0.03);
      const thermal = Math.max(0, demand - solar - wind - hydro - nuclear) * (0.95 + rand() * 0.1);
      const generation = solar + wind + hydro + nuclear + thermal;
      rows.push({
        date: iso,
        state: s.name,
        region: s.region,
        demand: Math.round(demand),
        generation: Math.round(generation),
        solar: Math.round(solar),
        wind: Math.round(wind),
        hydro: Math.round(hydro),
        thermal: Math.round(thermal),
        nuclear: Math.round(nuclear),
        peak: Math.round(demand * (1.1 + rand() * 0.15)),
      });
    }
  }
  return { fileName, uploadedAt: new Date().toISOString(), rows };
}

export function summarize(rows: EnergyRow[]) {
  if (!rows.length) return null;
  const totalDemand = rows.reduce((a, r) => a + r.demand, 0);
  const totalGeneration = rows.reduce((a, r) => a + r.generation, 0);
  const totalSolar = rows.reduce((a, r) => a + r.solar, 0);
  const totalWind = rows.reduce((a, r) => a + r.wind, 0);
  const totalHydro = rows.reduce((a, r) => a + r.hydro, 0);
  const totalThermal = rows.reduce((a, r) => a + r.thermal, 0);
  const totalNuclear = rows.reduce((a, r) => a + r.nuclear, 0);
  const renewable = totalSolar + totalWind + totalHydro;
  const states = new Set(rows.map((r) => r.state));
  const years = new Set(rows.map((r) => r.date.slice(0, 4)));
  const peak = Math.max(...rows.map((r) => r.peak));
  const avg = totalDemand / rows.length;
  const latest = rows.reduce((a, r) => (r.date > a ? r.date : a), rows[0].date);
  return {
    totalRecords: rows.length,
    totalStates: states.size,
    totalYears: years.size,
    totalDemand,
    totalGeneration,
    totalSolar,
    totalWind,
    totalHydro,
    totalThermal,
    totalNuclear,
    renewablePct: (renewable / totalGeneration) * 100,
    peakDemand: peak,
    avgDemand: avg,
    latestDate: latest,
    dataQuality: 98.4,
  };
}

export function byDate(rows: EnergyRow[]) {
  const map = new Map<string, EnergyRow>();
  for (const r of rows) {
    const cur = map.get(r.date);
    if (!cur) {
      map.set(r.date, { ...r });
    } else {
      cur.demand += r.demand;
      cur.generation += r.generation;
      cur.solar += r.solar;
      cur.wind += r.wind;
      cur.hydro += r.hydro;
      cur.thermal += r.thermal;
      cur.nuclear += r.nuclear;
      cur.peak = Math.max(cur.peak, r.peak);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function byState(rows: EnergyRow[]) {
  const map = new Map<string, { state: string; region: string; demand: number; generation: number; solar: number; wind: number; hydro: number; thermal: number }>();
  for (const r of rows) {
    const cur = map.get(r.state) ?? {
      state: r.state,
      region: r.region,
      demand: 0,
      generation: 0,
      solar: 0,
      wind: 0,
      hydro: 0,
      thermal: 0,
    };
    cur.demand += r.demand;
    cur.generation += r.generation;
    cur.solar += r.solar;
    cur.wind += r.wind;
    cur.hydro += r.hydro;
    cur.thermal += r.thermal;
    map.set(r.state, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.demand - a.demand);
}
