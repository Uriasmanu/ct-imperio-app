import { auth } from '@/config/firebaseConfig';
import { pedidoService } from '@/services/PedidoService';
import { ItemEstoque, Pedido } from '@/types/estoque';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export interface Produto {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  imagem?: string;
  tamanhos?: string[];
  estoque?: number;
}

export interface ItemCarrinho {
  produto: ItemEstoque;
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
  onReservar?: () => void; 
  observacoes?: string;
  onObservacoesChange?: (text: string) => void;
  usuarioNome?: string; 
  usuarioId?: string;   
}

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
  onObservacoesChange,
  usuarioNome = 'Cliente', 
  usuarioId = ''           
}: CarrinhoModalProps) {
  const [loading, setLoading] = useState(false);
  const [pedidoCriado, setPedidoCriado] = useState(false);
  const [pedidoId, setPedidoId] = useState('');

  const criarPedido = async () => {
    if (itens.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione itens ao carrinho antes de reservar.');
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert('Não autenticado', 'Por favor, faça login para criar um pedido.');
      return;
    }

    const usuarioId = currentUser.uid;
    const usuarioNome = currentUser.displayName || currentUser.email?.split('@')[0] || 'Cliente';

    setLoading(true);

    try {
      const itensPedido = itens.map(item => ({
        itemId: item.produto.id,
        nome: item.produto.nome,
        quantidade: item.quantidade,
        tamanho: item.tamanhoSelecionado,
        precoUnitario: item.produto.preco,
        subtotal: item.subtotal
      }));

      const pedido: Omit<Pedido, 'id'> = {
        usuarioId: usuarioId, 
        pessoa: usuarioNome,  
        itens: itensPedido,
        data: new Date().toLocaleDateString('pt-BR'),
        dataTimestamp: Date.now(),
        pago: false,
        status: 'reservado',
        total: total,
        observacoes: observacoes.trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const idCriado = await pedidoService.criarPedido(pedido);
      setPedidoId(idCriado);
      setPedidoCriado(true);

      if (onReservar) {
        onReservar();
      }

    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      Alert.alert(
        'Erro',
        `Não foi possível criar o pedido: ${error.message || 'Erro desconhecido'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const visualizarPedido = () => {
    Alert.alert(
      'Detalhes do Pedido',
      `Pedido #${pedidoId}\n\n` +
      `Cliente: ${usuarioNome}\n` +
      `Data: ${new Date().toLocaleDateString('pt-BR')}\n` +
      `Total: R$ ${total.toFixed(2)}\n` +
      `Status: Reservado\n` +
      `Observações: ${observacoes || 'Nenhuma'}`,
      [{ text: 'OK' }]
    );
  };

  const handleFechar = () => {
    setPedidoCriado(false);
    setPedidoId('');
    onFechar();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleFechar}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderTitleContainer}>
              <Ionicons name="cart" size={24} color="#FFF" />
              <Text style={styles.modalTitle}>
                {pedidoCriado ? 'Reserva Confirmada!' : 'Carrinho de Reservas'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleFechar} style={styles.modalFechar}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {pedidoCriado ? (
            <View style={styles.confirmacaoContainer}>
              <View style={styles.confirmacaoIconContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#22C55E" />
              </View>

              <Text style={styles.confirmacaoTitle}>Reserva Realizada com Sucesso!</Text>

              <View style={styles.pedidoInfoContainer}>
                <View style={styles.pedidoInfoItem}>
                  <Ionicons name="receipt" size={20} color="#B8860B" />
                  <Text style={styles.pedidoInfoLabel}>Número do Pedido:</Text>
                  <Text style={styles.pedidoInfoValue}>#{pedidoId}</Text>
                </View>

                <View style={styles.pedidoInfoItem}>
                  <Ionicons name="person" size={20} color="#B8860B" />
                  <Text style={styles.pedidoInfoLabel}>Cliente:</Text>
                  <Text style={styles.pedidoInfoValue}>{usuarioNome}</Text>
                </View>

                <View style={styles.pedidoInfoItem}>
                  <Ionicons name="calendar" size={20} color="#B8860B" />
                  <Text style={styles.pedidoInfoLabel}>Data:</Text>
                  <Text style={styles.pedidoInfoValue}>{new Date().toLocaleDateString('pt-BR')}</Text>
                </View>

                <View style={styles.pedidoInfoItem}>
                  <Ionicons name="cash" size={20} color="#B8860B" />
                  <Text style={styles.pedidoInfoLabel}>Total:</Text>
                  <Text style={styles.pedidoInfoValue}>R$ {total.toFixed(2)}</Text>
                </View>

                <View style={styles.pedidoInfoItem}>
                  <Ionicons name="time" size={20} color="#B8860B" />
                  <Text style={styles.pedidoInfoLabel}>Status:</Text>
                  <Text style={[styles.pedidoInfoValue, styles.statusReservado]}>Reservado</Text>
                </View>
              </View>

              {observacoes && (
                <View style={styles.observacoesConfirmacaoContainer}>
                  <Text style={styles.observacoesConfirmacaoLabel}>Observações:</Text>
                  <Text style={styles.observacoesConfirmacaoText}>{observacoes}</Text>
                </View>
              )}

              <View style={styles.botoesConfirmacaoContainer}>
                <TouchableOpacity
                  style={styles.botaoVisualizarPedido}
                  onPress={visualizarPedido}
                >
                  <Ionicons name="eye" size={20} color="#FFF" />
                  <Text style={styles.botaoVisualizarPedidoTexto}>Ver Detalhes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botaoNovoPedido}
                  onPress={() => {
                    setPedidoCriado(false);
                    setPedidoId('');
                    onFechar();
                  }}
                >
                  <Ionicons name="add-circle" size={20} color="#B8860B" />
                  <Text style={styles.botaoNovoPedidoTexto}>Novo Pedido</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : itens.length > 0 ? (
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
              <View style={styles.resumoContainer}>
                <View style={styles.resumoItem}>
                  <Text style={styles.resumoLabel}>Total de Itens</Text>
                  <Text style={styles.resumoValor}>
                    {itens.reduce((total, item) => total + item.quantidade, 0)}
                  </Text>
                </View>

                <View style={styles.resumoItem}>
                  <Text style={styles.resumoLabel}>Valor Total</Text>
                  <Text style={styles.resumoValor}>R$ {total.toFixed(2)}</Text>
                </View>      
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
                <View style={styles.botoesContainer}>
                  <TouchableOpacity
                    style={[styles.botaoReservar, loading && styles.botaoReservarDisabled]}
                    onPress={criarPedido}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                        <Text style={styles.botaoReservarTexto}>
                          Confirmar Reserva
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.botaoContinuar}
                    onPress={handleFechar}
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
                onPress={handleFechar}
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalHeaderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalFechar: {
    padding: 4,
  },
  carrinhoLista: {
    maxHeight: 300,
  },
  itemCarrinhoCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  itemCarrinhoImagem: {
    width: 80,
    height: 80,
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
  },
  itemCarrinhoNome: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginRight: 8,
  },
  itemCarrinhoRemover: {
    padding: 4,
  },
  itemCarrinhoVariacoes: {
    marginTop: 4,
  },
  itemCarrinhoVariacao: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 2,
  },
  itemCarrinhoControles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  quantidadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantidadeBotao: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 16,
    backgroundColor: '#1a1a1a',
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
  },
  resumoValor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  clienteInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  clienteInfoText: {
    fontSize: 14,
    color: '#B8860B',
    fontWeight: '500',
  },
  observacoesContainer: {
    marginBottom: 16,
  },
  observacoesLabel: {
    fontSize: 14,
    color: '#AAA',
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
    paddingVertical: 8,
    gap: 8,
  },
  observacoesInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    minHeight: 40,
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
    backgroundColor: '#2a1a00',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statusIconContainer: {
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
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
    backgroundColor: '#B8860B',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  botaoReservarDisabled: {
    opacity: 0.7,
  },
  botaoReservarTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoContinuar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    paddingVertical: 16,
    borderRadius: 8,
  },
  botaoContinuarTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
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
  
  confirmacaoContainer: {
    padding: 20,
    alignItems: 'center',
  },
  confirmacaoIconContainer: {
    marginBottom: 20,
  },
  confirmacaoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  pedidoInfoContainer: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  pedidoInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  pedidoInfoLabel: {
    fontSize: 14,
    color: '#AAA',
    marginLeft: 8,
  },
  pedidoInfoValue: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 'auto',
  },
  statusReservado: {
    color: '#B8860B',
  },
  observacoesConfirmacaoContainer: {
    width: '100%',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  observacoesConfirmacaoLabel: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: 4,
  },
  observacoesConfirmacaoText: {
    fontSize: 14,
    color: '#FFF',
    lineHeight: 20,
  },
  botoesConfirmacaoContainer: {
    width: '100%',
    gap: 12,
  },
  botaoVisualizarPedido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B8860B',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  botaoVisualizarPedidoTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoNovoPedido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B8860B',
    gap: 8,
  },
  botaoNovoPedidoTexto: {
    color: '#B8860B',
    fontSize: 16,
    fontWeight: '600',
  },
});