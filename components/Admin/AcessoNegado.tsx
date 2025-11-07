import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AcessoNegadoProps {
  onRetry: () => void;
}

export const AcessoNegado: React.FC<AcessoNegadoProps> = ({ onRetry }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="shield" size={64} color="#ef4444" />
      <Text style={styles.title}>Acesso Restrito</Text>
      <Text style={styles.text}>
        Esta área é exclusiva para administradores.
      </Text>
      <Text style={styles.subtext}>
        Você precisa ter permissão de administrador para acessar este painel.
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.retryButton]}
          onPress={onRetry}
        >
          <Ionicons name="refresh" size={20} color="#000" />
          <Text style={styles.retryText}>Tentar Novamente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#B8860B" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: "#000", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#FFF", marginTop: 12 },
  text: { color: "#AAA", textAlign: "center", marginTop: 8 },
  subtext: { color: "#666", textAlign: "center", marginTop: 4 },
  buttons: { flexDirection: "row", gap: 12, marginTop: 20 },
  button: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderRadius: 8 },
  retryButton: { backgroundColor: "#B8860B" },
  backButton: { borderWidth: 1, borderColor: "#B8860B" },
  retryText: { color: "#000", fontWeight: "bold" },
  backText: { color: "#B8860B", fontWeight: "bold" },
});
