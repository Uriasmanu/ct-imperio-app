export interface ItemEstoque {
  id: string;
  nome: string;
  imagem?: string;
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
  usuarioId?: string;
  pessoa?: string;
  itens: ItemPedido[];
  data: string;
  dataTimestamp: number;
  pago: boolean;
  total: number;
  observacoes?: string;
  status: 'pendente' | 'reservado' | 'entregue';
  createdAt?: Date;
  updatedAt?: Date;
}
