import L from "leaflet";

import { PLACE_STATUS } from "@/lib/places";

export function createPlaceIcon(status) {
  const color = PLACE_STATUS[status]?.mapColor ?? PLACE_STATUS.visited.mapColor;

  return L.divIcon({
    className: "place-marker-icon",
    html: `
      <div class="place-marker-pin" style="--marker-color: ${color}">
        <span></span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -12],
  });
}
