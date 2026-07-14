"use server";

import { revalidatePath } from "next/cache";

import {
  emptyToNull,
  geocodeLocation,
  isValidStatus,
  reverseGeocodeLocation,
} from "@/lib/geocoding";
import { createClient } from "@/lib/supabase/server";

function parsePlaceFormData(formData) {
  return {
    name: formData.get("name")?.trim(),
    country: emptyToNull(formData.get("country")),
    city: emptyToNull(formData.get("city")),
    status: formData.get("status"),
    description: emptyToNull(formData.get("description")),
    ideas: emptyToNull(formData.get("ideas")),
    startDate: emptyToNull(formData.get("start_date")),
    endDate: emptyToNull(formData.get("end_date")),
    plannedDate: emptyToNull(formData.get("planned_date")),
    latitude: Number.parseFloat(formData.get("latitude")),
    longitude: Number.parseFloat(formData.get("longitude")),
  };
}

function buildPlaceRecord(parsed) {
  return {
    name: parsed.name,
    country: parsed.country,
    city: parsed.city,
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    status: parsed.status,
    description: parsed.description,
    ideas: parsed.status === "planned" ? parsed.ideas : null,
    start_date: parsed.status === "planned" ? null : parsed.startDate,
    end_date: parsed.status === "planned" ? null : parsed.endDate,
    planned_date: parsed.status === "planned" ? parsed.plannedDate : null,
  };
}

function validatePlaceFormData(parsed) {
  if (!parsed.name) {
    return { error: "El nombre del lugar es obligatorio." };
  }

  if (!isValidStatus(parsed.status)) {
    return { error: "Selecciona un tipo de lugar válido." };
  }

  if (!Number.isFinite(parsed.latitude) || !Number.isFinite(parsed.longitude)) {
    return { error: "La ubicación del lugar no es válida." };
  }

  return null;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tienes que iniciar sesión." };
  }

  return { supabase };
}

export async function createPlace(formData) {
  const auth = await requireUser();

  if (auth.error) {
    return auth;
  }

  const parsed = parsePlaceFormData(formData);
  const validationError = validatePlaceFormData(parsed);

  if (validationError) {
    return validationError;
  }

  const { error } = await auth.supabase
    .from("places")
    .insert(buildPlaceRecord(parsed));

  if (error) {
    return { error: "No se pudo guardar el lugar. Inténtalo de nuevo." };
  }

  revalidatePath("/mapa");
  revalidatePath("/album");
  return { success: true };
}

export async function updatePlace(formData) {
  const auth = await requireUser();

  if (auth.error) {
    return auth;
  }

  const placeId = formData.get("id")?.trim();

  if (!placeId) {
    return { error: "No se encontró el lugar a editar." };
  }

  const parsed = parsePlaceFormData(formData);
  const validationError = validatePlaceFormData(parsed);

  if (validationError) {
    return validationError;
  }

  const { error } = await auth.supabase
    .from("places")
    .update(buildPlaceRecord(parsed))
    .eq("id", placeId);

  if (error) {
    return { error: "No se pudo actualizar el lugar. Inténtalo de nuevo." };
  }

  revalidatePath("/mapa");
  revalidatePath("/album");
  return { success: true };
}

export async function deletePlace(placeId) {
  const auth = await requireUser();

  if (auth.error) {
    return auth;
  }

  if (!placeId?.trim()) {
    return { error: "No se encontró el lugar a eliminar." };
  }

  const normalizedPlaceId = placeId.trim();
  const { data: storageFiles } = await auth.supabase.storage
    .from("photos")
    .list(normalizedPlaceId);

  if (storageFiles?.length) {
    const paths = storageFiles.map(
      (file) => `${normalizedPlaceId}/${file.name}`,
    );

    await auth.supabase.storage.from("photos").remove(paths);
  }

  const { error } = await auth.supabase
    .from("places")
    .delete()
    .eq("id", normalizedPlaceId);

  if (error) {
    return { error: "No se pudo eliminar el lugar. Inténtalo de nuevo." };
  }

  revalidatePath("/mapa");
  revalidatePath("/album");
  return { success: true };
}

export async function searchPlaceLocation(formData) {
  return geocodeLocation({
    name: formData.get("name"),
    city: formData.get("city"),
    country: formData.get("country"),
  });
}

export async function getPlaceFromCoordinates({ latitude, longitude }) {
  return reverseGeocodeLocation(latitude, longitude);
}

export async function createQuickPlace({ latitude, longitude, status }) {
  const auth = await requireUser();

  if (auth.error) {
    return auth;
  }

  if (!isValidStatus(status) || status === "visited") {
    return { error: "Tipo de lugar no válido." };
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { error: "Ubicación no válida." };
  }

  const geocoded = await reverseGeocodeLocation(latitude, longitude);
  const fallbackName =
    status === "planned" ? "Lugar pendiente" : "Lugar favorito";
  const name = geocoded.error ? fallbackName : geocoded.name || fallbackName;

  const { error } = await auth.supabase.from("places").insert({
    name,
    country: geocoded.error ? null : geocoded.country,
    city: geocoded.error ? null : geocoded.city,
    latitude,
    longitude,
    status,
    description: null,
    ideas: null,
    start_date: null,
    end_date: null,
    planned_date: null,
  });

  if (error) {
    return { error: "No se pudo guardar el lugar. Inténtalo de nuevo." };
  }

  revalidatePath("/mapa");
  revalidatePath("/album");
  return { success: true, name };
}
