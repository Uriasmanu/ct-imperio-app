import { useRouter } from 'expo-router';
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import { AcessoNegado } from "@/components/Admin/AcessoNegado";
import { Estatisticas } from "@/components/Admin/Estatisticas";
import { Filtros } from "@/components/Admin/Filtros";
import { LoadingScreen } from "@/components/Admin/LoadingScreen";
import { UsuarioCard } from "@/components/Admin/UsuarioCard";
import { db } from "@/config/firebaseConfig";
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { FiltrosState, UsuarioCompleto } from "@/types/admin";

// 🎯 COMPONENTE PRINCIPAL ADMIN SCREEN
export default function AdminScreen() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAdminAuth();
  const [usuarios, setUsuarios] = useState<UsuarioCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosState>({
    busca: "",
    statusPagamento: "todos",
    modalidade: "todas"
  });

  // 🔄 VERIFICAR ACESSO
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      setLoading(false);
    }
  }, [authLoading, isAdmin]);

  // 🔄 CARREGAR USUÁRIOS (apenas se for admin)
  const carregarUsuarios = async () => {
    if (!isAdmin) return;

    try {
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const usuariosData: UsuarioCompleto[] = [];

      querySnapshot.forEach((doc) => {
        usuariosData.push({
          id: doc.id,
          ...doc.data()
        } as UsuarioCompleto);
      });

      usuariosData.sort((a, b) => a.nome.localeCompare(b.nome));
      setUsuarios(usuariosData);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      Alert.alert("Erro", "Não foi possível carregar a lista de usuários.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🔄 PULL TO REFRESH
  const onRefresh = () => {
    if (!isAdmin) return;
    setRefreshing(true);
    carregarUsuarios();
  };

  useEffect(() => {
    if (isAdmin) {
      carregarUsuarios();
    }
  }, [isAdmin]);

  // 🎯 APLICAR FILTROS
  const usuariosFiltrados = usuarios.filter(usuario => {
    if (filtros.busca &&
      !usuario.nome.toLowerCase().includes(filtros.busca.toLowerCase()) &&
      !usuario.email.toLowerCase().includes(filtros.busca.toLowerCase())
    ) {
      return false;
    }

    if (filtros.statusPagamento !== "todos") {
      if (filtros.statusPagamento === "pagos" && !usuario.pagamento) return false;
      if (filtros.statusPagamento === "pendentes" && usuario.pagamento) return false;
    }

    if (
      filtros.modalidade !== "todas" &&
      !usuario.modalidades.some(m => m.modalidade === filtros.modalidade)
    ) {
      return false;
    }

    return true;
  });

  // 🎯 ESTATÍSTICAS
  const estatisticas = {
    total: usuarios.length,
    pagos: usuarios.filter(u => u.pagamento).length,
    pendentes: usuarios.filter(u => !u.pagamento).length,
    comFilhos: usuarios.filter(u => u.filhos && u.filhos.length > 0).length,
    totalAlunos: usuarios.reduce((total, usuario) =>
      total + (usuario.filhos ? usuario.filhos.length : 0), 0
    ) + usuarios.length
  };

  // 🎯 RENDER STATES
  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  if (!isAdmin) {
    return <AcessoNegado onRetry={carregarUsuarios} />;
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Painel Administrativo</Text>
          <Text style={styles.headerSubtitle}>
            Logado como: {user?.email}
          </Text>
        </View>
      </View>

      {/* ESTATÍSTICAS */}
      <Estatisticas estatisticas={estatisticas} />

      {/* FILTROS */}
      <Filtros filtros={filtros} onFiltrosChange={setFiltros} />

      {/* LISTA DE USUÁRIOS */}
      <ScrollView
        style={styles.listaContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#B8860B"]}
            tintColor="#B8860B"
          />
        }
      >
        <View style={styles.resultadosInfo}>
          <Text style={styles.resultadosTexto}>
            {usuariosFiltrados.length} de {usuarios.length} usuários
          </Text>
          {filtros.busca && (
            <Text style={styles.buscaTexto}>
              Buscando por: "{filtros.busca}"
            </Text>
          )}
        </View>

        {usuariosFiltrados.length > 0 ? (
          usuariosFiltrados.map((usuario) => (
            <UsuarioCard
              key={usuario.id}
              usuario={usuario}
              onPagamentoAtualizado={carregarUsuarios}
            />
          ))
        ) : (
          <View style={styles.nenhumResultado}>
            <Text style={styles.nenhumResultadoText}>Nenhum usuário encontrado com os filtros aplicados.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#000", 
    padding: 16 
  },
  header: { 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: "#333", 
    marginBottom: 16 
  },
  headerContent: { 
    alignItems: "center" 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#FFF", 
    marginTop: 8 
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: "#AAA" 
  },
  listaContainer: { 
    flex: 1 
  },
  resultadosInfo: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  resultadosTexto: { 
    color: '#AAA', 
    fontSize: 12 
  },
  buscaTexto: { 
    color: '#B8860B', 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  nenhumResultado: { 
    alignItems: 'center', 
    marginTop: 50, 
    padding: 20, 
    backgroundColor: '#1a1a1a', 
    borderRadius: 12 
  },
  nenhumResultadoText: { 
    color: '#FFF', 
    marginTop: 8, 
    textAlign: 'center' 
  },
});