// src/types/usuarios.ts

import { GraduacaoJiuJitsu, GraduacaoMuayThai } from "./graduacoes";

export interface ModalidadeAluno {
  modalidade: "Muay Thai" | "Jiu-Jitsu" | "Boxe" | "MMA";
  graduacao?: GraduacaoMuayThai | GraduacaoJiuJitsu;
  dataInicio: string;
  ativo: boolean;
}

export interface PresencaRecord {
  date: string; 
  confirmada: boolean;
}

export interface CalendarDay {
  day: number | null;
  isCurrentMonth: boolean;
  isAttended: boolean;
  isToday: boolean;
  date: Date | null; 
}

export interface Filho {
  id: string;
  nome: string;
  modalidades: ModalidadeAluno[];
  observacao?: string;
  dataDeRegistro: string;
  pagamento: boolean;
  avisoPagamento: boolean;
  idade?: number;
  dataPagamento: string;
  dataUltimoPagamento: string;
  avisaPresenca?: string[];
}

export interface Usuario {
  id: string;
  nome: string;
  modalidades: ModalidadeAluno[];
  observacao?: string;
  email: string;
  telefone: string;
  dataDeRegistro: string;
  filhos?: Filho[];
  admin: boolean;
  pagamento: boolean;
  avisoPagamento: boolean;
  dataPagamento: string;
  dataUltimoPagamento: string;
  avisaPresenca?: string[];
}

export { GraduacaoJiuJitsu, GraduacaoMuayThai };

