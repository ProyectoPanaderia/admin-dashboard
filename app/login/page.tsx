"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { montserrat, greatVibes } from '../ui/fonts';

export default function Page() {
  const router = useRouter();
  
  // Agregamos los estados para controlar el formulario
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Usamos signIn de Next Auth en lugar del router.push directo
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Usuario o contraseña incorrectos");
        setIsLoading(false);
      } else if (res?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Ocurrió un error al intentar iniciar sesión");
      setIsLoading(false);
    }
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
      <div className="w-full max-w-md rounded-lg bg-gray-900/90 p-8 shadow-lg backdrop-blur-sm">
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          {/* Mensaje de error dinámico */}
          {error && (
            <div className="rounded-md bg-red-500/20 p-2 text-center text-sm font-medium text-red-200 border border-red-500/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-600 disabled:bg-blue-500/50"
          >
            {isLoading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
      
      <footer className="mt-12 text-center text-sm text-white">
        <p>&copy; 2026 Panadería Santa Anita. Sistema de Gestión</p>
      </footer>
    </main>
  );
}