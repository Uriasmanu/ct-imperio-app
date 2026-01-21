import { ItemEstoque } from "@/types/estoque";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ModalTamanhoProps {
  visible: boolean;
  produto: ItemEstoque | null;
  onFechar: () => void;
  onConfirmar: (tamanho: string) => void;
}

export function ModalTamanho({
  visible,
  produto,
  onFechar,
  onConfirmar,
}: ModalTamanhoProps) {
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string>("");

  if (!produto) return null;

  const tamanhosDisponiveis = produto.tamanhos
    ? Object.keys(produto.tamanhos)
    : [];

  const handleConfirmar = () => {
    if (!tamanhoSelecionado) return;
    onConfirmar(tamanhoSelecionado);
    setTamanhoSelecionado("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onFechar}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalTamanhoContainer}>
          <View style={styles.modalTamanhoHeader}>
            <Text style={styles.modalTamanhoTitulo}>Selecione o Tamanho</Text>
            <TouchableOpacity onPress={onFechar} style={styles.modalFecharBtn}>
              <Ionicons name="close" size={24} color="#AAA" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.modalProdutoInfo}>
              <Text style={styles.modalProdutoNome}>{produto.nome}</Text>
              <Text style={styles.modalProdutoPreco}>
                R$ {produto.preco.toFixed(2)}
              </Text>
            </View>

            <View style={styles.tamanhosContainer}>
              {tamanhosDisponiveis.map((tamanho) => {
                const estoque = produto.tamanhos?.[tamanho] || 0;
                const disponivel = estoque > 0;

                return (
                  <TouchableOpacity
                    key={tamanho}
                    style={[
                      styles.tamanhoItem,
                      tamanhoSelecionado === tamanho &&
                        styles.tamanhoSelecionado,
                      !disponivel && styles.tamanhoIndisponivel,
                    ]}
                    onPress={() => disponivel && setTamanhoSelecionado(tamanho)}
                    disabled={!disponivel}
                  >
                    <View>
                      <Text
                        style={[
                          styles.tamanhoTexto,
                          tamanhoSelecionado === tamanho &&
                            styles.tamanhoTextoSelecionado,
                          !disponivel && styles.tamanhoTextoIndisponivel,
                        ]}
                      >
                        {tamanho}
                      </Text>
                      <Text
                        style={[
                          styles.estoqueTexto,
                          !disponivel && styles.estoqueTextoIndisponivel,
                        ]}
                      >
                        {disponivel ? `${estoque} disponíveis` : "Indisponível"}
                      </Text>
                    </View>
                    {tamanhoSelecionado === tamanho && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#B8860B"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.modalBotoesContainer}>
            <TouchableOpacity
              style={styles.modalBotaoCancelar}
              onPress={onFechar}
            >
              <Text style={styles.modalBotaoCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalBotaoConfirmar,
                !tamanhoSelecionado && styles.modalBotaoConfirmarDisabled,
              ]}
              onPress={handleConfirmar}
              disabled={!tamanhoSelecionado}
            >
              <Ionicons name="cart" size={20} color="#FFF" />
              <Text style={styles.modalBotaoConfirmarTexto}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  modalTamanhoContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: SCREEN_HEIGHT * 0.8,
    borderWidth: 1,
    borderColor: "#333",
    overflow: "hidden",
  },
  modalTamanhoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  scrollArea: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  modalTamanhoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  modalFecharBtn: {
    padding: 4,
  },
  modalProdutoInfo: {
    padding: 20,
  },
  modalProdutoNome: {
    fontSize: 16,
    color: "#AAA",
    marginBottom: 4,
  },
  modalProdutoPreco: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#B8860B",
  },
  tamanhosContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  tamanhoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#333",
  },
  tamanhoSelecionado: {
    borderColor: "#B8860B",
    backgroundColor: "rgba(184, 134, 11, 0.05)",
  },
  tamanhoIndisponivel: {
    opacity: 0.4,
  },
  tamanhoTexto: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFF",
  },
  tamanhoTextoSelecionado: {
    color: "#B8860B",
  },
  tamanhoTextoIndisponivel: {
    color: "#666",
  },
  estoqueTexto: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  estoqueTextoIndisponivel: {
    color: "#555",
  },
  modalBotoesContainer: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
    backgroundColor: "#1a1a1a",
  },
  modalBotaoCancelar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
  },
  modalBotaoCancelarTexto: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  modalBotaoConfirmar: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#B8860B",
  },
  modalBotaoConfirmarDisabled: {
    backgroundColor: "#333",
  },
  modalBotaoConfirmarTexto: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
