export const PLACE_STATUS = {
  visited: {
    label: "Visitado",
    color: "#e11d48",
    mapColor: "#e11d48",
  },
  planned: {
    label: "Pendiente",
    color: "#d97706",
    mapColor: "#f59e0b",
  },
  favorite: {
    label: "Favorito",
    color: "#4f46e5",
    mapColor: "#6366f1",
  },
};

export function formatPlaceDates(place) {
  if (place.start_date && place.end_date) {
    return `${formatDate(place.start_date)} – ${formatDate(place.end_date)}`;
  }

  if (place.start_date) {
    return `Desde ${formatDate(place.start_date)}`;
  }

  if (place.planned_date) {
    return `Previsto: ${formatDate(place.planned_date)}`;
  }

  return "Sin fechas";
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function getPlaceLocation(place) {
  return [place.city, place.country].filter(Boolean).join(", ");
}

export function toInputDate(value) {
  if (!value) {
    return "";
  }

  return String(value).split("T")[0];
}
