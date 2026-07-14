"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deletePhoto } from "@/app/mapa/photo-actions";
import { formatPhotoDate } from "@/lib/photo-dates";

export function PhotoGallery({ photos, placeName, place }) {
  const router = useRouter();
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);
  const [error, setError] = useState(null);
  const [isDeleting, startDelete] = useTransition();

  if (!photos.length) {
    return null;
  }

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

      setDeletingPhotoId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo) => {
          const isRemoving = isDeleting && deletingPhotoId === photo.id;
          const photoWithPlace = { ...photo, place: photo.place ?? place };

          return (
            <figure
              key={photo.id}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100"
            >
              <img
                src={photo.thumbnail_url || photo.url}
                alt={photo.title || placeName}
                className="aspect-square w-full object-cover"
              />

              <button
                type="button"
                onClick={() => handleDelete(photo)}
                disabled={isDeleting}
                className="absolute right-2 top-2 rounded-full bg-red-500/90 px-2.5 py-1 text-xs font-semibold text-white opacity-0 shadow transition group-hover:opacity-100 hover:bg-red-600 disabled:opacity-60"
              >
                {isRemoving ? "..." : "Eliminar"}
              </button>

              <figcaption className="px-3 py-2 text-xs text-zinc-500">
                {formatPhotoDate(photoWithPlace)}
              </figcaption>
            </figure>
          );
        })}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
