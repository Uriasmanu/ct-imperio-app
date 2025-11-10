import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { usePagamento } from "@/hooks/usePagamento";
import { Filho, Usuario } from "@/types/usuarios";

interface GerenciarPagamentoAdmimProps {
  usuario: Usuario;
  filho?: Filho;
  onPagamentoAtualizado: () => void;
}

export const GerenciarPagamentoAdmim: React.FC<GerenciarPagamentoAdmimProps> = ({
  usuario,
  filho,
  onPagamentoAtualizado,
}) => {
  const item = filho || usuario;
  const isFilho = !!filho;

  const {
    modalPagamento,
    setModalPagamento,
    processando,
    handleConfirmarPagamento,
    handleReverterPagamento,
    formatarData,
    getStatusInfo,
    dataUltimoPagamento
  } = usePagamento({
    item,
    usuarioId: usuario.id,
    tipo: isFilho ? 'filho' : 'usuario',
    onPagamentoAtualizado,
  });



  const getPagamentoInfo = () => {
    if (isFilho && filho) {
      return {
        pagamento: filho.pagamento,
        avisoPagamento: filho.avisoPagamento,
        dataUltimoPagamento: filho.dataUltimoPagamento
      };
    } else {
      return {
        pagamento: usuario.pagamento,
        avisoPagamento: usuario.avisoPagamento,
        dataUltimoPagamento: usuario.dataUltimoPagamento
      };
    }
  };

  const pagamentoInfo = getPagamentoInfo();
  const statusInfo = getStatusInfo();


  return (
    <>
      {/* Botão para abrir modal de gerenciamento */}
      <TouchableOpacity
        style={[
          styles.statusButton,
          {
            backgroundColor: statusInfo.cor + "20",
            borderColor: statusInfo.cor,
            minWidth: isFilho ? 100 : 120, 
            paddingHorizontal: isFilho ? 8 : 12, 
          }
        ]}
        onPress={() => setModalPagamento(true)}
      >
        <Ionicons name={statusInfo.icone as any} size={isFilho ? 14 : 16} color={statusInfo.cor} />
        <Text style={[
          styles.statusButtonText,
          {
            color: statusInfo.cor,
            fontSize: isFilho ? 10 : 12, 
          }
        ]}>
          {statusInfo.texto}
        </Text>
      </TouchableOpacity>

      {/* Modal de Gerenciamento */}
      <Modal
        visible={modalPagamento}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !processando && setModalPagamento(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gerenciar Pagamento</Text>
              <TouchableOpacity
                onPress={() => !processando && setModalPagamento(false)}
                disabled={processando}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.pagamentoInfo}>
              <View style={styles.alunoInfo}>
                <Ionicons
                  name={isFilho ? "person-outline" : "person"}
                  size={20}
                  color="#B8860B"
                />
                <View>
                  <Text style={styles.pagamentoNome}>{item.nome}</Text>
                  <Text style={styles.pagamentoTipo}>
                    {isFilho ? `Aluno de ${usuario.nome}` : "Aluno Principal"}
                  </Text>
                </View>
              </View>

              <View style={[
                styles.statusBadge,
                { backgroundColor: statusInfo.cor + "20" }
              ]}>
                <Ionicons name={statusInfo.icone as any} size={16} color={statusInfo.cor} />
                <Text style={[styles.statusBadgeText, { color: statusInfo.cor }]}>
                  {statusInfo.textoLongo.toUpperCase()}
                </Text>
              </View>

              <Text style={styles.statusDescricao}>
                {statusInfo.descricao}
              </Text>

              {pagamentoInfo.dataUltimoPagamento && (
                <View style={styles.dataInfo}>
                  <Ionicons name="calendar" size={16} color="#666" />
                  <Text style={styles.pagamentoData}>
                    Último pagamento: {formatarData(pagamentoInfo.dataUltimoPagamento)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalPagamento(false)}
                disabled={processando}
              >
                <Text style={styles.cancelButtonText}>Fechar</Text>
              </TouchableOpacity>

              {/* CORREÇÃO: Usar pagamentoInfo em vez de item */}
              {pagamentoInfo.avisoPagamento && !pagamentoInfo.pagamento && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleConfirmarPagamento}
                  disabled={processando}
                >
                  {processando ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="#000" />
                      <Text style={styles.confirmButtonText}>Confirmar Pagamento</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* CORREÇÃO: Usar pagamentoInfo em vez de item */}
              {pagamentoInfo.pagamento && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.warningButton]}
                  onPress={handleReverterPagamento}
                  disabled={processando}
                >
                  {processando ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="refresh" size={20} color="#FFF" />
                      <Text style={styles.warningButtonText}>Reverter para Pendente</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = {
  statusButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
  },
  statusButtonText: {
    fontWeight: "600" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#333",
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#FFF",
  },
  pagamentoInfo: {
    padding: 20,
    gap: 16,
  },
  alunoInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  pagamentoNome: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#FFF",
  },
  pagamentoTipo: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
  },
  statusDescricao: {
    fontSize: 14,
    color: "#CCC",
    lineHeight: 20,
  },
  dataInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  pagamentoData: {
    fontSize: 14,
    color: "#666",
  },
  modalActions: {
    flexDirection: "row" as const,
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  modalButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    padding: 16,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#333",
  },
  confirmButton: {
    backgroundColor: "#22c55e",
  },
  warningButton: {
    backgroundColor: "#ef4444",
  },
  cancelButtonText: {
    color: "#CCC",
    fontWeight: "600" as const,
    fontSize: 16,
  },
  confirmButtonText: {
    color: "#000",
    fontWeight: "600" as const,
    fontSize: 16,
  },
  warningButtonText: {
    color: "#FFF",
    fontWeight: "600" as const,
    fontSize: 16,
  },
} as const;