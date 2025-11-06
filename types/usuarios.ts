// src/types/usuarios.ts

import { GraduacaoJiuJitsu, GraduacaoMuayThai } from "./graduacoes";

export interface Filho {
  id: string;
  nome: string;
  modalidade: "Muay Thai" | "Jiu-Jitsu" | "Boxe" | "MMA";
  graduacao?: GraduacaoMuayThai | GraduacaoJiuJitsu;
  observacao?: string;
  dataDeRegistro: string;
  pagamento: boolean;
  avisoPagamento: boolean;
  idade?: number;
  dataPagamento: string;
  dataUltimoPagamento: string;
}

export interface Usuario {
  id: string;
  nome: string;
  modalidade: "Muay Thai" | "Jiu-Jitsu" | "Boxe" | "MMA";
  graduacao?: GraduacaoMuayThai | GraduacaoJiuJitsu;
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
}
export { GraduacaoJiuJitsu, GraduacaoMuayThai };

