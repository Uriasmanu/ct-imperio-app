import { FiltrosState } from "@/types/admin";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FiltrosProps {
  filtros: FiltrosState;
  onFiltrosChange: (filtros: FiltrosState) => void;
}

export const Filtros: React.FC<FiltrosProps> = ({
  filtros,
  onFiltrosChange,
}) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  return (
    <View style={styles.filtrosContainer}>
      <View style={styles.filtrosHeader}>
        <TextInput
          style={styles.buscaInput}
          placeholder="Buscar por nome ou email..."
          placeholderTextColor="#666"
          value={filtros.busca}
          onChangeText={(text) => onFiltrosChange({ ...filtros, busca: text })}
        />
        <TouchableOpacity
          style={styles.filtroButton}
          onPress={() => setMostrarFiltros(!mostrarFiltros)}
        >
          <Ionicons name="filter" size={20} color="#B8860B" />
          <Text style={styles.filtroButtonText}>Filtros</Text>
        </TouchableOpacity>
      </View>

      {mostrarFiltros && (
        <View style={styles.filtrosAvancados}>
          <View style={styles.filtroGrupo}>
            <Text style={styles.filtroLabel}>Status de Pagamento</Text>
            <View style={styles.filtroBotoes}>
              {[
                { value: "todos" as const, label: "Todos", icon: "list" },
                { value: "pagos" as const, label: "Pagos", icon: "checkmark" },
                {
                  value: "aguardando" as const,
                  label: "Aguardando",
                  icon: "time",
                },
                {
                  value: "pendentes" as const,
                  label: "Pendentes",
                  icon: "alert-circle",
                },
              ].map((opcao) => (
                <TouchableOpacity
                  key={opcao.value}
                  style={[
                    styles.filtroOpcao,
                    filtros.statusPagamento === opcao.value &&
                      styles.filtroOpcaoSelecionada,
                  ]}
                  onPress={() =>
                    onFiltrosChange({
                      ...filtros,
                      statusPagamento: opcao.value,
                    })
                  }
                >
                  <Ionicons
                    name={opcao.icon as any}
                    size={16}
                    color={
                      filtros.statusPagamento === opcao.value
                        ? "#000"
                        : "#B8860B"
                    }
                  />
                  <Text
                    style={[
                      styles.filtroOpcaoTexto,
                      filtros.statusPagamento === opcao.value &&
                        styles.filtroOpcaoTextoSelecionado,
                    ]}
                  >
                    {opcao.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filtroGrupo}>
            <Text style={styles.filtroLabel}>Modalidade</Text>
            <View style={styles.filtroBotoes}>
              {[
                { value: "todas" as const, label: "Todas" },
                { value: "Jiu-Jitsu" as const, label: "Jiu-Jitsu" },
                { value: "Muay Thai" as const, label: "Muay Thai" },
                { value: "Boxe" as const, label: "Boxe" },
                { value: "MMA" as const, label: "MMA" },
              ].map((opcao) => (
                <TouchableOpacity
                  key={opcao.value}
                  style={[
                    styles.filtroOpcao,
                    filtros.modalidade === opcao.value &&
                      styles.filtroOpcaoSelecionada,
                  ]}
                  onPress={() =>
                    onFiltrosChange({ ...filtros, modalidade: opcao.value })
                  }
                >
                  <Text
                    style={[
                      styles.filtroOpcaoTexto,
                      filtros.modalidade === opcao.value &&
                        styles.filtroOpcaoTextoSelecionado,
                    ]}
                  >
                    {opcao.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export const styles = StyleSheet.create({
  filtrosContainer: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    marginBottom: 16,
  },
  filtrosHeader: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  buscaInput: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    color: "#FFF",
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
  },
  filtroButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 10,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
  },
  filtroButtonText: {
    color: "#B8860B",
    fontWeight: "bold",
  },
  filtrosAvancados: {
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 8,
  },
  filtroGrupo: {
    marginBottom: 10,
  },
  filtroLabel: {
    color: "#FFF",
    fontWeight: "bold",
    marginBottom: 6,
    fontSize: 12,
  },
  filtroBotoes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filtroOpcao: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#333",
  },
  filtroOpcaoSelecionada: {
    backgroundColor: "#B8860B",
  },
  filtroOpcaoTexto: {
    color: "#B8860B",
    fontSize: 12,
    marginLeft: 4,
  },
  filtroOpcaoTextoSelecionado: {
    color: "#000",
    fontWeight: "bold",
  },
});
