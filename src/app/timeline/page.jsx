import Link from "next/link";
import { redirect } from "next/navigation";

import { TimelineView } from "@/components/timeline/timeline-view";
import { signPlacesPhotos } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";

export default async function TimelinePage() {
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
        taken_at,
        uploaded_at
      )
    `,
    )
    .order("start_date", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("Error loading timeline places:", error.message);
  }

  const placesWithSignedPhotos = await signPlacesPhotos(
    supabase,
    places ?? [],
  );

  return (
    <div className="min-h-full bg-gradient-to-b from-rose-50 via-white to-indigo-50">
      <header className="border-b border-rose-100/80 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <Link
            href="/"
            className="text-sm font-medium text-rose-600 hover:text-rose-700"
          >
            ← Volver al inicio
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
            Línea temporal
          </h1>
          <p className="text-sm text-zinc-500">
            Vuestros destinos ordenados cronológicamente.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <TimelineView places={placesWithSignedPhotos} />
      </main>
    </div>
  );
}
