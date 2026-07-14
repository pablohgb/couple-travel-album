"use client";

import Link from "next/link";
import { useState } from "react";

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

function TimelineYearSection({ year, places }) {
  return (
    <section className="relative pl-8">
      <div className="absolute left-0 top-0 flex h-full flex-col items-center">
        <div className="rounded-full bg-rose-500 px-3 py-1 text-sm font-semibold text-white shadow">
          {year}
        </div>
        <div className="mt-3 w-px flex-1 bg-rose-200" />
      </div>

      <div className="space-y-4 pb-10">
        {places.map((place) => (
          <TimelinePlaceCard key={place.id} place={place} />
        ))}
      </div>
    </section>
  );
}

export function TimelineView({ places }) {
  const { years, undatedVisited, plannedPlaces } = buildTimelineSections(places);
  const hasContent =
    years.length || undatedVisited.length || plannedPlaces.length;

  if (!hasContent) {
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
    <div className="space-y-10">
      {years.map((section) => (
        <TimelineYearSection
          key={section.year}
          year={section.year}
          places={section.places}
        />
      ))}

      {undatedVisited.length ? (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Sin fecha
          </h2>
          <div className="space-y-4">
            {undatedVisited.map((place) => (
              <TimelinePlaceCard key={place.id} place={place} />
            ))}
          </div>
        </section>
      ) : null}

      {plannedPlaces.length ? (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-600">
            Próximos viajes
          </h2>
          <div className="space-y-4">
            {plannedPlaces.map((place) => (
              <TimelinePlaceCard key={place.id} place={place} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
