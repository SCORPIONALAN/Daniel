'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function ProtectedPage({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/usuarios/check', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();

        if (res.ok) {
          console.log('Usuario autenticado, admin?', data.esAdmin);

          // Redirige solo si estás en login o registro
          const loginPages = ['/pages/login', '/pages/registro'];
          if (loginPages.includes(pathname)) {
            router.replace('/pages/home');
          }
        }
        // Si no está autenticado, no hacemos nada -> puede navegar a login/registro
      } catch (error) {
        console.error('Error al verificar sesión:', error);
      }
    };

    checkAuth();
  }, [router, pathname]);

  return <>{children}</>;
}
