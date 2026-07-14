"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();

    const timeout = window.setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [map]);

  return null;
}
