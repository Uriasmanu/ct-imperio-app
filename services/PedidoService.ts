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

export const pedidoService = {
  // Criar pedido
  async criarPedido(pedido: Omit<Pedido, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "pedidos"), {
        ...pedido,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
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
      await this.atualizarPedido(id, { pago: true });
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
          pessoa: data.pessoa,
          itens: data.itens || [],
          data: data.data,
          dataTimestamp: data.dataTimestamp,
          pago: data.pago || false,
          total: data.total || 0,
          observacoes: data.observacoes || ''
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