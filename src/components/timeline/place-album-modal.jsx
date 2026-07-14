"use client";

import { useState } from "react";

import { formatPhotoDate } from "@/lib/photo-dates";

export function PlaceAlbumModal({ place, open, onClose }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const photos = place?.photos ?? [];

  if (!open || !place) {
    return null;
  }

  function handleClose() {
    setSelectedPhoto(null);
    onClose();
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
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                Álbum de {place.name}
              </h2>
              <p className="text-sm text-zinc-500">
                {photos.length} foto{photos.length === 1 ? "" : "s"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              Cerrar
            </button>
          </div>

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

      {selectedPhoto ? (
        <div
          className="fixed inset-0 z-[3100] flex items-center justify-center bg-zinc-950/90 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="max-h-[95vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <p className="text-sm text-zinc-500">
                {formatPhotoDate({ ...selectedPhoto, place })}
              </p>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50"
              >
                Cerrar
              </button>
            </div>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title || place.name}
              className="max-h-[80vh] w-full object-contain bg-white"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
