import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/server";

const sections = [
  {
    href: "/mapa",
    title: "Mapa",
    description: "Chinchetas de lugares visitados y pendientes.",
  },
  {
    href: "/album",
    title: "Álbum",
    description: "Todas vuestras fotografías en un solo sitio.",
  },
  {
    href: "/timeline",
    title: "Línea temporal",
    description: "Viajes ordenados cronológicamente.",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-rose-50 via-white to-indigo-50">
      <header className="border-b border-rose-100/80 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-rose-400">
              Couple Travel Album
            </p>
            <h1 className="text-2xl font-semibold text-zinc-900">
              Nuestros recuerdos
            </h1>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <section className="mb-10 rounded-3xl border border-rose-100 bg-white/80 p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">
            Proyecto iniciado
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-zinc-600">
            Mapa, álbum y recuerdos privados en un solo lugar. Explora vuestros
            destinos, sube fotografías y revividlos cuando queráis.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-zinc-900">
                {section.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {section.description}
              </p>
              <p className="mt-4 text-sm font-medium text-rose-500">
                Ver sección
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
