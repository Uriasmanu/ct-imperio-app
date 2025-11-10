// adminScreen.tsx
import { Ionicons } from '@expo/vector-icons';
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
import { AvisosManager } from "@/components/Admin/AvisosManager";
import { DetalhesAlunoModal } from '@/components/Admin/DetalhesAlunoModal';
import { Estatisticas } from "@/components/Admin/Estatisticas";
import { Filtros } from "@/components/Admin/Filtros";
import { ListaAlunos } from '@/components/Admin/ListaAlunos';
import { LoadingScreen } from "@/components/Admin/LoadingScreen";
import { PresencasParaConfirmar } from "@/components/Admin/PresencasParaConfirmar";
import { UsuarioCard } from "@/components/Admin/UsuarioCard";
import { db } from "@/config/firebaseConfig";
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { usePresenca } from '@/hooks/usePresenca';
import { FiltrosState, UsuarioCompleto } from "@/types/admin";

// Tipos para as abas
type AdminTab = 'presencas' | 'gestao' | 'alunos' | 'avisos';

// 🎯 COMPONENTE PRINCIPAL ADMIN SCREEN
export default function AdminScreen() {
  const { user, isAdmin, loading: authLoading } = useAdminAuth();
  const [usuarios, setUsuarios] = useState<UsuarioCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosState>({
    busca: "",
    statusPagamento: "todos",
    modalidade: "todas"
  });
  const [abaAtiva, setAbaAtiva] = useState<AdminTab>('presencas');

  // Use o hook para presenças administrativas
  const {
    presencasParaConfirmar,
    stats,
    loading: presencasLoading,
    confirmarPresenca,
    buscarPresencasDoDia,
    confirmarTodasPresencasHoje,
  } = usePresenca();

  const [alunoSelecionado, setAlunoSelecionado] = useState<UsuarioCompleto | null>(null);
  const [modalDetalhesVisible, setModalDetalhesVisible] = useState(false);

  // Função para abrir detalhes do aluno
  const handleAbrirDetalhesAluno = (usuario: UsuarioCompleto) => {
    setAlunoSelecionado(usuario);
    setModalDetalhesVisible(true);
  };

  // Função para fechar modal
  const handleFecharDetalhes = () => {
    setModalDetalhesVisible(false);
    setAlunoSelecionado(null);
  };

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
    pendentes: usuarios.filter(
      u => !u.pagamento && u.modalidades && u.modalidades.length > 0
    ).length, // ✅ só conta pendente se tiver modalidade
    comFilhos: usuarios.filter(u => u.filhos && u.filhos.length > 0).length,
    totalAlunos:
      usuarios.reduce(
        (total, usuario) => total + (usuario.filhos ? usuario.filhos.length : 0),
        0
      ) + usuarios.length,
  };


  // 🎯 RENDER CONTEÚDO POR ABA
  const renderConteudoAba = () => {
    switch (abaAtiva) {
      case 'presencas':
        return (
          <View style={styles.abaContent}>
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
                onConfirmarTodas={confirmarTodasPresencasHoje}
                loading={loading}
              />
            </View>
          </View>
        );

      case 'gestao':
        return (
          <View style={styles.abaContent}>
            {/* SEÇÃO: ESTATÍSTICAS */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="stats-chart" size={22} color="#B8860B" />
                  <Text style={styles.sectionTitle}>Estatísticas Gerais</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.refreshButton,
                    refreshing && styles.refreshButtonDisabled
                  ]}
                  onPress={onRefresh}
                  disabled={refreshing}
                >
                  <Ionicons name="refresh" size={20} color="#B8860B" />
                </TouchableOpacity>
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
          </View>
        );

      case 'alunos':
        return (
          <View style={styles.abaContent}>
            <ListaAlunos
              usuarios={usuarios}
              onAbrirDetalhes={handleAbrirDetalhesAluno}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          </View>
        );

      case 'avisos':
        return (
          <View style={styles.abaContent}>
            <AvisosManager isVisible={abaAtiva === 'avisos'} />
          </View>
        );

      default:
        return null;
    }
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

        {/* ABAS DE NAVEGAÇÃO COM SCROLL HORIZONTAL */}
        <View style={styles.tabsScrollContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContentContainer}
          >
            <TouchableOpacity
              style={[
                styles.tabButton,
                abaAtiva === 'presencas' && styles.tabButtonActive
              ]}
              onPress={() => setAbaAtiva('presencas')}
            >
              <Ionicons
                name="calendar"
                size={20}
                color={abaAtiva === 'presencas' ? "#000" : "#B8860B"}
              />
              <Text style={[
                styles.tabButtonText,
                abaAtiva === 'presencas' && styles.tabButtonTextActive
              ]}>
                Presenças
              </Text>
              {stats.pendentesHoje > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{stats.pendentesHoje}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                abaAtiva === 'gestao' && styles.tabButtonActive
              ]}
              onPress={() => setAbaAtiva('gestao')}
            >
              <Ionicons
                name="people"
                size={20}
                color={abaAtiva === 'gestao' ? "#000" : "#B8860B"}
              />
              <Text style={[
                styles.tabButtonText,
                abaAtiva === 'gestao' && styles.tabButtonTextActive
              ]}>
                Gestão
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                abaAtiva === 'alunos' && styles.tabButtonActive
              ]}
              onPress={() => setAbaAtiva('alunos')}
            >
              <Ionicons
                name="list"
                size={20}
                color={abaAtiva === 'alunos' ? "#000" : "#B8860B"}
              />
              <Text style={[
                styles.tabButtonText,
                abaAtiva === 'alunos' && styles.tabButtonTextActive
              ]}>
                Alunos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                abaAtiva === 'avisos' && styles.tabButtonActive
              ]}
              onPress={() => setAbaAtiva('avisos')}
            >
              <Ionicons
                name="megaphone"
                size={20}
                color={abaAtiva === 'avisos' ? "#000" : "#B8860B"}
              />
              <Text style={[
                styles.tabButtonText,
                abaAtiva === 'avisos' && styles.tabButtonTextActive
              ]}>
                Avisos
              </Text>
            </TouchableOpacity>
          </ScrollView>
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
        {renderConteudoAba()}

        {/* ESPAÇO FINAL */}
        <View style={styles.footerSpace} />
      </ScrollView>

      {/* MODAL DE DETALHES DO ALUNO */}
      <DetalhesAlunoModal
        visible={modalDetalhesVisible}
        usuario={alunoSelecionado}
        onClose={handleFecharDetalhes}
      />
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
  },
  header: {
    backgroundColor: '#000',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerContent: {
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
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
  // NOVOS ESTILOS PARA SCROLL HORIZONTAL NAS ABAS
  tabsScrollContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
  },
  tabsContentContainer: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 4,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    position: 'relative',
    minWidth: 100,
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#B8860B',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8860B',
  },
  tabButtonTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  abaContent: {
    paddingTop: 20,
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