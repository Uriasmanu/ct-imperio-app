import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { AcessoNegado } from "@/components/Admin/AcessoNegado";
import { Estatisticas } from "@/components/Admin/Estatisticas";
import { Filtros } from "@/components/Admin/Filtros";
import { LoadingScreen } from "@/components/Admin/LoadingScreen";
import { PresencasParaConfirmar } from "@/components/Admin/PresencasParaConfirmar";
import { UsuarioCard } from "@/components/Admin/UsuarioCard";
import { db } from "@/config/firebaseConfig";
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminPresenca } from '@/hooks/useAdminPresenca';
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

  // Use o hook para presenças administrativas
  const { 
    presencasParaConfirmar, 
    stats, 
    loading: presencasLoading, 
    confirmarPresenca,
    buscarPresencasDoDia 
  } = useAdminPresenca();

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
    buscarPresencasDoDia();
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
          <Ionicons name="shield" size={32} color="#B8860B" />
          <Text style={styles.headerTitle}>Painel Administrativo</Text>
          <Text style={styles.headerSubtitle}>
            Logado como: {user?.email}
          </Text>
        </View>
      </View>

      {/* CONTEÚDO PRINCIPAL */}
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#B8860B"]}
            tintColor="#B8860B"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        
        {/* SEÇÃO: PRESENÇAS PARA CONFIRMAR */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="calendar" size={22} color="#B8860B" />
              <Text style={styles.sectionTitle}>Presenças para Confirmar</Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.refreshButton,
                presencasLoading && styles.refreshButtonDisabled
              ]}
              onPress={() => buscarPresencasDoDia()}
              disabled={presencasLoading}
            >
              <Ionicons 
                name="refresh" 
                size={20} 
                color="#B8860B"
              />
            </TouchableOpacity>
          </View>
          
          <PresencasParaConfirmar
            presencas={presencasParaConfirmar}
            stats={stats}
            onConfirmarPresenca={confirmarPresenca}
            loading={presencasLoading}
          />
        </View>

        {/* SEÇÃO: ESTATÍSTICAS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="stats-chart" size={22} color="#B8860B" />
              <Text style={styles.sectionTitle}>Estatísticas Gerais</Text>
            </View>
          </View>
          <Estatisticas estatisticas={estatisticas} />
        </View>

        {/* SEÇÃO: FILTROS E USUÁRIOS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="people" size={22} color="#B8860B" />
              <Text style={styles.sectionTitle}>Gestão de Usuários</Text>
            </View>
          </View>

          {/* FILTROS */}
          <View style={styles.filtrosContainer}>
            <Filtros filtros={filtros} onFiltrosChange={setFiltros} />
          </View>

          {/* INFO RESULTADOS */}
          <View style={styles.resultadosInfo}>
            <View style={styles.resultadosLeft}>
              <Text style={styles.resultadosTexto}>
                {usuariosFiltrados.length} de {usuarios.length} usuários
              </Text>
              {filtros.busca && (
                <Text style={styles.buscaTexto}>
                  Buscando por: "{filtros.busca}"
                </Text>
              )}
            </View>
            {refreshing && (
              <View style={styles.recarregandoContainer}>
                <Ionicons name="sync" size={14} color="#B8860B" />
                <Text style={styles.recarregandoTexto}>Atualizando...</Text>
              </View>
            )}
          </View>

          {/* LISTA DE USUÁRIOS */}
          <View style={styles.usuariosContainer}>
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
                <Ionicons name="search-outline" size={56} color="#666" />
                <Text style={styles.nenhumResultadoTitle}>
                  Nenhum usuário encontrado
                </Text>
                <Text style={styles.nenhumResultadoText}>
                  Tente ajustar os filtros ou termos de busca
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ESPAÇO FINAL */}
        <View style={styles.footerSpace} />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#000",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: { 
    backgroundColor: '#000',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerContent: { 
    alignItems: "center",
    gap: 12,
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "#FFF",
    textAlign: 'center',
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: "#AAA",
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#B8860B',
    letterSpacing: 0.5,
  },
  refreshButton: {
    padding: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  filtrosContainer: {
    marginBottom: 20,
  },
  resultadosInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  resultadosLeft: {
    flex: 1,
  },
  resultadosTexto: { 
    color: '#AAA', 
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  buscaTexto: { 
    color: '#B8860B', 
    fontSize: 12, 
    fontWeight: '500',
  },
  recarregandoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  recarregandoTexto: {
    color: '#B8860B',
    fontSize: 12,
    fontWeight: '500',
  },
  usuariosContainer: {
    gap: 16,
  },
  nenhumResultado: { 
    alignItems: 'center', 
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#1a1a1a', 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  nenhumResultadoTitle: {
    color: '#FFF', 
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  nenhumResultadoText: { 
    color: '#888', 
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerSpace: {
    height: 40,
  },
});