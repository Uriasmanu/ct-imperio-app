import { ItemEstoque } from "@/types/estoque";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
                    tamanhoSelecionado === tamanho && styles.tamanhoSelecionado,
                    !disponivel && styles.tamanhoIndisponivel,
                  ]}
                  onPress={() => disponivel && setTamanhoSelecionado(tamanho)}
                  disabled={!disponivel}
                >
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
                </TouchableOpacity>
              );
            })}
          </View>

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
              <Text style={styles.modalBotaoConfirmarTexto}>
                Adicionar ao Carrinho
              </Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalTamanhoContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#333",
  },
  modalTamanhoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTamanhoTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  modalFecharBtn: {
    padding: 4,
  },
  modalProdutoInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalProdutoNome: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 8,
  },
  modalProdutoPreco: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#B8860B",
  },
  tamanhosContainer: {
    padding: 20,
    gap: 12,
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
    backgroundColor: "rgba(184, 134, 11, 0.1)",
  },
  tamanhoIndisponivel: {
    opacity: 0.5,
    backgroundColor: "#1a1a1a",
  },
  tamanhoTexto: {
    fontSize: 18,
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
    fontSize: 14,
    color: "#888",
  },
  estoqueTextoIndisponivel: {
    color: "#666",
  },
  modalBotoesContainer: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  modalBotaoCancelar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBotaoCancelarTexto: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalBotaoConfirmar: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#B8860B",
  },
  modalBotaoConfirmarDisabled: {
    backgroundColor: "#333",
    opacity: 0.5,
  },
  modalBotaoConfirmarTexto: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
