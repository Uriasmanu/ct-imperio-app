export interface ItemEstoque {
  id: string;
  nome: string;
  quantidade: number;
  tamanhos: { [key: string]: number };
  preco: number;
}

export interface ItemPedido {
  itemId: string;
  nome: string;
  quantidade: number;
  tamanho?: string;
  precoUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: string;
  pessoa: string;
  itens: ItemPedido[];
  data: string;
  dataTimestamp: any;
  pago: boolean;
  total: number;
  observacoes?: string;
  createdAt?: any;
  updatedAt?: any;
}