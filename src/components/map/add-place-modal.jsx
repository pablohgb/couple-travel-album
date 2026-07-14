"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createPlace } from "@/app/mapa/actions";

const inputClassName =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100";

const labelClassName = "text-sm font-medium text-zinc-700";

export function AddPlaceModal({ open, onClose, pickedLocation, initialPlace }) {
  const router = useRouter();
  const [isSaving, startSave] = useTransition();
  const [error, setError] = useState(null);

  if (!open || !pickedLocation) {
    return null;
  }

  function handleClose() {
    setError(null);
    onClose();
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.set("latitude", String(pickedLocation.latitude));
    formData.set("longitude", String(pickedLocation.longitude));
    formData.set("status", "visited");

    startSave(async () => {
      const result = await createPlace(formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      handleClose();
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-y-0 right-0 z-[2000] w-full max-w-md overflow-y-auto border-l border-rose-100 bg-white shadow-2xl">
      <div className="sticky top-0 flex items-center justify-between border-b border-rose-100 bg-white px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">
            Lugar visitado
          </h2>
          <p className="text-sm text-zinc-500">
            Añade los detalles de este recuerdo.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          Cerrar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {initialPlace?.displayName || "Ubicación seleccionada en el mapa"}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="name" className={labelClassName}>
              Nombre del lugar *
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={initialPlace?.name ?? ""}
              className={`${inputClassName} mt-2`}
              placeholder="Ej. Nuestra escapada a Lisboa"
            />
          </div>

          <div>
            <label htmlFor="city" className={labelClassName}>
              Ciudad
            </label>
            <input
              id="city"
              name="city"
              defaultValue={initialPlace?.city ?? ""}
              className={`${inputClassName} mt-2`}
              placeholder="Lisboa"
            />
          </div>

          <div>
            <label htmlFor="country" className={labelClassName}>
              País
            </label>
            <input
              id="country"
              name="country"
              defaultValue={initialPlace?.country ?? ""}
              className={`${inputClassName} mt-2`}
              placeholder="Portugal"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="start_date" className={labelClassName}>
              Fecha de inicio
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              className={`${inputClassName} mt-2`}
            />
          </div>
          <div>
            <label htmlFor="end_date" className={labelClassName}>
              Fecha de fin
            </label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              className={`${inputClassName} mt-2`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className={labelClassName}>
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className={`${inputClassName} mt-2`}
            placeholder="Qué recordáis de este lugar..."
          />
        </div>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-rose-100 pt-4 md:flex-row md:justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
          >
            {isSaving ? "Guardando..." : "Guardar lugar"}
          </button>
        </div>
      </form>
    </div>
  );
}
