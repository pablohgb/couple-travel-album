import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { PageBackground } from "@/components/layout/page-background";
import {
  computeHomeStats,
  formatRelationshipDuration,
  getRelationshipDuration,
} from "@/lib/stats";
import { formatDate } from "@/lib/places";
import { createClient } from "@/lib/supabase/server";

const sections = [
  {
    href: "/mapa",
    title: "Mapa",
    description: "Este es un mapa de todos los sitios en los que hemos estado o queremos ir.",
    emoji: "🗺️",
  },
  {
    href: "/album",
    title: "Álbum",
    description: "Aquí están todas las fotos de nuestros viajes en un solo lugar.",
    emoji: "📷",
  },
  {
    href: "/timeline",
    title: "Línea temporal",
    description: "Nuestros viajes ordenados por año en una línea temporal.",
    emoji: "🕰️",
  },
];

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-zinc-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-400">{hint}</p> : null}
    </div>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: places },
    { count: photoCount },
    { data: configRows },
  ] = await Promise.all([
    supabase
      .from("places")
      .select("id, country, city, status, start_date"),
    supabase.from("photos").select("id", { count: "exact", head: true }),
    supabase
      .from("app_config")
      .select("key, value")
      .eq("key", "relationship_start_date"),
  ]);

  const stats = computeHomeStats(places ?? [], photoCount ?? 0);
  const relationshipStartDate = configRows?.[0]?.value ?? null;
  const relationship = getRelationshipDuration(relationshipStartDate);

  return (
    <PageBackground>
      <header className="border-b border-rose-100/80 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <img
              src="/LogoAP.png"
              alt="Logo"
              className="h-16 w-16 rounded-full object-cover sm:h-[4.5rem] sm:w-[4.5rem]"
            />
            <h1 className="text-2xl font-semibold text-zinc-900">
              Nuestros recuerdos
            </h1>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <section className="mb-8 overflow-hidden rounded-3xl border border-rose-100 p-8 text-white shadow-lg bg-[#FF8A8A]">
          <p className="text-sm uppercase tracking-[0.25em] text-rose-100">
            Tiempo juntos
          </p>
          {relationship ? (
            <>
              <p className="mt-3 text-4xl font-semibold">
                {formatRelationshipDuration(relationship)}
              </p>
              <p className="mt-2 text-lg text-rose-50">
                {relationship.totalDays.toLocaleString("es-ES")} días
              </p>
              <p className="mt-4 text-sm text-rose-100/90">
                Desde el {relationship.formattedStartDate}
              </p>
            </>
          ) : (
            <p className="mt-3 text-lg text-rose-50">
              Configura la fecha de inicio en Supabase (`relationship_start_date`).
            </p>
          )}
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-700">
            Explorar
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
              >
                <span className="text-2xl">{section.emoji}</span>
                <h3 className="mt-3 text-lg font-semibold text-zinc-900">
                  {section.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {section.description}
                </p>
                <p className="mt-4 text-sm font-medium text-[#FF8A8A]">
                  Ver sección →
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-700">
            Resumen
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Lugares" value={stats.totalPlaces} hint={`${stats.visitedCount} visitados · ${stats.plannedCount} pendientes`} />
            <StatCard label="Fotografías" value={stats.photoCount} />
            <StatCard label="Países" value={stats.countriesCount} />
            <StatCard label="Ciudades" value={stats.citiesCount} />
            <StatCard
              label="Primer viaje"
              value={stats.firstTrip ? formatDate(stats.firstTrip) : "—"}
            />
            <StatCard
              label="Último viaje"
              value={stats.lastTrip ? formatDate(stats.lastTrip) : "—"}
            />
          </div>
        </section>
      </main>
    </PageBackground>
  );
}
