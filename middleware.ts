import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.rol; 
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname.startsWith("/login");

  // Agregamos todas las rutas que el REPARTIDOR no debe tocar
  const isAdminRoute = 
    pathname.startsWith("/dashboard/repartos") || 
    pathname.startsWith("/dashboard/usuarios") ||
    pathname.startsWith("/dashboard/productos") ||
    pathname.startsWith("/dashboard/clientes") ||
    pathname.startsWith("/dashboard/ciudades");

  // 1. Manejo de rutas de login
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    return NextResponse.next();
  }

  // 2. Si no está logueado, al login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 3. CONTROL DE ROLES: Bloqueo total a rutas administrativas
  if (isAdminRoute && userRole === "REPARTIDOR") {
    console.log(`Acceso denegado a ${pathname} para el rol REPARTIDOR`);
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};