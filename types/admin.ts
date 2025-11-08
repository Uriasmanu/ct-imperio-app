import { Usuario } from "./usuarios";

export interface UsuarioCompleto extends Usuario {
  id: string;
}

export interface FiltrosState {
  busca: string;
  statusPagamento: "todos" | "pagos" | "pendentes";
  modalidade: "todas" | "Muay Thai" | "Jiu-Jitsu" | "Boxe" | "MMA";
}