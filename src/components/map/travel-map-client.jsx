"use client";

import dynamic from "next/dynamic";

const TravelMap = dynamic(
  () =>
    import("@/components/map/travel-map").then((module) => module.TravelMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[70vh] items-center justify-center rounded-3xl border border-rose-100 bg-rose-50/40">
        <p className="text-sm text-zinc-500">Cargando mapa...</p>
      </div>
    ),
  },
);

export function TravelMapClient(props) {
  return <TravelMap {...props} />;
}
