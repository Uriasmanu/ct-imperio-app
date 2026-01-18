import { UsuarioCompleto } from "@/types/admin";
import { useMemo } from "react";

interface Estatisticas {
  total: number;
  pendentes: number;
  pagos: number;
  comFilhos: number;
  totalAlunos: number;
}

export function useEstatisticasUsuarios(
  usuarios: UsuarioCompleto[],
): Estatisticas {
  return useMemo(() => {
    return {
      total: usuarios.length,
      pendentes: calcularPendentes(usuarios),
      pagos: calcularPagos(usuarios),
      comFilhos: calcularComFilhos(usuarios),
      totalAlunos: calcularTotalAlunos(usuarios),
    };
  }, [usuarios]);
}

function calcularPendentes(usuarios: UsuarioCompleto[]): number {
  return usuarios.reduce((total, usuario) => {
    const usuarioPendente = verificaUsuarioPendente(usuario) ? 1 : 0;
    const filhosPendentes = contarFilhosPendentes(usuario);

    return total + usuarioPendente + filhosPendentes;
  }, 0);
}

function verificaUsuarioPendente(usuario: UsuarioCompleto): boolean {
  return (
    !usuario.pagamento && !!usuario.modalidades?.some((m) => m.ativo !== false)
  );
}

function contarFilhosPendentes(usuario: UsuarioCompleto): number {
  if (!usuario.filhos) return 0;

  return usuario.filhos.filter(
    (filho) =>
      !filho.pagamento && filho.modalidades?.some((m) => m.ativo !== false),
  ).length;
}

function calcularPagos(usuarios: UsuarioCompleto[]): number {
  return usuarios.reduce((total, usuario) => {
    const usuarioPago = usuario.pagamento ? 1 : 0;
    const filhosPagos = contarFilhosPagos(usuario);

    return total + usuarioPago + filhosPagos;
  }, 0);
}

function contarFilhosPagos(usuario: UsuarioCompleto): number {
  if (!usuario.filhos) return 0;

  return usuario.filhos.filter((filho) => filho.pagamento).length;
}

function calcularComFilhos(usuarios: UsuarioCompleto[]): number {
  return usuarios.filter((u) => u.filhos && u.filhos.length > 0).length;
}

function calcularTotalAlunos(usuarios: UsuarioCompleto[]): number {
  const totalFilhos = usuarios.reduce(
    (total, usuario) => total + (usuario.filhos?.length || 0),
    0,
  );

  return totalFilhos + usuarios.length;
}
