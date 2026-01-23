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
  onRecusarPresenca: (presencaId: string) => void;
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
  const [recusando, setRecusando] = useState<string | null>(null);
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
      "Confirmar Todas",
      `Deseja confirmar as ${presencasPendentesHoje.length} presenças de hoje?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar Todas",
          onPress: async () => {
            setConfirmandoTodas(true);
            try {
              const result = await onConfirmarTodas();
              if (result.success) {
                Alert.alert("Sucesso", `${result.confirmed} presenças confirmadas.`);
              }
            } catch (error) {
              Alert.alert("Erro", "Falha ao processar confirmação em massa.");
            } finally {
              setConfirmandoTodas(false);
            }
          },
        },
      ]
    );
  };

  const handleConfirmar = async (presenca: PresencaParaConfirmar) => {
    Alert.alert(
      "Confirmar Presença",
      `Confirmar ${presenca.tipo === "filho" ? presenca.filhoNome : presenca.usuarioNome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            setConfirmando(presenca.id);
            try {
              await onConfirmarPresenca(presenca.id);
            } catch (error) {
              Alert.alert("Erro", "Não foi possível confirmar.");
            } finally {
              setConfirmando(null);
            }
          },
        },
      ]
    );
  };

    const handleRecusar = async (presenca: PresencaParaConfirmar) => {
    Alert.alert(
      "Recusar Presença",
      `Recusar ${presenca.tipo === "filho" ? presenca.filhoNome : presenca.usuarioNome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Recusar",
          onPress: async () => {
            setConfirmando(presenca.id);
            try {
              await onRecusarPresenca(presenca.id);
            } catch (error) {
              Alert.alert("Erro", "Não foi possível recusar.");
            } finally {
              setConfirmando(null);
            }
          },
        },
      ]
    );
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString + "T00:00:00");
    return data.toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#B8860B" />
        <Text style={styles.loadingText}>Buscando dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Presenças</Text>
          <Text style={styles.subtitle}>Gerenciamento diário</Text>
        </View>

        {temPresencasPendentesHoje && onConfirmarTodas && (
          <TouchableOpacity
            style={[styles.btnBulk, confirmandoTodas && styles.btnDisabled]}
            onPress={handleConfirmarTodas}
            disabled={confirmandoTodas}
          >
            {confirmandoTodas ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Ionicons name="checkmark-done-outline" size={18} color="#000" />
                <Text style={styles.btnBulkText}>
                  Confirmar Todas ({presencasPendentesHoje.length})
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: "#eab308" }]}>{stats.pendentesHoje}</Text>
          <Text style={styles.statLab}>Pendentes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: "#22c55e" }]}>{stats.confirmadasHoje}</Text>
          <Text style={styles.statLab}>Check-ins</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: "#B8860B" }]}>{stats.totalParaConfirmar}</Text>
          <Text style={styles.statLab}>Total</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {presencas.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="shield-checkmark-sharp" size={32} color="#444" />
            </View>
            <Text style={styles.emptyStateText}>Tudo em dia!</Text>
            <Text style={styles.emptyStateSubtext}>Nenhuma pendência encontrada.</Text>
          </View>
        ) : (
          presencas.map((presenca) => (
            <View key={presenca.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={20} color="#B8860B" />
                </View>

                <View style={styles.mainInfo}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {presenca.tipo === "filho" ? presenca.filhoNome : presenca.usuarioNome}
                  </Text>
                  {presenca.tipo === "filho" && (
                    <Text style={styles.parentName}>Resp: {presenca.usuarioNome}</Text>
                  )}
                </View>

                <View style={styles.dateTag}>
                  <Text style={styles.dateText}>{formatarData(presenca.data)}</Text>
                </View>
              </View>

              <View style={styles.tagsRow}>
                {presenca.modalidades.map((m, i) => (
                  <View key={i} style={styles.tag}>
                    <View style={[styles.tagDot, { backgroundColor: m.includes('Muay') ? '#ef4444' : '#3b82f6' }]} />
                    <Text style={styles.tagText}>{m}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.cardActions}>
                {presenca.confirmada ? (
                  <View style={styles.confirmedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                    <Text style={styles.confirmedBadgeText}>Confirmado</Text>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.btnSecondary}
                      onPress={() => handleRecusar(presenca)}
                      disabled={recusando === presenca.id}
                    >
                      <Text style={styles.btnSecondaryText}>Recusar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnPrimary}
                      onPress={() => handleConfirmar(presenca)}
                      disabled={confirmando === presenca.id}
                    >
                      {confirmando === presenca.id ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <Text style={styles.btnPrimaryText}>Confirmar</Text>
                      )}
                    </TouchableOpacity>
                  </>
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
    flex: 1,
    backgroundColor: "#0F0F0F", 
    paddingHorizontal: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 25,
  },
  title: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "900",
  },
  subtitle: {
    color: "#666",
    fontSize: 14,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#262626",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#262626",
    marginVertical: 5,
  },
  statNum: {
    fontSize: 20,
    fontWeight: "800",
  },
  statLab: {
    color: "#555",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#161616",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#222",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  mainInfo: {
    flex: 1,
  },
  userName: {
    color: "#EEE",
    fontSize: 16,
    fontWeight: "700",
  },
  parentName: {
    color: "#666",
    fontSize: 12,
  },
  dateTag: {
    backgroundColor: "#222",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateText: {
    color: "#B8860B",
    fontSize: 11,
    fontWeight: "700",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  tagText: {
    color: "#AAA",
    fontSize: 11,
    fontWeight: "600",
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#222",
    paddingTop: 12,
  },
  btnPrimary: {
    flex: 2,
    backgroundColor: "#B8860B",
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  btnPrimaryText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 14,
  },
  btnSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#333",
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  btnSecondaryText: {
    color: "#999",
    fontWeight: "600",
    fontSize: 14,
  },
  confirmedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 6,
  },
  confirmedBadgeText: {
    color: "#22c55e",
    fontWeight: "700",
    fontSize: 13,
    textTransform: "uppercase",
  },
  emptyCard: {
    alignItems: "center",
    padding: 40,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#161616",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  emptyStateSubtext: {
    color: "#555",
    fontSize: 14,
    marginTop: 4,
  },
  loadingText: {
    color: "#666",
    marginTop: 10,
    fontWeight: "500",
  },
  btnBulk: {
    flexDirection: "row", 
    alignItems: "center",
    backgroundColor: "#B8860B",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6, 
    shadowColor: "#B8860B",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  btnBulkText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "800",
  },
  btnDisabled: {
    opacity: 0.5,
    backgroundColor: "#444",
  },
});