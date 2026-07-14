"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  getPlaceFallbackDate,
  normalizePhotoDate,
} from "@/lib/photo-dates";

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

export async function registerPhoto({
  placeId,
  storagePath,
  thumbnailPath,
  takenAt,
}) {
  const auth = await requireUser();

  if (auth.error) {
    return auth;
  }

  if (!placeId || !storagePath || !thumbnailPath) {
    return { error: "Faltan datos de la fotografía." };
  }

  const { data: place, error: placeError } = await auth.supabase
    .from("places")
    .select("id, start_date, planned_date")
    .eq("id", placeId)
    .maybeSingle();

  if (placeError || !place) {
    return { error: "No se encontró el lugar." };
  }

  const resolvedTakenAt =
    normalizePhotoDate(takenAt) ||
    normalizePhotoDate(getPlaceFallbackDate(place));

  const { error } = await auth.supabase.from("photos").insert({
    place_id: placeId,
    url: storagePath,
    thumbnail_url: thumbnailPath,
    taken_at: resolvedTakenAt,
  });

  if (error) {
    return { error: "No se pudo guardar la fotografía." };
  }

  revalidatePath("/mapa");
  revalidatePath("/album");
  return { success: true };
}

function getStoragePaths(photo) {
  return [photo.url, photo.thumbnail_url].filter(
    (path) => path && !path.startsWith("http://") && !path.startsWith("https://"),
  );
}

export async function deletePhoto(photoId) {
  const auth = await requireUser();

  if (auth.error) {
    return auth;
  }

  if (!photoId?.trim()) {
    return { error: "No se encontró la fotografía." };
  }

  const { data: photo, error: photoError } = await auth.supabase
    .from("photos")
    .select("id, url, thumbnail_url")
    .eq("id", photoId.trim())
    .maybeSingle();

  if (photoError || !photo) {
    return { error: "No se encontró la fotografía." };
  }

  const storagePaths = getStoragePaths(photo);

  if (storagePaths.length) {
    await auth.supabase.storage.from("photos").remove(storagePaths);
  }

  const { error } = await auth.supabase
    .from("photos")
    .delete()
    .eq("id", photo.id);

  if (error) {
    return { error: "No se pudo eliminar la fotografía." };
  }

  revalidatePath("/mapa");
  revalidatePath("/album");
  return { success: true };
}
