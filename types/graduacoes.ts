export interface GraduacaoMuayThai {
  cor: string;
  pontaBranca?: boolean;
}

export const graduaçõesMuayThai: GraduacaoMuayThai[] = [
  { cor: "Banco" },
  { cor: "Amarelo" },
  { cor: "Amarelo", pontaBranca: true },
  { cor: "Verde" },
  { cor: "Verde", pontaBranca: true },
  { cor: "Azul" },
  { cor: "Azul", pontaBranca: true },
  { cor: "Marrom" },
  { cor: "Marrom", pontaBranca: true },
  { cor: "Vermelho" },
  { cor: "Vermelho", pontaBranca: true },
  { cor: "Preto" },
];

export interface GraduacaoJiuJitsu {
  cor: string;
  faixa?: string;
  grau?: 0 | 1 | 2 | 3 | 4;
}

export const graduaçõesJiuJitsu: GraduacaoJiuJitsu[] = [
  { cor: "Branca", grau: 0 },
  { cor: "Branca", grau: 1 },
  { cor: "Branca", grau: 2 },
  { cor: "Branca", grau: 3 },
  { cor: "Branca", grau: 4 },
  { cor: "Azul", grau: 0 },
  { cor: "Azul", grau: 1 },
  { cor: "Azul", grau: 2 },
  { cor: "Azul", grau: 3 },
  { cor: "Azul", grau: 4 },
  { cor: "Roxa", grau: 0 },
  { cor: "Roxa", grau: 1 },
  { cor: "Roxa", grau: 2 },
  { cor: "Roxa", grau: 3 },
  { cor: "Roxa", grau: 4 },
  { cor: "Marrom", grau: 0 },
  { cor: "Marrom", grau: 1 },
  { cor: "Marrom", grau: 2 },
  { cor: "Marrom", grau: 3 },
  { cor: "Marrom", grau: 4 },
  { cor: "Preta", grau: 0 },
  { cor: "Preta", grau: 1 },
  { cor: "Preta", grau: 2 },
  { cor: "Preta", grau: 3 },
  { cor: "Preta", grau: 4 },
];
