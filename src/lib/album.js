import { getPlaceLocation } from "@/lib/places";
import { formatPhotoDate, getPhotoDate } from "@/lib/photo-dates";

export function getPhotoSearchText(photo) {
  const place = photo.place ?? {};

  return [
    photo.title,
    place.name,
    place.city,
    place.country,
    getPlaceLocation(place),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function filterAlbumPhotos(photos, { search, placeId }) {
  const normalizedSearch = search.trim().toLowerCase();

  return photos.filter((photo) => {
    if (placeId && photo.place?.id !== placeId) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return getPhotoSearchText(photo).includes(normalizedSearch);
  });
}

export function sortAlbumPhotos(photos, sortOrder) {
  const sorted = [...photos];

  sorted.sort((left, right) => {
    const leftDate = getPhotoDate(left);
    const rightDate = getPhotoDate(right);
    const leftTime = leftDate ? new Date(leftDate).getTime() : 0;
    const rightTime = rightDate ? new Date(rightDate).getTime() : 0;

    if (sortOrder === "oldest") {
      return leftTime - rightTime;
    }

    return rightTime - leftTime;
  });

  return sorted;
}

export function getAlbumPlaces(photos) {
  const places = new Map();

  for (const photo of photos) {
    if (!photo.place?.id) {
      continue;
    }

    places.set(photo.place.id, photo.place);
  }

  return Array.from(places.values()).sort((left, right) =>
    left.name.localeCompare(right.name, "es"),
  );
}

export { formatPhotoDate, getPhotoDate };
