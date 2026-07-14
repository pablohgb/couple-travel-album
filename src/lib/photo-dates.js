import { formatDate } from "@/lib/places";

export function getPlaceFallbackDate(place) {
  if (!place) {
    return null;
  }

  return place.start_date || place.planned_date || null;
}

export function normalizePhotoDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export function getPhotoDate(photo) {
  return photo.taken_at || getPlaceFallbackDate(photo.place) || null;
}

export function formatPhotoDate(photo) {
  const value = getPhotoDate(photo);

  if (!value) {
    return "Sin fecha";
  }

  return formatDate(value);
}
