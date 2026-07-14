import Link from "next/link";
import { redirect } from "next/navigation";

import { TravelMapClient } from "@/components/map/travel-map-client";
import { signPlacesPhotos } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";

export default async function MapPage({ searchParams }) {
  const { lugar } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: places, error } = await supabase
    .from("places")
    .select(
      `
      id,
      name,
      country,
      city,
      latitude,
      longitude,
      status,
      description,
      ideas,
      start_date,
      end_date,
      planned_date,
      photos (
        id,
        url,
        thumbnail_url,
        title,
        taken_at
      )
    `,
    )
    .order("name");

  if (error) {
    console.error("Error loading places:", error.message);
  }

  const placesWithSignedPhotos = await signPlacesPhotos(
    supabase,
    places ?? [],
  );

  return (
    <div className="min-h-full bg-gradient-to-b from-rose-50 via-white to-indigo-50">
      <header className="border-b border-rose-100/80 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/"
              className="text-sm font-medium text-rose-600 hover:text-rose-700"
            >
              ← Volver al inicio
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Mapa</h1>
            <p className="text-sm text-zinc-500">
              {places?.length ?? 0} lugar
              {(places?.length ?? 0) === 1 ? "" : "es"} en vuestro álbum
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        <div className="h-[70vh] min-h-[420px]">
          <TravelMapClient
            places={placesWithSignedPhotos}
            initialSelectedPlaceId={lugar ?? null}
          />
        </div>
      </main>
    </div>
  );
}
