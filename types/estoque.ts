export interface ItemEstoque {
  id: string;
  nome: string;
  quantidade: number;
  tamanhos: { [key: string]: number };
  preco: number;
}

export interface Pedido {
  id: string;
  pessoa: string;
  itens: { itemId: string; quantidade: number; tamanho?: string }[];
  data: string;
  pago: boolean;
  total: number;
}