// Créer un composant HOC (Higher Order Component) pour protéger les routes basées sur le rôle
// Nouveau fichier: src/components/auth/RoleGuard.tsx
'use client';

import { useAuth } from '../../lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


type RoleGuardProps = {
  children: React.ReactNode;
  allowedRoles: ('student' | 'teacher' | 'admin')[];
};

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !allowedRoles.includes(user.role))) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#138784]"></div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

