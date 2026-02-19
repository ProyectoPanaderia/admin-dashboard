'use client';

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Image from 'next/image';

export function LogoutButton({ isMobile = false }: { isMobile?: boolean }) {
  const handleLogout = () => signOut({ callbackUrl: '/login' });

  if (isMobile) {
    return (
      <button
        onClick={handleLogout}
        className="flex items-center gap-4 px-2.5 text-red-500 hover:text-red-700 font-medium"
      >
        <LogOut className="h-5 w-5" />
        Cerrar Sesión
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="mt-auto h-9 w-9 rounded-lg text-muted-foreground hover:text-red-600 transition-colors"
      onClick={handleLogout}
      title="Cerrar Sesión"
    >
      <LogOut className="h-5 w-5" />
    </Button>
  );
}