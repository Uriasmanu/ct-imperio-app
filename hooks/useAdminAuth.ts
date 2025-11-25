// hooks/useAdminAuth.ts
import { useUser } from '@/contexts/UserContext';
import { useMemo } from 'react';

export const useAdminAuth = () => {
  const { usuario, loading } = useUser();

  // Calcula isAdmin diretamente do usuário do contexto
  // Sem chamadas adicionais ao Firebase
  const isAdmin = useMemo(() => {
    if (!usuario) return false;
    
    // Verifica se o campo admin existe e é true
    return (usuario as any).admin === true;
  }, [usuario]);

  return {
    user: usuario,
    isAdmin,
    loading, // usa apenas o loading do contexto
  };
};