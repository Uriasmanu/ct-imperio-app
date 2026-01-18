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
  tipo: "usuario" | "filho";
}

export interface PresencaStats {
  totalParaConfirmar: number;
  confirmadasHoje: number;
  pendentesHoje: number;
}

export interface UsuarioCompleto extends Usuario {
  id: string;
  professor?: string;
}

export interface FiltrosState {
  busca: string;
  statusPagamento: "todos" | "pagos" | "aguardando" | "pendentes";
  modalidade: "todas" | "Muay Thai" | "Jiu-Jitsu" | "Boxe" | "MMA";
  professor: "todos" | string;
}

export interface Professor {
  id: string;
  nome: string;
  email: string;
}

export const professores: Professor[] = [
  { id: "1", nome: "Mestre Will", email: "will@academia.com" },
  { id: "2", nome: "Instrutor Rui", email: "rui@academia.com" },
  {
    id: "3",
    nome: "Instrutor Gustavo (Jagunço)",
    email: "gustavo@academia.com",
  },
  { id: "4", nome: "Instrutora Aline", email: "aline@academia.com" },
];
