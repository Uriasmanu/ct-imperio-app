// components/ModalVenda.tsx
import { ItemEstoque } from '@/types/estoque';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface ModalVendaProps {
  visible: boolean;
  produto: ItemEstoque | null;
  onClose: () => void;
  onVender: (produtoId: string, tamanho: string, quantidade: number) => Promise<void>;
}

export const ModalVenda: React.FC<ModalVendaProps> = ({
  visible,
  produto,
  onClose,
  onVender
}) => {
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState<{ [tamanho: string]: number }>({});
  const [loading, setLoading] = useState(false);

  const incrementarQuantidade = (tamanho: string) => {
    const quantidadeAtual = quantidadeSelecionada[tamanho] || 0;
    const estoqueDisponivel = produto?.tamanhos[tamanho] || 0;
    
    if (quantidadeAtual < estoqueDisponivel) {
      setQuantidadeSelecionada(prev => ({
        ...prev,
        [tamanho]: quantidadeAtual + 1
      }));
    }
  };

  const decrementarQuantidade = (tamanho: string) => {
    const quantidadeAtual = quantidadeSelecionada[tamanho] || 0;
    if (quantidadeAtual > 0) {
      setQuantidadeSelecionada(prev => ({
        ...prev,
        [tamanho]: quantidadeAtual - 1
      }));
    }
  };

  const handleVender = async () => {
    if (!produto) return;

    // Verificar se há pelo menos um item selecionado
    const itensSelecionados = Object.entries(quantidadeSelecionada)
      .filter(([_, quantidade]) => quantidade > 0);

    if (itensSelecionados.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um item para vender');
      return;
    }

    setLoading(true);
    try {
      // Processar cada tamanho selecionado
      for (const [tamanho, quantidade] of itensSelecionados) {
        await onVender(produto.id, tamanho, quantidade);
      }
      
      Alert.alert('Sucesso', 'Venda registrada com sucesso!');
      setQuantidadeSelecionada({});
      onClose();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível registrar a venda');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotalVenda = () => {
    if (!produto) return 0;
    
    return Object.entries(quantidadeSelecionada).reduce((total, [tamanho, quantidade]) => {
      return total + (produto.preco * quantidade);
    }, 0);
  };

  const totalItensSelecionados = Object.values(quantidadeSelecionada).reduce((total, qtd) => total + qtd, 0);

  if (!produto) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Vender {produto.nome}</Text>
            <TouchableOpacity onPress={onClose} style={styles.botaoFechar}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.conteudo}>
            <View style={styles.infoProduto}>
              <Text style={styles.precoProduto}>R$ {produto.preco.toFixed(2)}</Text>
              <Text style={styles.estoqueTotal}>
                Estoque total: {produto.quantidade} unidades
              </Text>
            </View>

            <Text style={styles.secaoTitulo}>Selecione os tamanhos e quantidades:</Text>

            {Object.entries(produto.tamanhos).map(([tamanho, estoque]) => (
              <View key={tamanho} style={styles.tamanhoItem}>
                <View style={styles.tamanhoInfo}>
                  <Text style={styles.tamanhoNome}>{tamanho}</Text>
                  <Text style={styles.tamanhoEstoque}>
                    Disponível: {estoque}
                  </Text>
                </View>

                <View style={styles.controlesQuantidade}>
                  <TouchableOpacity
                    style={[
                      styles.botaoQuantidade,
                      styles.botaoDecrementar,
                      (quantidadeSelecionada[tamanho] || 0) === 0 && styles.botaoDesabilitado
                    ]}
                    onPress={() => decrementarQuantidade(tamanho)}
                    disabled={(quantidadeSelecionada[tamanho] || 0) === 0}
                  >
                    <Ionicons name="remove" size={16} color="#FFF" />
                  </TouchableOpacity>

                  <Text style={styles.quantidadeTexto}>
                    {quantidadeSelecionada[tamanho] || 0}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.botaoQuantidade,
                      styles.botaoIncrementar,
                      (quantidadeSelecionada[tamanho] || 0) >= estoque && styles.botaoDesabilitado
                    ]}
                    onPress={() => incrementarQuantidade(tamanho)}
                    disabled={(quantidadeSelecionada[tamanho] || 0) >= estoque}
                  >
                    <Ionicons name="add" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.resumoVenda}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalItens}>
                {totalItensSelecionados} item{totalItensSelecionados !== 1 ? 's' : ''} selecionado{totalItensSelecionados !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.totalValor}>
                Total: R$ {calcularTotalVenda().toFixed(2)}
              </Text>
            </View>

            <View style={styles.botoesAcao}>
              <TouchableOpacity
                style={[styles.botao, styles.botaoCancelar]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.botao,
                  styles.botaoVender,
                  totalItensSelecionados === 0 && styles.botaoDesabilitado
                ]}
                onPress={handleVender}
                disabled={loading || totalItensSelecionados === 0}
              >
                {loading ? (
                  <Text style={styles.botaoVenderTexto}>Processando...</Text>
                ) : (
                  <>
                    <Ionicons name="cart" size={18} color="#FFF" />
                    <Text style={styles.botaoVenderTexto}>Confirmar Venda</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B8860B',
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  botaoFechar: {
    padding: 4,
  },
  conteudo: {
    maxHeight: 400,
    padding: 16,
  },
  infoProduto: {
    marginBottom: 20,
  },
  precoProduto: {
    color: '#B8860B',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  estoqueTotal: {
    color: '#888',
    fontSize: 14,
  },
  secaoTitulo: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  tamanhoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tamanhoInfo: {
    flex: 1,
  },
  tamanhoNome: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tamanhoEstoque: {
    color: '#888',
    fontSize: 12,
  },
  controlesQuantidade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  botaoQuantidade: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoDecrementar: {
    backgroundColor: '#EF4444',
  },
  botaoIncrementar: {
    backgroundColor: '#22C55E',
  },
  botaoDesabilitado: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  quantidadeTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  resumoVenda: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    padding: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalItens: {
    color: '#FFF',
    fontSize: 14,
  },
  totalValor: {
    color: '#B8860B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  botoesAcao: {
    flexDirection: 'row',
    gap: 12,
  },
  botao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  botaoCancelar: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
  },
  botaoVender: {
    backgroundColor: '#22C55E',
  },
  botaoCancelarTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  botaoVenderTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});