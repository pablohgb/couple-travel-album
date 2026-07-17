"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deletePhoto } from "@/app/mapa/photo-actions";
import { PhotoLightbox } from "@/components/photos/photo-lightbox";
import {
  filterAlbumPhotos,
  formatPhotoDate,
  getAlbumPlaces,
  sortAlbumPhotos,
} from "@/lib/album";
import { getPlaceLocation } from "@/lib/places";

const inputClassName =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100";

export function AlbumView({ photos }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);
  const [error, setError] = useState(null);
  const [isDeleting, startDelete] = useTransition();

  const places = useMemo(() => getAlbumPlaces(photos), [photos]);

  const visiblePhotos = useMemo(() => {
    const filtered = filterAlbumPhotos(photos, { search, placeId });
    return sortAlbumPhotos(filtered, sortOrder);
  }, [photos, search, placeId, sortOrder]);

  function handleDelete(photo) {
    const confirmed = window.confirm(
      "¿Eliminar esta fotografía? Esta acción no se puede deshacer.",
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setDeletingPhotoId(photo.id);

    startDelete(async () => {
      const result = await deletePhoto(photo.id);

      if (result.error) {
        setError(result.error);
        setDeletingPhotoId(null);
        return;
      }

      if (selectedPhoto?.id === photo.id) {
        setSelectedPhoto(null);
      }

      setDeletingPhotoId(null);
      router.refresh();
    });
  }

  return (
    <>
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <label htmlFor="album-search" className="sr-only">
            Buscar fotos
          </label>
          <input
            id="album-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por lugar, ciudad o país..."
            className={inputClassName}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
          <select
            value={placeId}
            onChange={(event) => setPlaceId(event.target.value)}
            className={inputClassName}
          >
            <option value="">Todos los lugares</option>
            {places.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className={inputClassName}
          >
            <option value="newest">Más recientes primero</option>
            <option value="oldest">Más antiguas primero</option>
          </select>
        </div>
      </section>

      <p className="mb-6 text-sm text-zinc-500">
        {visiblePhotos.length} foto
        {visiblePhotos.length === 1 ? "" : "s"}
        {photos.length !== visiblePhotos.length
          ? ` de ${photos.length}`
          : ""}
      </p>

      {error ? (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {visiblePhotos.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visiblePhotos.map((photo) => {
            const isRemoving = isDeleting && deletingPhotoId === photo.id;
            const location = getPlaceLocation(photo.place ?? {});

            return (
              <article
                key={photo.id}
                className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(photo)}
                  className="block w-full text-left"
                >
                  <img
                    src={photo.thumbnail_url || photo.url}
                    alt={photo.title || photo.place?.name || "Fotografía"}
                    className="aspect-[4/5] w-full object-cover"
                  />
                </button>

                <div className="space-y-2 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-900">
                        {photo.place?.name || "Sin lugar"}
                      </p>
                      {location ? (
                        <p className="text-sm text-zinc-500">{location}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(photo)}
                      disabled={isDeleting}
                      className="rounded-full border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      {isRemoving ? "..." : "Eliminar"}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {formatPhotoDate(photo)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-zinc-200 bg-white/80 px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-zinc-900">
            {photos.length
              ? "No hay fotos con esos filtros"
              : "Todavía no hay fotografías"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {photos.length
              ? "Prueba con otra búsqueda o quita el filtro de lugar."
              : "Sube fotos desde el mapa para verlas aquí."}
          </p>
          {!photos.length ? (
            <Link
              href="/mapa"
              className="mt-4 inline-flex rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              Ir al mapa
            </Link>
          ) : null}
        </div>
      )}

      <PhotoLightbox
        photo={selectedPhoto}
        place={selectedPhoto?.place}
        onClose={() => setSelectedPhoto(null)}
      />
    </>
  );
}
