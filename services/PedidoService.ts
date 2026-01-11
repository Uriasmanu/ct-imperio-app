// services/PedidoService.ts
import { db } from "@/config/firebaseConfig";
import { Pedido } from "@/types/estoque";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import { estoqueService } from "./estoqueService";

export const pedidoService = {
  // Criar pedido
  async criarPedido(pedido: Omit<Pedido, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "pedidos"), {
      ...pedido,
      usuarioId: pedido.usuarioId ?? "",
      status: pedido.status ?? 'pendente',
      pago: pedido.pago ?? false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return docRef.id;
  },

  // Buscar todos os pedidos
  async getPedidos(): Promise<Pedido[]> {
    try {
      const pedidosRef = collection(db, "pedidos");
      const q = query(pedidosRef, orderBy("dataTimestamp", "desc"));
      const querySnapshot = await getDocs(q);

      const pedidos: Pedido[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        pedidos.push({
          id: doc.id,
          usuarioId: data.usuarioId,
          pessoa: data.pessoa,
          itens: data.itens || [],
          data: data.data,
          dataTimestamp: data.dataTimestamp,
          pago: data.pago || false,
          total: data.total || 0,
          observacoes: data.observacoes || '',
          status: data.status || 'pendente',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        } as Pedido);

      });

      return pedidos;
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      throw error;
    }
  },

  // Buscar pedidos por status
  async getPedidosPorStatus(pago: boolean): Promise<Pedido[]> {
    try {
      const pedidosRef = collection(db, "pedidos");
      const q = query(
        pedidosRef,
        where("pago", "==", pago),
        orderBy("dataTimestamp", "desc")
      );
      const querySnapshot = await getDocs(q);

      const pedidos: Pedido[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        pedidos.push({
          id: doc.id,
          pessoa: data.pessoa,
          itens: data.itens || [],
          data: data.data,
          dataTimestamp: data.dataTimestamp,
          pago: data.pago || false,
          total: data.total || 0,
          observacoes: data.observacoes || ''
        } as Pedido);
      });

      return pedidos;
    } catch (error) {
      console.error('Erro ao buscar pedidos por status:', error);
      throw error;
    }
  },

  // Atualizar pedido
  async atualizarPedido(id: string, pedido: Partial<Pedido>): Promise<void> {
    try {
      const pedidoRef = doc(db, "pedidos", id);
      await updateDoc(pedidoRef, {
        ...pedido,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      throw error;
    }
  },

  // Marcar como pago
  async marcarComoPago(id: string): Promise<void> {
    try {
      const pedido = await this.getPedidoById(id);

      if (!pedido) {
        throw new Error('Pedido não encontrado');
      }

      if (pedido.pago) return;

      for (const item of pedido.itens) {
        if (!item.itemId) continue;

        const produto = await estoqueService.getProdutoById(item.itemId);
        if (!produto) continue;

        if (item.tamanho && produto.tamanhos[item.tamanho] !== undefined) {
          await estoqueService.atualizarEstoque(
            item.itemId,
            item.tamanho,
            item.quantidade,
            'remover'
          );
        } else {
          const tamanhos = { ...produto.tamanhos };
          const tamanhoFallback = Object.keys(tamanhos)[0];
          if (!tamanhoFallback) continue;

          tamanhos[tamanhoFallback] = Math.max(
            0,
            tamanhos[tamanhoFallback] - item.quantidade
          );

          const novaQuantidade = Object.values(tamanhos).reduce(
            (total, qtd) => total + qtd,
            0
          );

          await estoqueService.updateProduto(item.itemId, {
            tamanhos,
            quantidade: novaQuantidade
          });
        }
      }

      await this.atualizarPedido(id, { pago: true, status: 'pago' });


    } catch (error) {
      console.error('Erro ao marcar pedido como pago:', error);
      throw error;
    }
  },


  // Deletar pedido
  async deletarPedido(id: string): Promise<void> {
    try {
      const pedidoRef = doc(db, "pedidos", id);
      await deleteDoc(pedidoRef);
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      throw error;
    }
  },

  async getPedidosPorUsuario(usuarioId: string): Promise<Pedido[]> {
    try {
      if (!usuarioId) {
        console.warn('ID do usuário não fornecido');
        return [];
      }

      const pedidosRef = collection(db, "pedidos");
      const q = query(
        pedidosRef,
        where("usuarioId", "==", usuarioId),
        orderBy("dataTimestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      const pedidos: Pedido[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        pedidos.push({
          id: doc.id,
          usuarioId: data.usuarioId,
          pessoa: data.pessoa,
          itens: data.itens || [],
          data: data.data,
          dataTimestamp: data.dataTimestamp,
          pago: data.pago || false,
          total: data.total || 0,
          observacoes: data.observacoes || '',
          status: data.status || 'pendente',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        } as Pedido);
      });

      return pedidos;
    } catch (error) {
      console.error('Erro ao buscar pedidos do usuário:', error);
      throw error;
    }
  },

  // Buscar pedido por ID
  async getPedidoById(id: string): Promise<Pedido | null> {
    try {
      const { getDoc } = await import('firebase/firestore');
      const pedidoRef = doc(db, "pedidos", id);
      const pedidoSnap = await getDoc(pedidoRef);

      if (pedidoSnap.exists()) {
        const data = pedidoSnap.data();
        return {
          id: pedidoSnap.id,
          usuarioId: data.usuarioId,
          pessoa: data.pessoa,
          itens: data.itens || [],
          data: data.data,
          dataTimestamp: data.dataTimestamp,
          pago: data.pago || false,
          total: data.total || 0,
          observacoes: data.observacoes || '',
          status: data.status || 'pendente',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        } as Pedido;

      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      throw error;
    }
  }
};