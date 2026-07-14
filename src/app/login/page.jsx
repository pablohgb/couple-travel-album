import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-br from-rose-950 via-zinc-950 to-indigo-950 px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-200/70">
            Privado
          </p>
          <h1 className="text-3xl font-semibold text-white">Nuestro álbum</h1>
          <p className="text-sm text-rose-100/70">
            Mapa, viajes y recuerdos en un solo lugar.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
