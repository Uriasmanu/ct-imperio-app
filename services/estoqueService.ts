// services/firebaseEstoqueService.ts
import { db } from '@/config/firebaseConfig';
import { ItemEstoque } from '@/types/estoque';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where
} from 'firebase/firestore';

export const estoqueService = {
  // Buscar todos os produtos
  async getProdutos(): Promise<ItemEstoque[]> {
    try {
      const produtosRef = collection(db, 'estoque');
      const q = query(produtosRef, orderBy('nome'));
      const querySnapshot = await getDocs(q);
      
      const produtos: ItemEstoque[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        produtos.push({
          id: doc.id,
          nome: data.nome,
          quantidade: data.quantidade,
          tamanhos: data.tamanhos || {},
          preco: data.preco,
          imagem: data.imagem || ''
        } as ItemEstoque);
      });
      
      return produtos;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  },

  // Buscar produto por ID
  async getProdutoById(id: string): Promise<ItemEstoque | null> {
    try {
      const produtoRef = doc(db, 'estoque', id);
      const produtoSnap = await getDoc(produtoRef);
      
      if (produtoSnap.exists()) {
        const data = produtoSnap.data();
        return {
          id: produtoSnap.id,
          nome: data.nome,
          quantidade: data.quantidade,
          tamanhos: data.tamanhos || {},
          preco: data.preco,
          imagem: data.imagem || ''
        } as ItemEstoque;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  },


  // Adicionar novo produto (função única - removida a duplicata)
  async addProduto(produto: Omit<ItemEstoque, 'id'>): Promise<string> {
    try {
      // Validar dados antes de salvar
      const produtoValidado = this.validarProduto(produto);
      
      const docRef = await addDoc(collection(db, 'estoque'), {
        ...produtoValidado,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      throw error;
    }
  },

  // Atualizar produto
  async updateProduto(id: string, produto: Partial<ItemEstoque>): Promise<void> {
    try {
      const produtoRef = doc(db, 'estoque', id);
      
      await updateDoc(produtoRef, {
        ...produto,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },

  // Deletar produto
  async deleteProduto(id: string): Promise<void> {
    try {
      const produtoRef = doc(db, 'estoque', id);
      await deleteDoc(produtoRef);
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  },

  // Buscar produtos por nome
  async searchProdutos(nome: string): Promise<ItemEstoque[]> {
    try {
      const produtosRef = collection(db, 'estoque');
      const q = query(
        produtosRef, 
        where('nome', '>=', nome),
        where('nome', '<=', nome + '\uf8ff')
      );
      
      const querySnapshot = await getDocs(q);
      const produtos: ItemEstoque[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        produtos.push({
          id: doc.id,
          nome: data.nome,
          quantidade: data.quantidade,
          tamanhos: data.tamanhos || {},
          preco: data.preco,
          imagem: data.imagem || ''
        } as ItemEstoque);
      });
      
      return produtos;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  },

  // Atualizar estoque (quantidade total e tamanhos)
  async atualizarEstoque(
    id: string, 
    tamanho: string, 
    quantidade: number, 
    operacao: 'adicionar' | 'remover' = 'adicionar'
  ): Promise<void> {
    try {
      const produto = await this.getProdutoById(id);
      if (!produto) {
        throw new Error('Produto não encontrado');
      }

      const novosTamanhos = { ...produto.tamanhos };
      
      if (operacao === 'adicionar') {
        novosTamanhos[tamanho] = (novosTamanhos[tamanho] || 0) + quantidade;
      } else {
        novosTamanhos[tamanho] = Math.max(0, (novosTamanhos[tamanho] || 0) - quantidade);
      }

      // Calcular nova quantidade total
      const novaQuantidadeTotal = Object.values(novosTamanhos).reduce(
        (total, qtd) => total + qtd, 0
      );

      await this.updateProduto(id, {
        tamanhos: novosTamanhos,
        quantidade: novaQuantidadeTotal
      });
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      throw error;
    }
  },

  // Validar dados do produto
  validarProduto(produto: Omit<ItemEstoque, 'id'>): Omit<ItemEstoque, 'id'> {
    if (!produto.nome || produto.nome.trim() === '') {
      throw new Error('Nome do produto é obrigatório');
    }

    if (produto.preco <= 0) {
      throw new Error('Preço deve ser maior que zero');
    }

    // Validar tamanhos e calcular quantidade total
    const tamanhosValidos = Object.entries(produto.tamanhos || {}).reduce(
      (acc, [tamanho, quantidade]) => {
        if (quantidade >= 0) {
          acc[tamanho] = quantidade;
        }
        return acc;
      }, {} as { [key: string]: number }
    );

    const quantidadeTotal = Object.values(tamanhosValidos).reduce(
      (total, qtd) => total + qtd, 0
    );

    return {
      ...produto,
      nome: produto.nome.trim(),
      tamanhos: tamanhosValidos,
      quantidade: quantidadeTotal,
    };
  }
};