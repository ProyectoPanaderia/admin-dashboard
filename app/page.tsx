"use client";

import { montserrat, greatVibes } from './ui/fonts';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // evita recargar la página
    // acá podrías validar usuario/contraseña si quisieras
    router.push("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6">
      {/* Fondo */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/panaderia.png"
          alt="Fondo panadería"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gray-900/50" />
      </div>

      {/* Logo */}
      <div className="mb-12 flex items-baseline gap-4">
        <span
          className={`text-4xl font-extrabold uppercase tracking-wide text-white md:text-7xl ${montserrat.className}`}
        >
          PANADERIA
        </span>
        <span
          className={`text-4xl text-red-500 md:text-7xl ${greatVibes.className}`}
          style={{ fontWeight: 700 }}
        >
          Santa Anita
        </span>
      </div>

      {/* Formulario */}
      <div className="w-full max-w-md rounded-lg bg-gray-90/90 p-8 shadow-lg backdrop-blur-sm">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">
          Ingreso al sistema
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="usuario"
              className="block text-sm font-medium text-white"
            >
              Usuario
            </label>
            <input
              id="usuario"
              type="text"
              placeholder="Tu usuario"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="********"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-600"
          >
            Ingresar
          </button>
        </form>
      </div>
      <footer className="mt-12 text-center text-sm text-white">
        <p>&copy; 2025 Hecho por las bestias. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}