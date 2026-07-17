"use client";

import { useState } from "react";

import { downloadPhoto } from "@/lib/download-photos";
import { formatPhotoDate } from "@/lib/photo-dates";

export function PhotoLightbox({ photo, place, onClose }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);

  if (!photo) {
    return null;
  }

  const placeName = place?.name || photo.place?.name;
  const photoWithPlace = { ...photo, place: photo.place ?? place };

  async function handleDownload() {
    setError(null);
    setIsDownloading(true);

    try {
      await downloadPhoto(photo, { placeName });
    } catch (downloadError) {
      setError(downloadError.message || "No se pudo descargar la foto.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[3100] flex items-center justify-center bg-zinc-950/90 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[95vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4">
          <div>
            {placeName ? (
              <p className="font-semibold text-zinc-900">{placeName}</p>
            ) : null}
            <p className="text-sm text-zinc-500">
              {formatPhotoDate(photoWithPlace)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
            >
              {isDownloading ? "Descargando..." : "Descargar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              Cerrar
            </button>
          </div>
        </div>

        {error ? (
          <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <img
          src={photo.url}
          alt={photo.title || placeName || "Fotografía"}
          className="max-h-[80vh] w-full object-contain bg-white"
        />
      </div>
    </div>
  );
}
