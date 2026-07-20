import { Link } from "@tanstack/react-router";
import { Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/lib/data-store";
import { generateMockDataset } from "@/lib/mock-data";
import { toast } from "sonner";

export function EmptyDataset({ title = "No dataset uploaded" }: { title?: string }) {
  const { setDataset } = useData();
  return (
    <div className="min-h-[70vh] grid place-items-center px-6">
      <div className="glass rounded-3xl p-10 text-center max-w-md w-full">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/15 grid place-items-center glow mb-4">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload a CEA electricity dataset (.csv, .xlsx, .xls) to unlock analytics, insights and
          forecasts.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <Link to="/upload">
            <Button className="glow">
              <Upload className="mr-2 h-4 w-4" /> Upload Dataset
            </Button>
          </Link>
          <Button
            variant="secondary"
            onClick={() => {
              setDataset(generateMockDataset("demo-cea-2024.xlsx"));
              toast.success("Demo dataset loaded");
            }}
          >
            <Sparkles className="mr-2 h-4 w-4" /> Load Demo Data
          </Button>
        </div>
      </div>
    </div>
  );
}
