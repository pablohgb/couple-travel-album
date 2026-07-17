"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { PlaceAlbumModal } from "@/components/timeline/place-album-modal";
import {
  buildTimelineSections,
  getPlaceLocation,
  getPlacePhotoCount,
  PLACE_STATUS,
} from "@/lib/timeline";
import { formatPlaceDates } from "@/lib/places";

function TimelinePlaceCard({ place }) {
  const [albumOpen, setAlbumOpen] = useState(false);
  const status = PLACE_STATUS[place.status] ?? PLACE_STATUS.visited;
  const location = getPlaceLocation(place);
  const photoCount = getPlacePhotoCount(place);

  return (
    <>
      <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-rose-200 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span
              className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: status.color }}
            >
              {status.label}
            </span>
            <h3 className="mt-3 text-lg font-semibold text-zinc-900">
              {place.name}
            </h3>
            {location ? (
              <p className="text-sm text-zinc-500">{location}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <Link
              href={`/mapa?lugar=${place.id}`}
              className="rounded-full border border-rose-200 px-3 py-1.5 text-center text-xs font-medium text-rose-700 transition hover:bg-rose-50"
            >
              Ver en mapa
            </Link>
            <button
              type="button"
              onClick={() => setAlbumOpen(true)}
              disabled={photoCount === 0}
              className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ver álbum
            </button>
          </div>
        </div>

        <p className="mt-3 text-sm text-zinc-600">{formatPlaceDates(place)}</p>

        {place.description ? (
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            {place.description}
          </p>
        ) : null}

        {place.ideas && place.status === "planned" ? (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {place.ideas}
          </p>
        ) : null}

        <p className="mt-4 text-xs text-zinc-400">
          {photoCount} foto{photoCount === 1 ? "" : "s"}
        </p>
      </article>

      <PlaceAlbumModal
        place={place}
        open={albumOpen}
        onClose={() => setAlbumOpen(false)}
      />
    </>
  );
}

function YearNode({ label, count, selected, accent = "rose", onSelect }) {
  const isAmber = accent === "amber";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="group relative flex min-w-[5.5rem] flex-col items-center gap-3"
    >
      <span
        className={[
          "rounded-full px-3 py-1 text-sm font-semibold transition",
          selected
            ? isAmber
              ? "bg-amber-500 text-white shadow-md"
              : "bg-rose-500 text-white shadow-md"
            : isAmber
              ? "bg-amber-100 text-amber-800 group-hover:bg-amber-200"
              : "bg-white text-zinc-700 ring-1 ring-zinc-200 group-hover:ring-rose-300",
        ].join(" ")}
      >
        {label}
      </span>

      <span
        className={[
          "relative z-10 h-4 w-4 rounded-full border-2 transition",
          selected
            ? isAmber
              ? "border-amber-500 bg-amber-500 scale-110"
              : "border-rose-500 bg-rose-500 scale-110"
            : isAmber
              ? "border-amber-300 bg-white group-hover:border-amber-500"
              : "border-rose-300 bg-white group-hover:border-rose-500",
        ].join(" ")}
      />

      <span
        className={[
          "text-xs font-medium",
          selected
            ? isAmber
              ? "text-amber-700"
              : "text-rose-600"
            : "text-zinc-400",
        ].join(" ")}
      >
        {count} viaje{count === 1 ? "" : "s"}
      </span>
    </button>
  );
}

export function TimelineView({ places }) {
  const { years, undatedVisited, plannedPlaces } = buildTimelineSections(places);

  const segments = useMemo(() => {
    // Más antiguo a la izquierda, más reciente a la derecha
    const items = [...years].reverse().map((section) => ({
      id: String(section.year),
      label: String(section.year),
      places: section.places,
      accent: "rose",
      title: `Viajes de ${section.year}`,
    }));

    if (undatedVisited.length) {
      items.push({
        id: "undated",
        label: "Sin fecha",
        places: undatedVisited,
        accent: "rose",
        title: "Sin fecha",
      });
    }

    if (plannedPlaces.length) {
      items.push({
        id: "planned",
        label: "Próximos",
        places: plannedPlaces,
        accent: "amber",
        title: "Próximos viajes",
      });
    }

    return items;
  }, [years, undatedVisited, plannedPlaces]);

  const defaultSelectedId = useMemo(() => {
    const yearSegments = segments.filter((segment) => /^\d{4}$/.test(segment.id));
    return yearSegments.at(-1)?.id ?? segments[0]?.id ?? null;
  }, [segments]);

  const [selectedId, setSelectedId] = useState(defaultSelectedId);
  const activeId = selectedId ?? defaultSelectedId;
  const selectedSegment =
    segments.find((segment) => segment.id === activeId) ?? segments[0] ?? null;

  if (!segments.length) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-200 bg-white/80 px-6 py-16 text-center">
        <h2 className="text-lg font-semibold text-zinc-900">
          Todavía no hay viajes en la línea temporal
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Añade lugares visitados con fecha de inicio en el mapa para verlos
          aquí ordenados por año.
        </p>
        <Link
          href="/mapa"
          className="mt-4 inline-flex rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          Ir al mapa
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-rose-100 bg-white/90 px-4 py-8 shadow-sm sm:px-6">
        <p className="mb-6 text-center text-sm font-medium uppercase tracking-wide text-zinc-400">
          Selecciona un año
        </p>

        <div className="overflow-x-auto pb-2">
          <div className="relative mx-auto flex w-max min-w-full items-start justify-center gap-2 px-2 sm:gap-4 mt-2">
            <div
              aria-hidden
              className="pointer-events-none absolute left-6 right-6 top-[2.85rem] h-0.5 bg-gradient-to-r from-rose-200 via-rose-300 to-amber-200"
            />

            {segments.map((segment) => (
              <YearNode
                key={segment.id}
                label={segment.label}
                count={segment.places.length}
                selected={selectedSegment?.id === segment.id}
                accent={segment.accent}
                onSelect={() => setSelectedId(segment.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {selectedSegment ? (
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                {selectedSegment.title}
              </h2>
              <p className="text-sm text-zinc-500">
                {selectedSegment.places.length} destino
                {selectedSegment.places.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {selectedSegment.places.map((place) => (
              <TimelinePlaceCard key={place.id} place={place} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
