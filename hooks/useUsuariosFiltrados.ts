import { FiltrosState, UsuarioCompleto } from "@/types/admin";
import { useMemo } from "react";

interface UseUsuariosFiltradosParams {
  usuarios: UsuarioCompleto[];
  filtros: FiltrosState;
}

export function useUsuariosFiltrados({
  usuarios,
  filtros,
}: UseUsuariosFiltradosParams) {
  return useMemo(() => {
    return usuarios.filter((usuario) => {
      if (!passaFiltroBusca(usuario, filtros.busca)) {
        return false;
      }

      if (!passaFiltroModalidade(usuario, filtros.modalidade)) {
        return false;
      }

      if (!passaFiltroStatusPagamento(usuario, filtros.statusPagamento)) {
        return false;
      }

      return true;
    });
  }, [usuarios, filtros]);
}

function passaFiltroBusca(usuario: UsuarioCompleto, busca: string): boolean {
  if (!busca) return true;

  const buscaLower = busca.toLowerCase();
  const nomeCombina = usuario.nome.toLowerCase().includes(buscaLower);
  const emailCombina = usuario.email.toLowerCase().includes(buscaLower);

  return nomeCombina || emailCombina;
}

function passaFiltroModalidade(
  usuario: UsuarioCompleto,
  modalidade: string,
): boolean {
  if (modalidade === "todas") return true;

  const usuarioTemModalidade =
    usuario.modalidades?.some(
      (m) => m && m.modalidade === modalidade && m.ativo !== false,
    ) ?? false;

  const algumFilhoTemModalidade =
    usuario.filhos?.some((filho) =>
      filho.modalidades?.some(
        (m) => m && m.modalidade === modalidade && m.ativo !== false,
      ),
    ) ?? false;

  return usuarioTemModalidade || algumFilhoTemModalidade;
}

function passaFiltroStatusPagamento(
  usuario: UsuarioCompleto,
  status: string,
): boolean {
  if (status === "todos") return true;

  const usuarioTemModalidadeAtiva =
    usuario.modalidades?.some((m) => m && m.ativo !== false) ?? false;

  const algumFilhoTemModalidadeAtiva =
    usuario.filhos?.some((filho) =>
      filho.modalidades?.some((m) => m && m.ativo !== false),
    ) ?? false;

  if (!usuarioTemModalidadeAtiva && !algumFilhoTemModalidadeAtiva) {
    return false;
  }

  switch (status) {
    case "pagos":
      return verificaStatusPagos(usuario, usuarioTemModalidadeAtiva);

    case "aguardando":
      return verificaStatusAguardando(usuario, usuarioTemModalidadeAtiva);

    case "pendentes":
      return verificaStatusPendentes(usuario, usuarioTemModalidadeAtiva);

    default:
      return true;
  }
}

function verificaStatusPagos(
  usuario: UsuarioCompleto,
  usuarioTemModalidadeAtiva: boolean,
): boolean {
  const usuarioPago = usuario.pagamento && usuarioTemModalidadeAtiva;

  const algumFilhoPago =
    usuario.filhos?.some(
      (filho) =>
        filho.pagamento &&
        filho.modalidades?.some((m) => m && m.ativo !== false),
    ) ?? false;

  return usuarioPago || algumFilhoPago;
}

function verificaStatusAguardando(
  usuario: UsuarioCompleto,
  usuarioTemModalidadeAtiva: boolean,
): boolean {
  const usuarioAguardando =
    !usuario.pagamento && usuario.avisoPagamento && usuarioTemModalidadeAtiva;

  const algumFilhoAguardando =
    usuario.filhos?.some(
      (filho) =>
        !filho.pagamento &&
        filho.avisoPagamento &&
        filho.modalidades?.some((m) => m && m.ativo !== false),
    ) ?? false;

  return usuarioAguardando || algumFilhoAguardando;
}

function verificaStatusPendentes(
  usuario: UsuarioCompleto,
  usuarioTemModalidadeAtiva: boolean,
): boolean {
  const usuarioPendente =
    !usuario.pagamento && !usuario.avisoPagamento && usuarioTemModalidadeAtiva;

  const algumFilhoPendente =
    usuario.filhos?.some(
      (filho) =>
        !filho.pagamento &&
        !filho.avisoPagamento &&
        filho.modalidades?.some((m) => m && m.ativo !== false),
    ) ?? false;

  return usuarioPendente || algumFilhoPendente;
}
