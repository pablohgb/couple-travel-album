"use client";

import { useState } from "react";

import { PhotoLightbox } from "@/components/photos/photo-lightbox";
import { downloadAlbum } from "@/lib/download-photos";
import { formatPhotoDate } from "@/lib/photo-dates";

export function PlaceAlbumModal({ place, open, onClose }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isDownloadingAlbum, setIsDownloadingAlbum] = useState(false);
  const [albumError, setAlbumError] = useState(null);
  const photos = place?.photos ?? [];

  if (!open || !place) {
    return null;
  }

  function handleClose() {
    setSelectedPhoto(null);
    setAlbumError(null);
    onClose();
  }

  async function handleDownloadAlbum() {
    setAlbumError(null);
    setIsDownloadingAlbum(true);

    try {
      await downloadAlbum(photos, place.name);
    } catch (error) {
      setAlbumError(error.message || "No se pudo descargar el álbum.");
    } finally {
      setIsDownloadingAlbum(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[3000] flex items-center justify-center bg-zinc-950/80 p-4"
        onClick={handleClose}
      >
        <div
          className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                Álbum de {place.name}
              </h2>
              <p className="text-sm text-zinc-500">
                {photos.length} foto{photos.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {photos.length ? (
                <button
                  type="button"
                  onClick={handleDownloadAlbum}
                  disabled={isDownloadingAlbum}
                  className="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                >
                  {isDownloadingAlbum ? "Preparando..." : "Descargar álbum"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50"
              >
                Cerrar
              </button>
            </div>
          </div>

          {albumError ? (
            <p className="border-b border-red-100 bg-red-50 px-6 py-3 text-sm text-red-700">
              {albumError}
            </p>
          ) : null}

          <div className="overflow-y-auto px-6 py-6">
            {photos.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setSelectedPhoto(photo)}
                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 text-left transition hover:border-rose-200 hover:shadow-md"
                  >
                    <img
                      src={photo.thumbnail_url || photo.url}
                      alt={photo.title || place.name}
                      className="aspect-square w-full object-cover"
                    />
                    <p className="px-3 py-2 text-xs text-zinc-500">
                      {formatPhotoDate({ ...photo, place })}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-zinc-200 px-4 py-10 text-center text-sm text-zinc-500">
                Este lugar todavía no tiene fotografías.
              </p>
            )}
          </div>
        </div>
      </div>

      <PhotoLightbox
        photo={selectedPhoto}
        place={place}
        onClose={() => setSelectedPhoto(null)}
      />
    </>
  );
}
