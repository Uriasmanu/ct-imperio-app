import { Usuario } from "./usuarios";

export interface PresencaParaConfirmar {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  filhoId?: string;
  filhoNome?: string;
  data: string;
  modalidades: string[];
  confirmada: boolean;
  tipo: 'usuario' | 'filho';
}

export interface PresencaStats {
  totalParaConfirmar: number;
  confirmadasHoje: number;
  pendentesHoje: number;
}

export interface UsuarioCompleto extends Usuario {
  id: string;
}

export interface FiltrosState {
  busca: string;
  statusPagamento: "todos" | "pagos" | "pendentes";
  modalidade: "todas" | "Muay Thai" | "Jiu-Jitsu" | "Boxe" | "MMA";
}