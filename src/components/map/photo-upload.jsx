"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { registerPhoto } from "@/app/mapa/photo-actions";
import { createClient } from "@/lib/supabase/client";
import {
  convertFileToWebp,
  convertFileToWebpThumbnail,
  getPhotoTakenAtFromFile,
  isImageFile,
} from "@/lib/images";

export function PhotoUpload({ placeId }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState(null);

  async function uploadFiles(fileList) {
    const files = Array.from(fileList).filter(isImageFile);

    if (!files.length) {
      setError("Selecciona al menos una imagen.");
      return;
    }

    setError(null);
    setIsUploading(true);
    setStatusMessage(`Subiendo 0 de ${files.length}...`);

    const supabase = createClient();

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];

      try {
        setStatusMessage(`Convirtiendo y subiendo ${index + 1} de ${files.length}...`);

        const takenAt = await getPhotoTakenAtFromFile(file);

        const [webpBlob, thumbnailBlob] = await Promise.all([
          convertFileToWebp(file),
          convertFileToWebpThumbnail(file),
        ]);

        const photoId = crypto.randomUUID();
        const storagePath = `${placeId}/${photoId}.webp`;
        const thumbnailPath = `${placeId}/${photoId}-thumb.webp`;

        const [fullUpload, thumbUpload] = await Promise.all([
          supabase.storage.from("photos").upload(storagePath, webpBlob, {
            contentType: "image/webp",
            upsert: false,
          }),
          supabase.storage.from("photos").upload(thumbnailPath, thumbnailBlob, {
            contentType: "image/webp",
            upsert: false,
          }),
        ]);

        if (fullUpload.error || thumbUpload.error) {
          throw new Error("No se pudo subir la imagen a Storage.");
        }

        const result = await registerPhoto({
          placeId,
          storagePath,
          thumbnailPath,
          takenAt,
        });

        if (result.error) {
          throw new Error(result.error);
        }
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "No se pudo subir una de las fotos.",
        );
        break;
      }
    }

    setIsUploading(false);
    setStatusMessage("");
    router.refresh();
  }

  function handleInputChange(event) {
    if (event.target.files?.length) {
      uploadFiles(event.target.files);
      event.target.value = "";
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files?.length) {
      uploadFiles(event.dataTransfer.files);
    }
  }

  return (
    <div className="mt-3 space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-2xl border border-dashed px-4 py-6 text-center transition ${
          isDragging
            ? "border-rose-300 bg-rose-50"
            : "border-zinc-200 bg-zinc-50"
        }`}
      >
        <p className="text-sm font-medium text-zinc-800">
          Arrastra fotos aquí o selecciónalas
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Se convertirán a WebP y usarán la fecha EXIF de la foto. Si no hay
          fecha en la imagen, se usará la del viaje.
        </p>
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="mt-4 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
        >
          {isUploading ? "Subiendo..." : "Elegir fotos"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {statusMessage ? (
        <p className="text-sm text-zinc-500">{statusMessage}</p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
