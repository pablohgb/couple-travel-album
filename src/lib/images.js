import exifr from "exifr";

const DEFAULT_MAX_WIDTH = 1920;
const DEFAULT_THUMB_WIDTH = 480;
const DEFAULT_QUALITY = 0.82;
const DEFAULT_THUMB_QUALITY = 0.75;

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };

    image.src = url;
  });
}

function canvasToWebpBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No se pudo convertir la imagen a WebP."));
          return;
        }

        resolve(blob);
      },
      "image/webp",
      quality,
    );
  });
}

async function fileToWebpBlob(file, { maxWidth, quality }) {
  const image = await loadImageFromFile(file);
  const scale = Math.min(1, maxWidth / image.width);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("No se pudo preparar la conversión de la imagen.");
  }

  context.drawImage(image, 0, 0, width, height);

  return canvasToWebpBlob(canvas, quality);
}

export async function convertFileToWebp(
  file,
  { maxWidth = DEFAULT_MAX_WIDTH, quality = DEFAULT_QUALITY } = {},
) {
  return fileToWebpBlob(file, { maxWidth, quality });
}

export async function convertFileToWebpThumbnail(file) {
  return fileToWebpBlob(file, {
    maxWidth: DEFAULT_THUMB_WIDTH,
    quality: DEFAULT_THUMB_QUALITY,
  });
}

export async function getPhotoTakenAtFromFile(file) {
  try {
    const exif = await exifr.parse(file, {
      pick: ["DateTimeOriginal", "CreateDate", "ModifyDate"],
    });

    const exifDate =
      exif?.DateTimeOriginal || exif?.CreateDate || exif?.ModifyDate;

    if (exifDate instanceof Date && !Number.isNaN(exifDate.getTime())) {
      return exifDate.toISOString();
    }
  } catch {
    // Some images don't include EXIF data.
  }

  if (file.lastModified) {
    return new Date(file.lastModified).toISOString();
  }

  return null;
}

export function isImageFile(file) {
  return file.type.startsWith("image/");
}
