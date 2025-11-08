// src/components/perfil/ModalFilho.tsx
import { Filho, ModalidadeAluno } from "@/types/usuarios";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MultiModalidadeSelector } from "./MultiModalidadeSelector";

interface ModalFilhoProps {
  visible: boolean;
  filhoEmEdicao: Filho | null;
  onClose: () => void;
  onAdicionarFilho: (filho: Omit<Filho, "id">) => void;
  onSalvarEdicaoFilho: (filho: Filho) => void;
}

export const ModalFilho: React.FC<ModalFilhoProps> = ({
  visible,
  filhoEmEdicao,
  onClose,
  onAdicionarFilho,
  onSalvarEdicaoFilho,
}) => {
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [observacao, setObservacao] = useState("");
  const [modalidades, setModalidades] = useState<ModalidadeAluno[]>([]);

  useEffect(() => {
    if (filhoEmEdicao) {
      setNome(filhoEmEdicao.nome);
      setIdade(filhoEmEdicao.idade?.toString() || "");
      setObservacao(filhoEmEdicao.observacao || "");
      setModalidades(filhoEmEdicao.modalidades || []);
    } else {
      resetForm();
    }
  }, [filhoEmEdicao, visible]);

  const resetForm = () => {
    setNome("");
    setIdade("");
    setObservacao("");
    setModalidades([]);
  };

  const handleSalvar = () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "Por favor, informe o nome do filho.");
      return;
    }

    if (!idade.trim()) {
      Alert.alert("Erro", "Por favor, informe a idade do filho.");
      return;
    }

    const idadeNumero = parseInt(idade);
    if (isNaN(idadeNumero) || idadeNumero <= 0) {
      Alert.alert("Erro", "Por favor, informe uma idade válida.");
      return;
    }

    if (modalidades.length === 0) {
      Alert.alert("Erro", "Por favor, selecione pelo menos uma modalidade.");
      return;
    }

    const filhoData = {
      nome: nome.trim(),
      idade: idadeNumero,
      observacao: observacao.trim(),
      modalidades: modalidades,
      dataDeRegistro: filhoEmEdicao?.dataDeRegistro || new Date().toISOString(),
      pagamento: filhoEmEdicao?.pagamento || false,
      avisoPagamento: filhoEmEdicao?.avisoPagamento || false,
      dataPagamento: filhoEmEdicao?.dataPagamento || new Date().toISOString(),
      dataUltimoPagamento: filhoEmEdicao?.dataUltimoPagamento || new Date().toISOString(),
    };

    if (filhoEmEdicao) {
      onSalvarEdicaoFilho({ ...filhoData, id: filhoEmEdicao.id });
    } else {
      onAdicionarFilho(filhoData);
    }

    resetForm();
    onClose();
  };


  const handleFechar = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleFechar}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {filhoEmEdicao ? "Editar Aluno" : "Adicionar Aluno"}
            </Text>
            <TouchableOpacity onPress={handleFechar} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome *</Text>
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Digite o nome do filho"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Idade</Text>
              <TextInput
                style={styles.input}
                value={idade}
                onChangeText={setIdade}
                placeholder="Idade"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <MultiModalidadeSelector
                modalidades={modalidades}
                onModalidadesChange={setModalidades}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Observações</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={observacao}
                onChangeText={setObservacao}
                placeholder="Observações adicionais (opcional)"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleFechar}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSalvar}
              >
                <Ionicons
                  name={filhoEmEdicao ? "save" : "add"}
                  size={20}
                  color="#000"
                />
                <Text style={styles.saveButtonText}>
                  {filhoEmEdicao ? "Salvar" : "Adicionar"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    width: "100%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#B8860B",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#B8860B",
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    padding: 12,
    color: "#FFF",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  textArea: {
    minHeight: 80,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 35
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#666",
  },
  saveButton: {
    backgroundColor: "#B8860B",
  },
  cancelButtonText: {
    color: "#CCC",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});