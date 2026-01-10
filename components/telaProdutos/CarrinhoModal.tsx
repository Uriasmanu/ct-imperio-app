// components/CarrinhoModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// TIPOS (também podem ser movidos para um arquivo types.ts)
export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  disponivel: boolean;
  imagem?: string;
  cores?: string[];
  tamanhos?: string[];
  estoque?: number;
}

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  tamanhoSelecionado?: string;
  corSelecionada?: string;
  subtotal: number;
}

export interface CarrinhoModalProps {
  visible: boolean;
  itens: ItemCarrinho[];
  total: number;
  onFechar: () => void;
  onAumentarQuantidade: (index: number) => void;
  onDiminuirQuantidade: (index: number) => void;
  onRemoverItem: (index: number) => void;
  onFinalizarCompra: () => void;
}

// COMPONENTE DE ITEM DO CARRINHO (interno ao modal)
interface ItemCarrinhoComponentProps {
  item: ItemCarrinho;
  onAumentarQuantidade: () => void;
  onDiminuirQuantidade: () => void;
  onRemover: () => void;
}

function ItemCarrinhoComponent({ 
  item, 
  onAumentarQuantidade, 
  onDiminuirQuantidade, 
  onRemover 
}: ItemCarrinhoComponentProps) {
  return (
    <View style={styles.itemCarrinhoCard}>
      <Image 
        source={{ uri: item.produto.imagem }} 
        style={styles.itemCarrinhoImagem}
        resizeMode="cover"
      />
      
      <View style={styles.itemCarrinhoInfo}>
        <View style={styles.itemCarrinhoHeader}>
          <Text style={styles.itemCarrinhoNome} numberOfLines={2}>
            {item.produto.nome}
          </Text>
          <TouchableOpacity onPress={onRemover} style={styles.itemCarrinhoRemover}>
            <Ionicons name="close-circle" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
        
        {(item.tamanhoSelecionado || item.corSelecionada) && (
          <View style={styles.itemCarrinhoVariacoes}>
            {item.tamanhoSelecionado && (
              <Text style={styles.itemCarrinhoVariacao}>
                Tamanho: {item.tamanhoSelecionado}
              </Text>
            )}
            {item.corSelecionada && (
              <Text style={styles.itemCarrinhoVariacao}>
                Cor: {item.corSelecionada}
              </Text>
            )}
          </View>
        )}
        
        <View style={styles.itemCarrinhoControles}>
          <View style={styles.quantidadeContainer}>
            <TouchableOpacity 
              onPress={onDiminuirQuantidade} 
              style={styles.quantidadeBotao}
              disabled={item.quantidade <= 1}
            >
              <Ionicons name="remove" size={16} color={item.quantidade <= 1 ? "#666" : "#FFF"} />
            </TouchableOpacity>
            
            <Text style={styles.quantidadeTexto}>{item.quantidade}</Text>
            
            <TouchableOpacity 
              onPress={onAumentarQuantidade} 
              style={styles.quantidadeBotao}
            >
              <Ionicons name="add" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.itemCarrinhoSubtotal}>
            R$ {item.subtotal.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}

// COMPONENTE PRINCIPAL DO MODAL
export function CarrinhoModal({ 
  visible, 
  itens, 
  total,
  onFechar,
  onAumentarQuantidade,
  onDiminuirQuantidade,
  onRemoverItem,
  onFinalizarCompra
}: CarrinhoModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onFechar}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* HEADER DO MODAL */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seu Carrinho</Text>
            <TouchableOpacity onPress={onFechar} style={styles.modalFechar}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          {/* CONTEÚDO DO CARRINHO */}
          {itens.length > 0 ? (
            <>
              <ScrollView style={styles.carrinhoLista}>
                {itens.map((item, index) => (
                  <ItemCarrinhoComponent
                    key={index}
                    item={item}
                    onAumentarQuantidade={() => onAumentarQuantidade(index)}
                    onDiminuirQuantidade={() => onDiminuirQuantidade(index)}
                    onRemover={() => onRemoverItem(index)}
                  />
                ))}
              </ScrollView>
              
              {/* RESUMO DO PEDIDO */}
              <View style={styles.resumoContainer}>
                <View style={styles.resumoItem}>
                  <Text style={styles.resumoLabel}>Subtotal</Text>
                  <Text style={styles.resumoValor}>R$ {total.toFixed(2)}</Text>
                </View>
                <View style={styles.resumoItem}>
                  <Text style={styles.resumoLabel}>Frete</Text>
                  <Text style={styles.resumoValor}>R$ 15,00</Text>
                </View>
                <View style={styles.resumoDivider} />
                <View style={styles.resumoItem}>
                  <Text style={styles.resumoTotalLabel}>Total</Text>
                  <Text style={styles.resumoTotalValor}>
                    R$ {(total + 15).toFixed(2)}
                  </Text>
                </View>
                
                {/* BOTÃO FINALIZAR */}
                <TouchableOpacity 
                  style={styles.botaoFinalizar}
                  onPress={onFinalizarCompra}
                >
                  <Ionicons name="card" size={20} color="#FFF" />
                  <Text style={styles.botaoFinalizarTexto}>Finalizar Compra</Text>
                </TouchableOpacity>
                
                {/* CONTINUAR COMPRANDO */}
                <TouchableOpacity 
                  style={styles.botaoContinuar}
                  onPress={onFechar}
                >
                  <Text style={styles.botaoContinuarTexto}>Continuar Comprando</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.carrinhoVazio}>
              <Ionicons name="cart-outline" size={64} color="#666" />
              <Text style={styles.carrinhoVazioTitle}>Seu carrinho está vazio</Text>
              <Text style={styles.carrinhoVazioText}>
                Adicione produtos para ver eles aqui
              </Text>
              <TouchableOpacity 
                style={styles.botaoContinuarComprando}
                onPress={onFechar}
              >
                <Text style={styles.botaoContinuarComprandoTexto}>
                  Ver Produtos
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#000',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#333',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalFechar: {
    padding: 4,
  },
  carrinhoLista: {
    maxHeight: 400,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  itemCarrinhoCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  itemCarrinhoImagem: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  itemCarrinhoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemCarrinhoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemCarrinhoNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
    marginRight: 8,
  },
  itemCarrinhoRemover: {
    padding: 2,
  },
  itemCarrinhoVariacoes: {
    gap: 4,
    marginBottom: 8,
  },
  itemCarrinhoVariacao: {
    fontSize: 12,
    color: '#888',
  },
  itemCarrinhoControles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantidadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantidadeBotao: {
    padding: 4,
  },
  quantidadeTexto: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  itemCarrinhoSubtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B8860B',
  },
  resumoContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  resumoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resumoLabel: {
    fontSize: 14,
    color: '#AAA',
  },
  resumoValor: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
  },
  resumoDivider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 12,
  },
  resumoTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  resumoTotalValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B8860B',
  },
  botaoFinalizar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#B8860B',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  botaoFinalizarTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  botaoContinuar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  botaoContinuarTexto: {
    color: '#AAA',
    fontSize: 14,
    fontWeight: '500',
  },
  carrinhoVazio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  carrinhoVazioTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  carrinhoVazioText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  botaoContinuarComprando: {
    backgroundColor: '#B8860B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  botaoContinuarComprandoTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});