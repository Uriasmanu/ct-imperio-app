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
  onRecusarPresenca?: (presencaId: string) => void;
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

  const formatarData = (dataString: string) => {
    const data = new Date(dataString + "T00:00:00");
    return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#B8860B" />
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
            onPress={() => onConfirmarTodas()}
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
            <View key={presenca.id} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.userRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(presenca.tipo === "filho"
                        ? presenca.filhoNome
                        : presenca.usuarioNome
                      )?.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.nameContainer}>
                    <Text style={styles.userName}>
                      {presenca.tipo === "filho"
                        ? presenca.filhoNome
                        : presenca.usuarioNome}
                    </Text>
                    {presenca.tipo === "filho" && (
                      <Text style={styles.parentName}>
                        Resp: {presenca.usuarioNome}
                      </Text>
                    )}
                  </View>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateBadgeText}>
                      {formatarData(presenca.data)}
                    </Text>
                  </View>
                </View>

                <View style={styles.tagsRow}>
                  {presenca.modalidades.map((m, idx) => (
                    <View key={idx} style={styles.tag}>
                      <View
                        style={[
                          styles.tagDot,
                          {
                            backgroundColor:
                              m === "Muay Thai" ? "#dc2626" : "#1e40af",
                          },
                        ]}
                      />
                      <Text style={styles.tagText}>{m}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.cardActions}>
                  {!presenca.confirmada ? (
                    <>
                      <TouchableOpacity
                        style={styles.btnSecondary}
                        onPress={() => handleRecusar(presenca)}
                      >
                        <Ionicons
                          name="close-outline"
                          size={18}
                          color="#ef4444"
                        />
                        <Text style={styles.btnSecondaryText}>Recusar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.btnPrimary}
                        onPress={() => onConfirmarPresenca(presenca.id)}
                      >
                        <Ionicons
                          name="checkmark-sharp"
                          size={18}
                          color="#000"
                        />
                        <Text style={styles.btnPrimaryText}>Confirmar</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.confirmedStatus}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#22c55e"
                      />
                      <Text style={styles.confirmedStatusText}>Confirmada</Text>
                    </View>
                  )}
                </View>
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
    marginBottom: 16,
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

  card: {
    backgroundColor: "#262626",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  cardContent: { padding: 12 },
  userRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#B8860B22",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#B8860B",
  },
  avatarText: { color: "#B8860B", fontWeight: "bold", fontSize: 16 },
  nameContainer: { flex: 1 },
  userName: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  parentName: { color: "#888", fontSize: 11 },
  dateBadge: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dateBadgeText: { color: "#B8860B", fontSize: 10, fontWeight: "bold" },

  tagsRow: { flexDirection: "row", gap: 6, marginBottom: 12 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 5,
  },
  tagDot: { width: 5, height: 5, borderRadius: 2.5 },
  tagText: { color: "#AAA", fontSize: 10, fontWeight: "600" },

  cardActions: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 10,
  },
  btnPrimary: {
    flex: 2,
    backgroundColor: "#B8860B",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  btnPrimaryText: { color: "#000", fontWeight: "bold", fontSize: 13 },
  btnSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ef444466",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  btnSecondaryText: { color: "#ef4444", fontWeight: "600", fontSize: 13 },

  confirmedStatus: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  confirmedStatusText: { color: "#22c55e", fontWeight: "bold", fontSize: 13 },

  emptyState: { alignItems: "center", padding: 20 },
  emptyStateText: { color: "#666", fontSize: 14, marginTop: 12 },
  loadingText: { color: "#B8860B", textAlign: "center", marginTop: 8 },
});
