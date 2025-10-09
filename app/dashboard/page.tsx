export default function DashboardPage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Bienvenido al Panel de Control
      </h1>
      <p className="mt-4 text-gray-600 text-center max-w-md">
        Desde aquí vas a poder gestionar los productos, camiones, clientes y
        existencias de la Panadería Santa Anita.
      </p>
    </section>
  );
}