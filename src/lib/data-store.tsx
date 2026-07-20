import * as React from "react";

export type EnergyRow = {
  date: string; // ISO
  state: string;
  region: string;
  demand: number; // MW
  generation: number;
  solar: number;
  wind: number;
  hydro: number;
  thermal: number;
  nuclear: number;
  peak: number;
};

export type Dataset = {
  fileName: string;
  uploadedAt: string;
  rows: EnergyRow[];
};

type Ctx = {
  dataset: Dataset | null;
  setDataset: (d: Dataset | null) => void;
  theme: "dark" | "light";
  setTheme: (t: "dark" | "light") => void;
};

const DataCtx = React.createContext<Ctx | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [dataset, setDatasetState] = React.useState<Dataset | null>(null);
  const [theme, setThemeState] = React.useState<"dark" | "light">("dark");

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("gridsense.dataset");
      if (raw) setDatasetState(JSON.parse(raw));
      const t = localStorage.getItem("gridsense.theme");
      if (t === "light" || t === "dark") setThemeState(t);
    } catch {}
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("gridsense.theme", theme);
    } catch {}
  }, [theme]);

  const setDataset = React.useCallback((d: Dataset | null) => {
    setDatasetState(d);
    try {
      if (d) localStorage.setItem("gridsense.dataset", JSON.stringify(d));
      else localStorage.removeItem("gridsense.dataset");
    } catch {}
  }, []);

  return (
    <DataCtx.Provider value={{ dataset, setDataset, theme, setTheme: setThemeState }}>
      {children}
    </DataCtx.Provider>
  );
}

export function useData() {
  const c = React.useContext(DataCtx);
  if (!c) throw new Error("useData outside DataProvider");
  return c;
}
