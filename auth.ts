import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// URL del en Express
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
     async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          console.log("Intentando conectar a:", `${BACKEND_URL}/auth/login`); // <-- ESPÍA 1
          
          const res = await fetch(`${BACKEND_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          const data = await res.json();
          
          console.log("Respuesta del backend:", res.status, data); // <-- ESPÍA 2

          if (!res.ok || !data.token) {
            console.log("Login falló por:", data.error); // <-- ESPÍA 3
            throw new Error(data.error || "Credenciales inválidas");
          }

          return {
            id: data.usuario.id.toString(),
            username: data.usuario.username,
            rol: data.usuario.rol,
            repartoId: data.usuario.repartoId,
            token: data.token,
          };
        } catch (error) {
          console.log("Error fatal en el authorize:", error); // <-- ESPÍA 4
          return null;
        }
      }
    })
  ],
callbacks: {
    // 1. Mutamos el token de Next Auth para guardar los datos de nuestro backend
    async jwt({ token, user }) {
      // El objeto 'user' solo está disponible la primera vez que se inicia sesión
      if (user) {
        token.id = user.id as string;
        token.username = user.username as string;
        
        // Casteamos a los roles específicos para evitar errores de tipo
        token.rol = user.rol as "SUPERADMIN" | "ADMINISTRADOR" | "REPARTIDOR"; 
        
        token.repartoId = user.repartoId as number | null;
        token.token = user.token as string;
      }
      return token;
    },
    
    // 2. Pasamos esos datos del token a la sesión
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.rol = token.rol;
        session.user.repartoId = token.repartoId;
        session.user.token = token.token; 
      }
      return session;
    }
  },
  pages: {
    signIn: "/login", // Redirigir aquí si no están autenticados
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas
  },
});