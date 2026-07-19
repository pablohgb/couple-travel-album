"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deletePlace, updatePlace } from "@/app/mapa/actions";
import { PhotoGallery } from "@/components/map/photo-gallery";
import { PhotoUpload } from "@/components/map/photo-upload";
import {
  formatDate,
  formatPlaceDates,
  getPlaceLocation,
  PLACE_STATUS,
  toInputDate,
} from "@/lib/places";

const inputClassName =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100";

const labelClassName = "text-sm font-medium text-zinc-700";

export function PlacePanel({ place, onClose }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(place?.status ?? "visited");
  const [error, setError] = useState(null);
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  if (!place) {
    return null;
  }

  const placeStatus = PLACE_STATUS[place.status] ?? PLACE_STATUS.visited;
  const location = getPlaceLocation(place);
  const photos = place.photos ?? [];

  function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.set("id", place.id);
    formData.set("latitude", String(place.latitude));
    formData.set("longitude", String(place.longitude));
    formData.set("status", status);

    startSave(async () => {
      const result = await updatePlace(formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      setIsEditing(false);
      router.refresh();
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar "${place.name}"? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    startDelete(async () => {
      const result = await deletePlace(place.id);

      if (result.error) {
        setError(result.error);
        return;
      }

      onClose();
      router.refresh();
    });
  }

  return (
    <aside className="absolute inset-x-0 bottom-0 z-[1000] max-h-[70vh] overflow-y-auto rounded-t-3xl border border-rose-100 bg-white shadow-2xl md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[400px] md:rounded-none md:rounded-l-3xl">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-rose-100 bg-white px-5 py-4">
        <div>
          {!isEditing ? (
            <span
              className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: placeStatus.color }}
            >
              {placeStatus.label}
            </span>
          ) : (
            <p className="text-sm font-medium text-rose-500">Editando lugar</p>
          )}
          <h2 className="mt-2 text-2xl font-semibold text-zinc-900">
            {isEditing ? "Editar datos" : place.name}
          </h2>
          {!isEditing && location ? (
            <p className="text-sm text-zinc-500">{location}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
            >
              Editar
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              if (isEditing) {
                setIsEditing(false);
                setError(null);
                setStatus(place.status);
                return;
              }

              onClose();
            }}
            className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-50"
          >
            {isEditing ? "Cancelar" : "Cerrar"}
          </button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
          <div>
            <label htmlFor="edit-name" className={labelClassName}>
              Nombre del lugar *
            </label>
            <input
              id="edit-name"
              name="name"
              required
              defaultValue={place.name}
              className={`${inputClassName} mt-2`}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="edit-city" className={labelClassName}>
                Ciudad
              </label>
              <input
                id="edit-city"
                name="city"
                defaultValue={place.city ?? ""}
                className={`${inputClassName} mt-2`}
              />
            </div>
            <div>
              <label htmlFor="edit-country" className={labelClassName}>
                País
              </label>
              <input
                id="edit-country"
                name="country"
                defaultValue={place.country ?? ""}
                className={`${inputClassName} mt-2`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-status" className={labelClassName}>
              Tipo de lugar
            </label>
            <select
              id="edit-status"
              name="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className={`${inputClassName} mt-2`}
            >
              {Object.entries(PLACE_STATUS).map(([value, option]) => (
                <option key={value} value={value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {status === "planned" ? (
            <>
              <div>
                <label htmlFor="edit-ideas" className={labelClassName}>
                  Ideas para el viaje
                </label>
                <textarea
                  id="edit-ideas"
                  name="ideas"
                  rows={3}
                  defaultValue={place.ideas ?? ""}
                  className={`${inputClassName} mt-2`}
                />
              </div>
              <div>
                <label htmlFor="edit-planned-date" className={labelClassName}>
                  Fecha prevista
                </label>
                <input
                  id="edit-planned-date"
                  name="planned_date"
                  type="date"
                  defaultValue={toInputDate(place.planned_date)}
                  className={`${inputClassName} mt-2`}
                />
              </div>
            </>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="edit-start-date" className={labelClassName}>
                  Fecha de inicio
                </label>
                <input
                  id="edit-start-date"
                  name="start_date"
                  type="date"
                  defaultValue={toInputDate(place.start_date)}
                  className={`${inputClassName} mt-2`}
                />
              </div>
              <div>
                <label htmlFor="edit-end-date" className={labelClassName}>
                  Fecha de fin
                </label>
                <input
                  id="edit-end-date"
                  name="end_date"
                  type="date"
                  defaultValue={toInputDate(place.end_date)}
                  className={`${inputClassName} mt-2`}
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="edit-description" className={labelClassName}>
              Descripción
            </label>
            <textarea
              id="edit-description"
              name="description"
              rows={4}
              defaultValue={place.description ?? ""}
              className={`${inputClassName} mt-2`}
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
          >
            {isSaving ? "Guardando cambios..." : "Guardar cambios"}
          </button>
        </form>
      ) : (
        <div className="space-y-6 px-5 py-5">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Fechas
            </h3>
            <p className="mt-2 text-zinc-700">{formatPlaceDates(place)}</p>
          </section>

          {place.description ? (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                Descripción
              </h3>
              <p className="mt-2 leading-7 text-zinc-700">{place.description}</p>
            </section>
          ) : null}

          {place.ideas && place.status === "planned" ? (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                Ideas
              </h3>
              <p className="mt-2 leading-7 text-zinc-700">{place.ideas}</p>
            </section>
          ) : null}

          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                Fotografías
              </h3>
              <span className="text-sm text-zinc-500">
                {photos.length} foto{photos.length === 1 ? "" : "s"}
              </span>
            </div>

            {photos.length ? (
              <div className="mt-3">
                <PhotoGallery
                  photos={photos}
                  placeName={place.name}
                  place={place}
                />
              </div>
            ) : null}

            <PhotoUpload placeId={place.id} />
          </section>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            {isDeleting ? "Eliminando..." : "Eliminar lugar"}
          </button>
        </div>
      )}
    </aside>
  );
}
