// src/types/usuarios.ts

import { GraduacaoJiuJitsu, GraduacaoMuayThai } from "./graduacoes";

export interface Filho {
  id: string;
  nome: string;
  modalidade: "Muay Thai" | "Jiu-Jitsu"; 
  graduacao?: GraduacaoMuayThai | GraduacaoJiuJitsu;
  observacao?: string;
  dataDeRegistro: string;
}

export interface Usuario {
  id: string;
  nome: string;
  modalidade: "Muay Thai" | "Jiu-Jitsu"; 
  graduacao?: GraduacaoMuayThai | GraduacaoJiuJitsu;
  observacao?: string;
  email: string;
  telefone: string;
  dataDeRegistro: string;
  filhos?: Filho[]; 
}
export { GraduacaoJiuJitsu, GraduacaoMuayThai };

