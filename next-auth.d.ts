import NextAuth, { type DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      rol: "SUPERADMIN" | "ADMINISTRADOR" | "REPARTIDOR";
      repartoId: number | null;
      token: string; // El JWT de tu backend en Express
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    rol: "SUPERADMIN" | "ADMINISTRADOR" | "REPARTIDOR";
    repartoId: number | null;
    token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    rol: "SUPERADMIN" | "ADMINISTRADOR" | "REPARTIDOR";
    repartoId: number | null;
    token: string;
  }
}