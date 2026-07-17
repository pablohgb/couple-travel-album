import { formatDate } from "@/lib/places";

export function computeHomeStats(places, photoCount) {
  const visitedPlaces = places.filter(
    (place) => place.status === "visited" || place.status === "favorite",
  );
  const plannedPlaces = places.filter((place) => place.status === "planned");

  const countries = new Set(
    visitedPlaces.map((place) => place.country).filter(Boolean),
  );
  const cities = new Set(
    visitedPlaces.map((place) => place.city).filter(Boolean),
  );

  const tripDates = visitedPlaces
    .map((place) => place.start_date)
    .filter(Boolean)
    .sort();

  return {
    totalPlaces: places.length,
    visitedCount: visitedPlaces.length,
    plannedCount: plannedPlaces.length,
    countriesCount: countries.size,
    citiesCount: cities.size,
    photoCount,
    firstTrip: tripDates[0] ?? null,
    lastTrip: tripDates.at(-1) ?? null,
  };
}

export function getRelationshipDuration(startDateValue) {
  if (!startDateValue) {
    return null;
  }

  const start = new Date(startDateValue);
  const now = new Date();

  if (Number.isNaN(start.getTime()) || start > now) {
    return null;
  }

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.floor((now.getTime() - start.getTime()) / 86400000);

  return {
    years,
    months,
    days,
    totalDays,
    startDate: startDateValue,
    formattedStartDate: formatDate(startDateValue),
  };
}

export function formatRelationshipDuration(duration) {
  if (!duration) {
    return "Sin fecha configurada";
  }

  const parts = [];

  if (duration.years > 0) {
    parts.push(`${duration.years} año${duration.years === 1 ? "" : "s"}`);
  }

  if (duration.months > 0) {
    parts.push(`${duration.months} mes${duration.months === 1 ? "" : "es"}`);
  }

  if (duration.days > 0 || parts.length === 0) {
    parts.push(`${duration.days} día${duration.days === 1 ? "" : "s"}`);
  }

  return parts.join(", ");
}
