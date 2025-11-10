// contexts/UserContext.tsx
import { useAuth } from '@/hooks/useAuth';
import { Usuario } from '@/types/usuarios';
import React, { createContext, useContext, useEffect } from 'react';

interface UserContextType {
  usuario: Usuario | null;
  loading: boolean;
  refreshing: boolean;
  atualizarUsuario: (novoUsuario: Usuario | null) => void;
  recarregarUsuario: () => void;
  handlePagamentoAtualizado: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    usuario,
    setUsuario,
    loading,
    refreshing,
    onRefresh,
    handlePagamentoAtualizado,
  } = useAuth();

  const atualizarUsuario = (novoUsuario: Usuario | null) => {
    setUsuario(novoUsuario);
  };

  const recarregarUsuario = () => {
    onRefresh();
  };

  // Recarregar automaticamente a cada 30 segundos quando estiver online
  useEffect(() => {
    if (!usuario) return;

    const interval = setInterval(() => {
      recarregarUsuario();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [usuario]);

  return (
    <UserContext.Provider
      value={{
        usuario,
        loading,
        refreshing,
        atualizarUsuario,
        recarregarUsuario,
        handlePagamentoAtualizado,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};