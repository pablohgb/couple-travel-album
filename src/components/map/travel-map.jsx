"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import { createQuickPlace, getPlaceFromCoordinates } from "@/app/mapa/actions";
import { AddPlaceModal } from "@/components/map/add-place-modal";
import { FitBounds } from "@/components/map/fit-bounds";
import { MapClickHandler } from "@/components/map/map-click-handler";
import { MapLegend } from "@/components/map/map-legend";
import { MapResizeFix } from "@/components/map/map-resize-fix";
import { createPlaceIcon } from "@/components/map/place-marker";
import { PlacePanel } from "@/components/map/place-panel";
import { PlaceTypeMenu } from "@/components/map/place-type-menu";

import "leaflet/dist/leaflet.css";

export function TravelMap({ places, initialSelectedPlaceId = null }) {
  const router = useRouter();
  const [selectedPlaceId, setSelectedPlaceId] = useState(initialSelectedPlaceId);
  const selectedPlace =
    places.find((place) => place.id === selectedPlaceId) ?? null;
  const [mapClick, setMapClick] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);
  const [initialPlace, setInitialPlace] = useState(null);
  const [isProcessing, startProcessing] = useTransition();
  const suppressMapClickRef = useRef(false);

  function suppressMapClickBriefly() {
    suppressMapClickRef.current = true;
    window.setTimeout(() => {
      suppressMapClickRef.current = false;
    }, 350);
  }

  function canInteractWithMarkers() {
    return !mapClick && !isAddOpen && !selectedPlaceId && !isProcessing;
  }

  function handleMapPick(location) {
    if (suppressMapClickRef.current || isAddOpen || isProcessing || mapClick) {
      return;
    }

    if (selectedPlaceId) {
      return;
    }

    setMapClick(location);
  }

  function handleCancelPick() {
    setMapClick(null);
    suppressMapClickBriefly();
  }

  function handleMarkerClick(event, placeId) {
    event.originalEvent?.stopPropagation();

    if (!canInteractWithMarkers()) {
      return;
    }

    setSelectedPlaceId(placeId);
  }

  function handleSelectType(status) {
    if (!mapClick) {
      return;
    }

    if (status === "visited") {
      const location = mapClick;
      setMapClick(null);
      suppressMapClickBriefly();
      setPickedLocation(location);

      startProcessing(async () => {
        const geocoded = await getPlaceFromCoordinates({
          latitude: location.latitude,
          longitude: location.longitude,
        });

        setInitialPlace(geocoded.error ? null : geocoded);
        setIsAddOpen(true);
      });

      return;
    }

    const location = mapClick;
    setMapClick(null);
    suppressMapClickBriefly();

    startProcessing(async () => {
      const result = await createQuickPlace({
        latitude: location.latitude,
        longitude: location.longitude,
        status,
      });

      if (result.error) {
        window.alert(result.error);
        return;
      }

      router.refresh();
    });
  }

  function handleCloseAdd() {
    setIsAddOpen(false);
    setPickedLocation(null);
    setInitialPlace(null);
  }

  return (
    <>
      <div className="relative h-[70vh] min-h-[420px] w-full overflow-hidden rounded-3xl border border-rose-100 bg-sky-100 shadow-sm">
        <div className="absolute left-4 top-4 z-[1000]">
          <MapLegend />
        </div>

        <MapContainer
          center={[30, 10]}
          zoom={2}
          scrollWheelZoom
          className="z-0 h-full w-full"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapResizeFix />
          <FitBounds places={places} />
          <MapClickHandler
            enabled={!isAddOpen && !isProcessing && !mapClick && !selectedPlaceId}
            onPick={handleMapPick}
          />

          {places.map((place) => (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              icon={createPlaceIcon(place.status)}
              eventHandlers={{
                click: (event) => handleMarkerClick(event, place.id),
              }}
            />
          ))}

          {mapClick ? (
            <Popup
              position={[mapClick.latitude, mapClick.longitude]}
              closeButton={false}
              closeOnClick={false}
              autoPan
            >
              <PlaceTypeMenu
                loading={isProcessing}
                onSelect={handleSelectType}
                onCancel={handleCancelPick}
              />
            </Popup>
          ) : null}
        </MapContainer>

        {places.length === 0 && !isAddOpen ? (
          <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-[1000] md:left-auto md:right-4 md:max-w-sm">
            <div className="rounded-2xl border border-rose-100 bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
              <h2 className="text-base font-semibold text-zinc-900">
                Aún no hay lugares
              </h2>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                Haz clic en el mapa para elegir visitado, pendiente o favorito.
              </p>
            </div>
          </div>
        ) : null}

        {isProcessing ? (
          <div className="absolute right-4 top-4 z-[1000] rounded-full bg-white/95 px-4 py-2 text-sm text-zinc-600 shadow">
            Guardando...
          </div>
        ) : null}

        <PlacePanel
          key={selectedPlaceId}
          place={selectedPlace}
          onClose={() => setSelectedPlaceId(null)}
        />
      </div>

      <AddPlaceModal
        open={isAddOpen}
        onClose={handleCloseAdd}
        pickedLocation={pickedLocation}
        initialPlace={initialPlace}
      />
    </>
  );
}
