import Link from "next/link";
import { redirect } from "next/navigation";

import { AlbumView } from "@/components/album/album-view";
import { signAlbumPhotos } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";

export default async function AlbumPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: photos, error } = await supabase
    .from("photos")
    .select(
      `
      id,
      url,
      thumbnail_url,
      title,
      taken_at,
      uploaded_at,
      place:places (
        id,
        name,
        city,
        country,
        start_date,
        planned_date
      )
    `,
    )
    .order("taken_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("Error loading album photos:", error.message);
  }

  const signedPhotos = await signAlbumPhotos(supabase, photos ?? []);

  return (
    <div className="min-h-full bg-gradient-to-b from-rose-50 via-white to-indigo-50">
      <header className="border-b border-rose-100/80 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <Link
            href="/"
            className="text-sm font-medium text-rose-600 hover:text-rose-700"
          >
            ← Volver al inicio
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Álbum</h1>
          <p className="text-sm text-zinc-500">
            Todas vuestras fotografías en un solo sitio.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <AlbumView photos={signedPhotos} />
      </main>
    </div>
  );
}
