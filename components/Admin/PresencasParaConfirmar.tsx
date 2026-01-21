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
  onRecusarPresenca?: (presencaId: string) => void; // Adicionei para suportar a nova função
  onConfirmarTodas?: () => Promise<{ success: boolean; confirmed: number }>;
  loading?: boolean;
}

export const PresencasParaConfirmar: React.FC<PresencasParaConfirmarProps> = ({
  presencas,
  stats,
  onConfirmarPresenca,
  onRecusarPresenca,
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
                  `${result.confirmed} presenças confirmadas!`,
                );
              }
            } catch (error) {
              Alert.alert("Erro", "Erro ao confirmar presenças");
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
            } finally {
              setConfirmando(null);
            }
          },
        },
      ],
    );
  };

  const handleRecusar = (presenca: PresencaParaConfirmar) => {
    Alert.alert(
      "Recusar Presença",
      `Deseja realmente cancelar a presença de ${presenca.tipo === "filho" ? presenca.filhoNome : presenca.usuarioNome}?`,
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Sim, Recusar",
          style: "destructive",
          onPress: () => onRecusarPresenca?.(presenca.id),
        },
      ],
    );
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString + "T00:00:00");
    return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
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

      <ScrollView
        style={styles.listaContainer}
        showsVerticalScrollIndicator={false}
      >
        {presencas.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done" size={48} color="#666" />
            <Text style={styles.emptyStateText}>Nenhuma presença pendente</Text>
          </View>
        ) : (
          presencas.map((presenca) => (
            <View key={presenca.id} style={styles.presencaCard}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(presenca.tipo === "filho"
                      ? presenca.filhoNome
                      : presenca.usuarioNome
                    )?.charAt(0)}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.usuarioNome}>
                    {presenca.tipo === "filho"
                      ? presenca.filhoNome
                      : presenca.usuarioNome}
                  </Text>
                  {presenca.tipo === "filho" && (
                    <Text style={styles.filhoLabel}>
                      Resp: {presenca.usuarioNome}
                    </Text>
                  )}
                </View>
                <View style={styles.dataBadge}>
                  <Text style={styles.dataBadgeText}>
                    {formatarData(presenca.data)}
                  </Text>
                </View>
              </View>

              <View style={styles.modalidadesRow}>
                {presenca.modalidades.map((m, i) => (
                  <View
                    key={i}
                    style={[
                      styles.modalidadeTag,
                      {
                        borderLeftColor:
                          m === "Muay Thai" ? "#dc2626" : "#1e40af",
                      },
                    ]}
                  >
                    <Text style={styles.modalidadeTagText}>{m}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.cardActions}>
                {presenca.confirmada ? (
                  <View style={styles.confirmadaBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#22c55e"
                    />
                    <Text style={styles.confirmadaText}>
                      Presença Confirmada
                    </Text>
                  </View>
                ) : (
                  <View style={styles.actionButtonsGroup}>
                    <TouchableOpacity
                      style={styles.recusarAction}
                      onPress={() => handleRecusar(presenca)}
                      disabled={confirmando === presenca.id}
                    >
                      <Ionicons
                        name="close-outline"
                        size={22}
                        color="#ef4444"
                      />
                      <Text style={styles.recusarActionText}>Recusar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.confirmarAction,
                        confirmando === presenca.id &&
                          styles.confirmarButtonDisabled,
                      ]}
                      onPress={() => handleConfirmar(presenca)}
                      disabled={confirmando === presenca.id}
                    >
                      {confirmando === presenca.id ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <>
                          <Ionicons name="checkmark" size={20} color="#000" />
                          <Text style={styles.confirmarActionText}>
                            Confirmar
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { color: "#FFF", fontSize: 18, fontWeight: "bold", flex: 1 },
  confirmarTodasButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#22c55e",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  confirmarTodasButtonDisabled: { opacity: 0.6, backgroundColor: "#666" },
  confirmarTodasText: { color: "#000", fontSize: 12, fontWeight: "bold" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  statItem: { alignItems: "center" },
  statNumber: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 4,
  },
  statLabel: { color: "#AAA", fontSize: 12 },
  listaContainer: { flexGrow: 1 },
  loadingText: { color: "#B8860B", textAlign: "center", padding: 20 },
  emptyState: { alignItems: "center", padding: 20 },
  emptyStateText: { color: "#666", fontSize: 14, marginTop: 12 },

  // Estilos do Novo Card Otimizado
  presencaCard: {
    backgroundColor: "#262626",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#B8860B33",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#B8860B",
  },
  avatarText: { color: "#B8860B", fontWeight: "bold", fontSize: 16 },
  userInfo: { flex: 1 },
  usuarioNome: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  filhoLabel: { color: "#888", fontSize: 11, fontStyle: "italic" },
  dataBadge: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dataBadgeText: { color: "#B8860B", fontSize: 10, fontWeight: "bold" },

  modalidadesRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  modalidadeTag: {
    backgroundColor: "#1f1f1f",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderLeftWidth: 3,
  },
  modalidadeTagText: { color: "#AAA", fontSize: 11, fontWeight: "600" },

  cardActions: { borderTopWidth: 1, borderTopColor: "#333", paddingTop: 12 },
  actionButtonsGroup: { flexDirection: "row", gap: 12 },
  confirmarAction: {
    flex: 2,
    backgroundColor: "#B8860B",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  confirmarActionText: { color: "#000", fontWeight: "bold", fontSize: 14 },
  recusarAction: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ef444455",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  recusarActionText: { color: "#ef4444", fontWeight: "600", fontSize: 14 },

  confirmadaBadge: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  confirmadaText: { color: "#22c55e", fontWeight: "bold", fontSize: 14 },
  confirmarButtonDisabled: { opacity: 0.6, backgroundColor: "#666" },
});
