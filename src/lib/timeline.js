import { getPlaceLocation, PLACE_STATUS } from "@/lib/places";

function getTimelineSortDate(place) {
  if (place.status === "planned") {
    return place.planned_date || null;
  }

  return place.start_date || place.end_date || null;
}

export function getTimelineYear(place) {
  const dateValue = getTimelineSortDate(place);

  if (!dateValue) {
    return null;
  }

  return new Date(dateValue).getFullYear();
}

export function buildTimelineSections(places) {
  const visitedPlaces = places.filter(
    (place) => place.status === "visited" || place.status === "favorite",
  );
  const plannedPlaces = places.filter((place) => place.status === "planned");

  const datedVisited = visitedPlaces.filter((place) => getTimelineYear(place));
  const undatedVisited = visitedPlaces.filter((place) => !getTimelineYear(place));

  const yearMap = new Map();

  for (const place of datedVisited) {
    const year = getTimelineYear(place);

    if (!yearMap.has(year)) {
      yearMap.set(year, []);
    }

    yearMap.get(year).push(place);
  }

  const years = Array.from(yearMap.entries())
    .sort(([leftYear], [rightYear]) => rightYear - leftYear)
    .map(([year, yearPlaces]) => ({
      year,
      places: yearPlaces.sort((left, right) => {
        const leftDate = getTimelineSortDate(left);
        const rightDate = getTimelineSortDate(right);
        const leftTime = leftDate ? new Date(leftDate).getTime() : 0;
        const rightTime = rightDate ? new Date(rightDate).getTime() : 0;
        return rightTime - leftTime;
      }),
    }));

  const sortedPlanned = [...plannedPlaces].sort((left, right) => {
    const leftDate = getTimelineSortDate(left);
    const rightDate = getTimelineSortDate(right);
    const leftTime = leftDate ? new Date(leftDate).getTime() : Infinity;
    const rightTime = rightDate ? new Date(rightDate).getTime() : Infinity;
    return leftTime - rightTime;
  });

  return {
    years,
    undatedVisited,
    plannedPlaces: sortedPlanned,
  };
}

export function getPlacePhotoCount(place) {
  return place.photos?.length ?? 0;
}

export { getPlaceLocation, PLACE_STATUS };
