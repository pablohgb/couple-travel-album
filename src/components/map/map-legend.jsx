import { PLACE_STATUS } from "@/lib/places";

export function MapLegend() {
  return (
    <div className="flex flex-wrap gap-3 rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      {Object.entries(PLACE_STATUS).map(([key, status]) => (
        <div key={key} className="flex items-center gap-2 text-sm text-zinc-700">
          <span
            className="h-3 w-3 rounded-full border-2 border-white shadow"
            style={{ backgroundColor: status.mapColor }}
          />
          {status.label}
        </div>
      ))}
    </div>
  );
}
