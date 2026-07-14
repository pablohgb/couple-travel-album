"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export function FitBounds({ places }) {
  const map = useMap();

  useEffect(() => {
    if (!places.length) {
      map.setView([30, 10], 2);
      return;
    }

    const bounds = L.latLngBounds(
      places.map((place) => [place.latitude, place.longitude]),
    );

    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 8 });
  }, [map, places]);

  return null;
}
