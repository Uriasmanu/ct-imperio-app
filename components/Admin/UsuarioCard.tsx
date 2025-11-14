import { GerenciarPagamentoAdmim } from "@/components/Admin/GerenciarPagamentoAdmim";
import { UsuarioCompleto } from "@/types/admin";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface UsuarioCardProps {
  usuario: UsuarioCompleto;
  onPagamentoAtualizado: () => void;
}

export const UsuarioCard: React.FC<UsuarioCardProps> = ({
  usuario,
  onPagamentoAtualizado,
}) => {
  const [expanded, setExpanded] = useState(true);
  const rotateAnim = useState(new Animated.Value(0))[0];

  const temModalidade = (usuario.modalidades?.length ?? 0) > 0;
  const isPendente = !usuario.pagamento && temModalidade;

  const toggleExpanded = () => {
    const toValue = expanded ? 0 : 1;
    Animated.timing(rotateAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setExpanded(!expanded);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  const formatarData = (data: string) => {
    if (!data) return "Nunca";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const calcularDiasDesdePagamento = () => {
    if (!usuario.dataUltimoPagamento) return "Nunca pagou";

    const ultimo = new Date(usuario.dataUltimoPagamento);
    const hoje = new Date();
    const diff = Math.floor((hoje.getTime() - ultimo.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Hoje";
    if (diff === 1) return "1 dia atrás";
    return `${diff} dias atrás`;
  };

  const getStatusColor = () => {
    if (!usuario.dataUltimoPagamento) return "#ef4444";
    const diff = Math.floor(
      (new Date().getTime() - new Date(usuario.dataUltimoPagamento).getTime()) /
      (1000 * 60 * 60 * 24)
    );
    if (diff <= 30) return "#22c55e";
    if (diff <= 60) return "#eab308";
    return "#ef4444";
  };

  return (
    <View style={styles.usuarioCard}>
      {/* Cabeçalho */}
      <View style={styles.usuarioHeader}>
        <View style={styles.usuarioInfo}>
          <Text style={styles.usuarioNome}>{usuario.nome}</Text>
          <Text style={styles.usuarioEmail}>{usuario.email}</Text>

          {/* Modalidades com rolagem horizontal */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.modalidadesContainer}>
              {usuario.modalidades?.map((m, i) => (
                <View
                  key={i}
                  style={[
                    styles.modalidadeBadge,
                    {
                      backgroundColor:
                        m.modalidade === "Muay Thai"
                          ? "#dc2626"
                          : m.modalidade === "Jiu-Jitsu"
                            ? "#1e40af"
                            : m.modalidade === "Boxe"
                              ? "#059669"
                              : "#7c3aed",
                    },
                  ]}
                >
                  <Text style={styles.modalidadeBadgeText}>{m.modalidade}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
        {temModalidade && (
          <GerenciarPagamentoAdmim
            usuario={usuario}
            onPagamentoAtualizado={onPagamentoAtualizado}
          />
        )}

      </View>

      {/* Informações de pagamento */}
      <View style={styles.pagamentoInfo}>
        <View style={styles.dataRow}>
          <Ionicons name="calendar" size={14} color="#B8860B" />
          <Text style={styles.dataLabel}>Dia de pagamento:</Text>
          <Text style={styles.dataValue}>
            {new Date(usuario.dataPagamento).getDate()} de cada mês
          </Text>
        </View>

        <View style={styles.dataRow}>
          <Ionicons name="time" size={14} color="#B8860B" />
          <Text style={styles.dataLabel}>Último pagamento:</Text>
          <Text style={styles.dataValue}>
            {formatarData(usuario.dataUltimoPagamento)}
          </Text>
        </View>

        <View style={styles.dataRow}>
          <Ionicons name="alert-circle" size={14} color={getStatusColor()} />
          <Text style={styles.dataLabel}>Status:</Text>
          <Text style={[styles.dataValue, { color: getStatusColor() }]}>
            {calcularDiasDesdePagamento()}
          </Text>
        </View>
      </View>

      {/* Accordion de filhos */}
      {usuario.filhos && usuario.filhos.length > 0 && (
        <View style={styles.filhosSection}>
          <TouchableOpacity style={styles.accordionHeader} onPress={toggleExpanded}>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Ionicons name="chevron-forward" size={16} color="#B8860B" />
            </Animated.View>
            <Text style={styles.filhosTitle}>
              Alunos Dependentes ({usuario.filhos.length})
            </Text>
          </TouchableOpacity>

          {expanded && (
            <View style={styles.filhosLista}>
              {usuario.filhos.map((filho) => (
                <View key={filho.id} style={styles.filhoItem}>
                  <View style={styles.filhoItemContent}>
                    <Text style={styles.filhoNome}>{filho.nome}</Text>
                    <Text style={styles.filhoModalidade}>
                      {filho.modalidades
                        ?.map((m) => m.modalidade)
                        .join(", ") || "Sem modalidade"}
                    </Text>
                    <Text style={styles.filhoPagamentoData}>
                      Último: {formatarData(filho.dataUltimoPagamento || "")}
                    </Text>
                  </View>
                  <GerenciarPagamentoAdmim
                    usuario={usuario}
                    filho={filho}
                    onPagamentoAtualizado={onPagamentoAtualizado}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  usuarioCard: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#B8860B",
  },
  usuarioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  usuarioInfo: { flex: 1, paddingRight: 10 },
  usuarioNome: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  usuarioEmail: {
    color: "#AAA",
    fontSize: 12,
    marginBottom: 6,
  },
  modalidadesContainer: {
    flexDirection: "row",
    gap: 6,
  },
  modalidadeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modalidadeBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  pagamentoInfo: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    marginTop: 12,
    marginBottom: 12,
    gap: 4,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dataLabel: { color: "#AAA", fontSize: 12 },
  dataValue: { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  filhosSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filhosTitle: {
    color: "#B8860B",
    fontWeight: "bold",
    fontSize: 14,
  },
  filhosLista: { marginTop: 8 },
  filhoItem: {
    backgroundColor: "#0a0a0a",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#8b5cf6",
  },
  filhoItemContent: { flex: 1 },
  filhoNome: { color: "#FFF", fontWeight: "600", fontSize: 13 },
  filhoModalidade: { color: "#AAA", fontSize: 11, marginTop: 2 },
  filhoPagamentoData: { color: "#AAA", fontSize: 11, fontStyle: "italic", marginBottom: 15 },
});
