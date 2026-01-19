import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface EstatisticasProps {
  estatisticas: {
    total: number;
    aguardando: number;
    pagos: number;
    pendentes: number;
    comFilhos: number;
    totalAlunos: number;
  };
}

export const Estatisticas: React.FC<EstatisticasProps> = ({ estatisticas }) => {
  return (
    <View style={styles.container}>
      <View style={styles.mainCard}>
        <View>
          <Text style={styles.mainLabel}>Total de Usuários</Text>
          <Text style={styles.mainNumber}>{estatisticas.total}</Text>
        </View>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: "rgba(184, 134, 11, 0.2)" },
          ]}
        >
          <Ionicons name="people" size={24} color="#B8860B" />
        </View>
      </View>

      <View style={styles.grid}>
        <StatItem
          label="Aguardando"
          value={estatisticas.aguardando}
          icon="time-outline"
          color="#d78500"
        />
        <StatItem
          label="Pagos"
          value={estatisticas.pagos}
          icon="checkmark-done"
          color="#22c55e"
        />
        <StatItem
          label="Pendentes"
          value={estatisticas.pendentes}
          icon="alert-circle-outline"
          color="#ef4444"
        />
        <StatItem
          label="Total Alunos"
          value={estatisticas.totalAlunos}
          icon="school-outline"
          color="#8b5cf6"
        />
      </View>
    </View>
  );
};

const StatItem = ({ label, value, icon, color }: any) => (
  <View style={styles.miniCard}>
    <View style={[styles.indicator, { backgroundColor: color }]} />
    <Ionicons name={icon} size={18} color={color} style={styles.miniIcon} />
    <View>
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  mainCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  mainLabel: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "500",
  },
  mainNumber: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  miniCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 12,
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    overflow: "hidden",
  },
  indicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  miniIcon: {
    marginRight: 10,
  },
  miniValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  miniLabel: {
    color: "#888",
    fontSize: 11,
  },
});
