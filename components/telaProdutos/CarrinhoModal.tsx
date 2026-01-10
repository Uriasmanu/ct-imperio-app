// components/CarrinhoModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// TIPOS
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
  onReservar: () => void;
  observacoes?: string;
  onObservacoesChange?: (text: string) => void;
}

// COMPONENTE DE ITEM DO CARRINHO
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
  onReservar,
  observacoes = '',
  onObservacoesChange
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
            <Text style={styles.modalTitle}>Carrinho de Reservas</Text>
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
                  <Text style={styles.resumoLabel}>Total de Itens</Text>
                  <Text style={styles.resumoValor}>{itens.length}</Text>
                </View>
                
                <View style={styles.resumoItem}>
                  <Text style={styles.resumoLabel}>Valor Total</Text>
                  <Text style={styles.resumoValor}>R$ {total.toFixed(2)}</Text>
                </View>
                
                {/* OBSERVAÇÕES */}
                <View style={styles.observacoesContainer}>
                  <Text style={styles.observacoesLabel}>Observações (opcional)</Text>
                  <View style={styles.observacoesInputContainer}>
                    <Ionicons name="document-text-outline" size={16} color="#888" />
                    {onObservacoesChange ? (
                      <TextInput
                        style={styles.observacoesInput}
                        placeholder="Ex: Retirar na academia, cor preferida..."
                        placeholderTextColor="#666"
                        value={observacoes}
                        onChangeText={onObservacoesChange}
                        multiline
                        maxLength={200}
                      />
                    ) : (
                      <Text style={styles.observacoesTexto}>
                        {observacoes || 'Nenhuma observação'}
                      </Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.resumoDivider} />
                
                {/* STATUS DA RESERVA */}
                <View style={styles.statusReservaContainer}>
                  <View style={styles.statusIconContainer}>
                    <Ionicons name="time-outline" size={20} color="#B8860B" />
                  </View>
                  <View style={styles.statusInfo}>
                    <Text style={styles.statusTitle}>Reserva Pendente</Text>
                    <Text style={styles.statusText}>
                      Itens serão reservados no estoque até a confirmação do pagamento
                    </Text>
                  </View>
                </View>
                
                {/* BOTÕES DE AÇÃO */}
                <View style={styles.botoesContainer}>
                  <TouchableOpacity 
                    style={styles.botaoReservar}
                    onPress={onReservar}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                    <Text style={styles.botaoReservarTexto}>Reservar Itens</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.botaoContinuar}
                    onPress={onFechar}
                  >
                    <Text style={styles.botaoContinuarTexto}>Continuar Comprando</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.carrinhoVazio}>
              <Ionicons name="cart-outline" size={64} color="#666" />
              <Text style={styles.carrinhoVazioTitle}>Seu carrinho está vazio</Text>
              <Text style={styles.carrinhoVazioText}>
                Adicione produtos para reservá-los
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
    maxHeight: '90%',
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
    color: '#B8860B',
  },
  modalFechar: {
    padding: 4,
  },
  carrinhoLista: {
    maxHeight: 350,
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
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  resumoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resumoLabel: {
    fontSize: 14,
    color: '#AAA',
    fontWeight: '500',
  },
  resumoValor: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  observacoesContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  observacoesLabel: {
    fontSize: 14,
    color: '#AAA',
    fontWeight: '500',
    marginBottom: 8,
  },
  observacoesInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  observacoesInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  observacoesTexto: {
    flex: 1,
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
  },
  resumoDivider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 16,
  },
  statusReservaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(184, 134, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#B8860B',
    marginBottom: 20,
  },
  statusIconContainer: {
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B8860B',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#AAA',
    lineHeight: 16,
  },
  botoesContainer: {
    gap: 12,
  },
  botaoReservar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#B8860B',
    paddingVertical: 16,
    borderRadius: 12,
  },
  botaoReservarTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  botaoContinuar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
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