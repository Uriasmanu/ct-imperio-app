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

export interface  Pedido {
    id: string;
    pessoa: string;
    itens: {
        nome: string;
        quantidade: number;
        tamanho?: string;
        precoUnitario: number;
        subtotal: number;
    }[];
    data: string;
    pago: boolean;
    total: number;
    observacoes?: string;
    status: 'pendente' | 'reservado' | 'entregue';
}