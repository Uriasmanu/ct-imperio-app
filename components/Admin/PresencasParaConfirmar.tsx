import { PresencaParaConfirmar, PresencaStats } from "@/types/admin";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PresencasParaConfirmarProps {
  presencas: PresencaParaConfirmar[];
  stats: PresencaStats;
  onConfirmarPresenca: (presencaId: string) => void;
  onConfirmarTodas?: () => Promise<{ success: boolean; confirmed: number }>;
  loading?: boolean;
}

export const PresencasParaConfirmar: React.FC<PresencasParaConfirmarProps> = ({
  presencas,
  stats,
  onConfirmarPresenca,
  onConfirmarTodas,
  loading = false,
}) => {
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [confirmandoTodas, setConfirmandoTodas] = useState(false);

  const isHoje = (dataString: string) => {
    const hoje = new Date().toISOString().split("T")[0];
    return dataString === hoje;
  };

  const presencasHoje = presencas.filter((presenca) => isHoje(presenca.data));
  const presencasPendentesHoje = presencasHoje.filter((p) => !p.confirmada);

  const temPresencasHoje = presencasHoje.length > 0;
  const temPresencasPendentesHoje = presencasPendentesHoje.length > 0;

  const handleConfirmarTodas = async () => {
    if (!onConfirmarTodas) return;

    const presencasPendentes = presencas.filter((p) => !p.confirmada);

    if (presencasPendentes.length === 0) {
      Alert.alert("Aviso", "Não há presenças pendentes para confirmar");
      return;
    }

    Alert.alert(
      "Confirmar Todas as Presenças",
      `Deseja confirmar todas as ${presencasPendentesHoje.length} presenças pendentes de hoje?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar Todas",
          style: "default",
          onPress: async () => {
            setConfirmandoTodas(true);
            try {
              const result = await onConfirmarTodas();
              if (result.success) {
                Alert.alert(
                  "Sucesso!",
                  `${result.confirmed} presenças foram confirmadas com sucesso!`,
                );
              } else {
                Alert.alert(
                  "Erro",
                  "Não foi possível confirmar todas as presenças",
                );
              }
            } catch (error) {
              Alert.alert("Erro", "Ocorreu um erro ao confirmar as presenças");
            } finally {
              setConfirmandoTodas(false);
            }
          },
        },
      ],
    );
  };

  const handleConfirmar = async (presenca: PresencaParaConfirmar) => {
    Alert.alert(
      "Confirmar Presença",
      `Deseja confirmar a presença de ${presenca.tipo === "filho" ? presenca.filhoNome : presenca.usuarioNome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: "default",
          onPress: async () => {
            setConfirmando(presenca.id);
            try {
              await onConfirmarPresenca(presenca.id);
            } catch (error) {
              Alert.alert("Erro", "Não foi possível confirmar a presença");
            } finally {
              setConfirmando(null);
            }
          },
        },
      ],
    );
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString + "T00:00:00");
    return data.toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando presenças...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Presenças para Confirmar</Text>

        {temPresencasPendentesHoje && onConfirmarTodas && (
          <TouchableOpacity
            style={[
              styles.confirmarTodasButton,
              confirmandoTodas && styles.confirmarTodasButtonDisabled,
            ]}
            onPress={handleConfirmarTodas}
            disabled={confirmandoTodas}
          >
            {confirmandoTodas ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={18} color="#000" />
                <Text style={styles.confirmarTodasText}>
                  Confirmar Todas ({presencasPendentesHoje.length})
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={20} color="#eab308" />
          <Text style={styles.statNumber}>{stats.pendentesHoje}</Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
          <Text style={styles.statNumber}>{stats.confirmadasHoje}</Text>
          <Text style={styles.statLabel}>Confirmadas</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="list" size={20} color="#B8860B" />
          <Text style={styles.statNumber}>{stats.totalParaConfirmar}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <ScrollView style={styles.listaContainer}>
        {presencas.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done" size={48} color="#666" />
            <Text style={styles.emptyStateText}>Nenhuma presença pendente</Text>
            <Text style={styles.emptyStateSubtext}>
              Todas as presenças de hoje estão confirmadas
            </Text>
          </View>
        ) : (
          presencas.map((presenca) => (
            <View
              key={presenca.id}
              style={[
                styles.presencaItem,
                presenca.confirmada && styles.presencaConfirmada,
              ]}
            >
              <View style={styles.presencaInfo}>
                <View style={styles.presencaHeader}>
                  <Text style={styles.usuarioNome}>
                    {presenca.tipo === "filho"
                      ? presenca.filhoNome
                      : presenca.usuarioNome}
                  </Text>
                  {presenca.tipo === "filho" && (
                    <Text style={styles.filhoLabel}>
                      (Filho de {presenca.usuarioNome})
                    </Text>
                  )}
                </View>

                <Text style={styles.presencaData}>
                  {formatarData(presenca.data)}
                </Text>

                <View style={styles.modalidadesContainer}>
                  {presenca.modalidades.map((modalidade, index) => (
                    <View
                      key={index}
                      style={[
                        styles.modalidadeBadge,
                        {
                          backgroundColor:
                            modalidade === "Muay Thai"
                              ? "#dc2626"
                              : modalidade === "Jiu-Jitsu"
                                ? "#1e40af"
                                : modalidade === "Boxe"
                                  ? "#059669"
                                  : "#7c3aed",
                        },
                      ]}
                    >
                      <Text style={styles.modalidadeBadgeText}>
                        {modalidade}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.actions}>
                {presenca.confirmada ? (
                  <View style={styles.confirmadaBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#22c55e"
                    />
                    <Text style={styles.confirmadaText}>Confirmada</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.confirmarButton,
                      confirmando === presenca.id &&
                        styles.confirmarButtonDisabled,
                    ]}
                    onPress={() => handleConfirmar(presenca)}
                    disabled={
                      confirmando === presenca.id || presenca.confirmada
                    }
                  >
                    {confirmando === presenca.id ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={18} color="#000" />
                        <Text style={styles.confirmarButtonText}>
                          {presenca.confirmada ? "Confirmada" : "Confirmar"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 4,
  },
  statLabel: {
    color: "#AAA",
    fontSize: 12,
  },
  listaContainer: {
    flexGrow: 1,
    marginBottom: 16,
  },

  presencaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#B8860B",
  },
  presencaConfirmada: {
    borderLeftColor: "#22c55e",
    opacity: 0.7,
  },
  presencaInfo: {
    flex: 1,
  },
  presencaHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  usuarioNome: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  filhoLabel: {
    color: "#AAA",
    fontSize: 12,
    fontStyle: "italic",
  },
  presencaData: {
    color: "#B8860B",
    fontSize: 12,
    marginVertical: 4,
  },
  modalidadesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  modalidadeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modalidadeBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  actions: {
    marginLeft: 12,
  },
  confirmadaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  confirmadaText: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "bold",
  },
  confirmarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#B8860B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  confirmarButtonText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    color: "#CCC",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  emptyStateSubtext: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  loadingText: {
    color: "#B8860B",
    textAlign: "center",
    padding: 20,
  },
  confirmarButtonDisabled: {
    opacity: 0.6,
    backgroundColor: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },

  confirmarTodasButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#22c55e",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },

  confirmarTodasButtonDisabled: {
    opacity: 0.6,
    backgroundColor: "#666",
  },

  confirmarTodasText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
});
