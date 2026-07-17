function sanitizeFilename(value) {
  return String(value || "foto")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) || "foto";
}

function getExtensionFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    if (match?.[1]) {
      return `.${match[1].toLowerCase()}`;
    }
  } catch {
    // ignore invalid urls
  }

  return ".webp";
}

export function getPhotoFilename(photo, { placeName, index } = {}) {
  const extension = getExtensionFromUrl(photo.url);
  const base =
    photo.title ||
    (typeof index === "number"
      ? `${placeName || "foto"}-${String(index + 1).padStart(2, "0")}`
      : `${placeName || "foto"}-${photo.id?.slice?.(0, 8) || "imagen"}`);

  return `${sanitizeFilename(base)}${extension}`;
}

export async function downloadBlob(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function fetchPhotoBlob(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("No se pudo descargar la fotografía.");
  }

  return response.blob();
}

export async function downloadPhoto(photo, { placeName, index } = {}) {
  const blob = await fetchPhotoBlob(photo.url);
  const filename = getPhotoFilename(photo, { placeName, index });
  await downloadBlob(blob, filename);
}

export async function downloadAlbum(photos, placeName) {
  if (!photos?.length) {
    throw new Error("Este lugar no tiene fotografías para descargar.");
  }

  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const folderName = sanitizeFilename(placeName || "album");
  const folder = zip.folder(folderName);

  await Promise.all(
    photos.map(async (photo, index) => {
      const blob = await fetchPhotoBlob(photo.url);
      const filename = getPhotoFilename(photo, { placeName, index });
      folder.file(filename, blob);
    }),
  );

  const zipBlob = await zip.generateAsync({ type: "blob" });
  await downloadBlob(zipBlob, `${folderName}.zip`);
}
