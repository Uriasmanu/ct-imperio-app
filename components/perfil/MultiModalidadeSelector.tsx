import { ModalidadeAluno } from "@/types/usuarios";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GraduacaoSelector } from "./GraduacaoSelector";

interface MultiModalidadeSelectorProps {
  modalidades: ModalidadeAluno[];
  onModalidadesChange: (modalidades: ModalidadeAluno[]) => void;
}

export const MultiModalidadeSelector: React.FC<
  MultiModalidadeSelectorProps
> = ({ modalidades, onModalidadesChange }) => {
  const todasModalidades: Array<
    "Muay Thai" | "Jiu-Jitsu" | "No-Gi" | "Boxe" | "MMA"
  > = ["Jiu-Jitsu", "Muay Thai", "Boxe", "MMA", "No-Gi"];

  const toggleModalidade = (
    modalidade: "Muay Thai" | "Jiu-Jitsu" | "No-Gi" | "Boxe" | "MMA",
  ) => {
    const existe = modalidades.find((m) => m.modalidade === modalidade);

    if (existe) {
      onModalidadesChange(
        modalidades.filter((m) => m.modalidade !== modalidade),
      );
    } else {
      const novaModalidade: ModalidadeAluno = {
        modalidade,
        dataInicio: new Date().toISOString(),
        ativo: true,
        graduacao:
          modalidade === "Muay Thai"
            ? { cor: "Branca", pontaBranca: false }
            : { cor: "Branca", grau: 1 },
      };
      onModalidadesChange([...modalidades, novaModalidade]);
    }
  };

  const atualizarGraduacao = (modalidade: string, novaGraduacao: any) => {
    const novasModalidades = modalidades.map((m) =>
      m.modalidade === modalidade ? { ...m, graduacao: novaGraduacao } : m,
    );
    onModalidadesChange(novasModalidades);
  };

  return (
    <View style={styles.container}>
      <View style={styles.modalidadesGrid}>
        {todasModalidades.map((modalidade) => {
          const ativa = modalidades.find((m) => m.modalidade === modalidade);

          return (
            <View key={modalidade} style={styles.modalidadeItem}>
              <TouchableOpacity
                style={[
                  styles.modalidadeButton,
                  ativa && styles.modalidadeButtonSelected,
                ]}
                onPress={() => toggleModalidade(modalidade)}
              >
                <Text
                  style={[
                    styles.modalidadeButtonText,
                    ativa && styles.modalidadeButtonTextSelected,
                  ]}
                >
                  {modalidade}
                </Text>
                <Ionicons
                  name={ativa ? "checkmark-circle" : "ellipse-outline"}
                  size={20}
                  color={ativa ? "#000" : "#666"}
                />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {modalidades.map((modalidadeAluno) => (
        <View key={modalidadeAluno.modalidade} style={styles.graduacaoSection}>
          <Text style={styles.graduacaoLabel}>
            Graduação - {modalidadeAluno.modalidade}
          </Text>
          <GraduacaoSelector
            modalidade={modalidadeAluno.modalidade}
            graduacaoAtual={modalidadeAluno.graduacao}
            onSelect={(graduacao) =>
              atualizarGraduacao(modalidadeAluno.modalidade, graduacao)
            }
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#B8860B",
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalidadesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  modalidadeItem: {
    flex: 1,
    minWidth: "45%",
  },
  modalidadeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#333",
  },
  modalidadeButtonSelected: {
    backgroundColor: "#B8860B",
    borderColor: "#DAA520",
  },
  modalidadeButtonText: {
    color: "#CCC",
    fontWeight: "500",
    fontSize: 14,
  },
  modalidadeButtonTextSelected: {
    color: "#000",
    fontWeight: "600",
  },
  graduacaoSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  graduacaoLabel: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "600",
    marginBottom: 8,
  },
});
