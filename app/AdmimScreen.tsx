import { db } from "@/config/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Filho, Usuario } from "../types/usuarios";

// 🎯 COMPONENTE DE GERENCIAMENTO DE PAGAMENTO DO USUÁRIO OU FILHO
const GerenciarPagamento: React.FC<{
  usuarioId: string;
  filho?: Filho;
  pagamento: boolean;
  onAtualizado: () => void;
}> = ({ usuarioId, filho, pagamento, onAtualizado }) => {
  const [processando, setProcessando] = useState(false);

  const handleTogglePagamento = async () => {
    setProcessando(true);
    try {
      const userRef = doc(db, "usuarios", usuarioId);
      if (filho) {
        // atualizar pagamento do filho
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const usuarioData = userSnap.data() as Usuario;
          const novosFilhos = usuarioData.filhos?.map(f =>
            f.id === filho.id
              ? {
                  ...f,
                  pagamento: !f.pagamento,
                  dataUltimoPagamento: !f.pagamento ? new Date().toISOString() : f.dataUltimoPagamento,
                }
              : f
          );
          await updateDoc(userRef, { filhos: novosFilhos });
        }
      } else {
        // atualizar pagamento do usuário
        await updateDoc(userRef, {
          pagamento: !pagamento,
          dataUltimoPagamento: !pagamento ? new Date().toISOString() : "",
        });
      }

      onAtualizado();
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível atualizar o pagamento.");
    } finally {
      setProcessando(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.pagamentoButton,
        pagamento ? styles.pagamentoPago : styles.pagamentoPendente,
      ]}
      onPress={handleTogglePagamento}
      disabled={processando}
    >
      <Ionicons
        name={pagamento ? "checkmark-circle" : "time-outline"}
        size={16}
        color={pagamento ? "#22c55e" : "#ef4444"}
      />
      <Text
        style={[
          styles.pagamentoButtonText,
          pagamento ? styles.pagamentoButtonTextPago : styles.pagamentoButtonTextPendente,
        ]}
      >
        {pagamento ? "Pago" : "Pendente"}
      </Text>
    </TouchableOpacity>
  );
};

// 🎯 TELA ADMIN
export default function AdminScreen() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const usuariosCol = collection(db, "usuarios");
      const snapshot = await getDocs(usuariosCol);
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Usuario));
      setUsuarios(lista);
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    carregarUsuarios();
  };

  const handlePagamentoAtualizado = () => {
    carregarUsuarios();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B8860B" />
        <Text style={{ color: "#FFF" }}>Carregando usuários...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {usuarios.map(usuario => (
        <View key={usuario.id} style={styles.usuarioCard}>
          <View style={styles.usuarioHeader}>
            <Text style={styles.usuarioNome}>{usuario.nome}</Text>
            <GerenciarPagamento
              usuarioId={usuario.id}
              pagamento={usuario.pagamento}
              onAtualizado={handlePagamentoAtualizado}
            />
          </View>

          {usuario.filhos && usuario.filhos.length > 0 && (
            <View style={styles.filhosContainer}>
              {usuario.filhos.map(filho => (
                <View key={filho.id} style={styles.filhoCard}>
                  <Text style={styles.filhoNome}>{filho.nome}</Text>
                  <Text style={styles.filhoData}>
                    Último pagamento: {filho.dataUltimoPagamento
                      ? new Date(filho.dataUltimoPagamento).toLocaleDateString("pt-BR")
                      : "Não registrado"}
                  </Text>
                  <GerenciarPagamento
                    usuarioId={usuario.id}
                    filho={filho}
                    pagamento={filho.pagamento}
                    onAtualizado={handlePagamentoAtualizado}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// 🎯 ESTILOS
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  usuarioCard: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  usuarioHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  usuarioNome: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  filhosContainer: { marginTop: 12, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: "#333" },
  filhoCard: { marginBottom: 12 },
  filhoNome: { color: "#B8860B", fontWeight: "600", fontSize: 14 },
  filhoData: { color: "#CCC", fontSize: 12, marginBottom: 4 },
  pagamentoButton: { flexDirection: "row", alignItems: "center", gap: 6, padding: 6, borderRadius: 8 },
  pagamentoPago: { backgroundColor: "#1a1a1a" },
  pagamentoPendente: { backgroundColor: "#1a1a1a" },
  pagamentoButtonText: { fontSize: 12, fontWeight: "600" },
  pagamentoButtonTextPago: { color: "#22c55e" },
  pagamentoButtonTextPendente: { color: "#ef4444" },
});
