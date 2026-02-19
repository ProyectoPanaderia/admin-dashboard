import { redirect } from 'next/navigation';

export default function Home() {
  // Redirigimos automáticamente al dashboard al entrar a la raíz
  redirect('/dashboard');
}