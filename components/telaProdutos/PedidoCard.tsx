import { Pedido } from '@/types/estoque';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface PedidoCardProps {
  pedido: Pedido;
  onPress?: () => void;
}

export function PedidoCard({ pedido, onPress }: PedidoCardProps) {
  const getStatusColor = (status: Pedido['status']) => {
    switch (status) {
      case 'pendente': return '#F59E0B';
      case 'reservado': return '#3B82F6';
      case 'entregue': return '#10B981';
      default: return '#888';
    }
  };

  const getStatusIcon = (status: Pedido['status']) => {
    switch (status) {
      case 'pendente': return 'time-outline';
      case 'reservado': return 'checkmark-circle-outline';
      case 'entregue': return 'cube-outline';
      default: return 'help-circle-outline';
    }
  };

  const getStatusText = (status: Pedido['status']) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'reservado': return 'Reservado';
      case 'entregue': return 'Entregue';
      default: return 'Desconhecido';
    }
  };

  return (
    <TouchableOpacity style={styles.pedidoCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.pedidoHeader}>
        <View style={styles.pedidoInfo}>
          <Text style={styles.pedidoId}>Pedido #{pedido.id}</Text>
          <Text style={styles.pedidoData}>{pedido.data}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: getStatusColor(pedido.status) + '20',
              borderColor: getStatusColor(pedido.status),
            },
          ]}
        >
          <Ionicons
            name={getStatusIcon(pedido.status) as any}
            size={14}
            color={getStatusColor(pedido.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(pedido.status) }]}>
            {getStatusText(pedido.status)}
          </Text>
        </View>
      </View>

      <View style={styles.pedidoItensContainer}>
        {pedido.itens.slice(0, 2).map((item, index) => (
          <View key={index} style={styles.pedidoItem}>
            <Text style={styles.pedidoItemNome} numberOfLines={1}>
              {item.quantidade}x {item.nome}
            </Text>
            <Text style={styles.pedidoItemSubtotal}>
              R$ {item.subtotal.toFixed(2)}
            </Text>
          </View>
        ))}

        {pedido.itens.length > 2 && (
          <Text style={styles.pedidoMaisItens}>
            +{pedido.itens.length - 2} iten(s)
          </Text>
        )}
      </View>

      <View style={styles.pedidoResumo}>
        <View style={styles.pedidoTotalContainer}>
          <Text style={styles.pedidoTotalLabel}>Total</Text>
          <Text style={styles.pedidoTotalValor}>
            R$ {pedido.total.toFixed(2)}
          </Text>
        </View>

        <View style={styles.pedidoPagamentoContainer}>
          <View
            style={[
              styles.pagamentoBadge,
              pedido.pago ? styles.pagamentoPago : styles.pagamentoPendente,
            ]}
          >
            <Ionicons
              name={pedido.pago ? 'checkmark-circle' : 'time'}
              size={12}
              color="#FFF"
            />
            <Text style={styles.pagamentoTexto}>
              {pedido.pago ? 'Pago' : 'Pendente'}
            </Text>
          </View>

          {pedido.observacoes && (
            <View style={styles.observacoesBadge}>
              <Ionicons name="document-text" size={12} color="#888" />
              <Text style={styles.observacoesTexto}>Obs</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pedidoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pedidoInfo: {
    flex: 1,
  },
  pedidoId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  pedidoData: {
    fontSize: 12,
    color: '#888',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pedidoItensContainer: {
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  pedidoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pedidoItemNome: {
    fontSize: 14,
    color: '#AAA',
    flex: 1,
    marginRight: 12,
  },
  pedidoItemSubtotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8860B',
  },
  pedidoMaisItens: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  pedidoResumo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pedidoTotalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pedidoTotalLabel: {
    fontSize: 14,
    color: '#AAA',
  },
  pedidoTotalValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B8860B',
  },
  pedidoPagamentoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pagamentoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pagamentoPago: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  pagamentoPendente: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  pagamentoTexto: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  observacoesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(136, 136, 136, 0.2)',
    borderWidth: 1,
    borderColor: '#888',
  },
  observacoesTexto: {
    fontSize: 10,
    color: '#888',
  },
});
