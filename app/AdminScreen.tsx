import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { AcessoNegado } from "@/components/Admin/AcessoNegado";
import { AvisosManager } from "@/components/Admin/AvisosManager";
import { DetalhesAlunoModal } from "@/components/Admin/DetalhesAlunoModal";
import { Estatisticas } from "@/components/Admin/Estatisticas";
import { Estoque } from "@/components/Admin/estoque/estoque";
import { Filtros } from "@/components/Admin/Filtros";
import { ListaAlunos } from "@/components/Admin/ListaAlunos";
import { LoadingScreen } from "@/components/Admin/LoadingScreen";
import { PresencasParaConfirmar } from "@/components/Admin/PresencasParaConfirmar";
import { ListaAlunosRelatorio } from "@/components/Admin/relatorios/ListaAlunosRelatorio";
import { UsuarioCard } from "@/components/Admin/UsuarioCard";
import { db } from "@/config/firebaseConfig";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { usePresenca } from "@/hooks/usePresenca";
import { FiltrosState, UsuarioCompleto } from "@/types/admin";

type AdminSection =
  | "presencas"
  | "gestao"
  | "alunos"
  | "estoque"
  | "relatorios"
  | "avisos";

export default function AdminScreen() {
  const { user, isAdmin, loading: authLoading } = useAdminAuth();
  const [usuarios, setUsuarios] = useState<UsuarioCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosState>({
    busca: "",
    statusPagamento: "todos",
    modalidade: "todas",
    professor: "todos",
  });
  const [secaoAtiva, setSecaoAtiva] = useState<AdminSection | null>(null);

  const {
    presencasParaConfirmar,
    stats,
    loading: presencasLoading,
    confirmarPresenca,
    buscarPresencasDoDia,
    confirmarTodasPresencasHoje,
  } = usePresenca();

  const [alunoSelecionado, setAlunoSelecionado] =
    useState<UsuarioCompleto | null>(null);
  const [modalDetalhesVisible, setModalDetalhesVisible] = useState(false);

  const handleAbrirDetalhesAluno = (usuario: UsuarioCompleto) => {
    setAlunoSelecionado(usuario);
    setModalDetalhesVisible(true);
  };

  const handleFecharDetalhes = () => {
    setModalDetalhesVisible(false);
    setAlunoSelecionado(null);
  };

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      setLoading(false);
    }
  }, [authLoading, isAdmin]);

  const carregarUsuarios = async () => {
    if (!isAdmin) return;

    try {
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const usuariosData: UsuarioCompleto[] = [];

      querySnapshot.forEach((doc) => {
        usuariosData.push({
          id: doc.id,
          ...doc.data(),
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

  const onRefresh = () => {
    if (!isAdmin) return;
    setRefreshing(true);
    carregarUsuarios();
    buscarPresencasDoDia();
  };

  useEffect(() => {
    if (isAdmin && !authLoading) {
      carregarUsuarios();
    }
  }, [isAdmin, authLoading]);

  const usuariosFiltrados = usuarios.filter((usuario) => {
    if (
      filtros.busca &&
      !usuario.nome.toLowerCase().includes(filtros.busca.toLowerCase()) &&
      !usuario.email.toLowerCase().includes(filtros.busca.toLowerCase())
    ) {
      return false;
    }

    if (filtros.modalidade !== "todas") {
      const usuarioTemModalidade = usuario.modalidades?.some(
        (m) => m && m.modalidade === filtros.modalidade && m.ativo !== false,
      );

      const algumFilhoTemModalidade = usuario.filhos?.some((filho) =>
        filho.modalidades?.some(
          (m) => m && m.modalidade === filtros.modalidade && m.ativo !== false,
        ),
      );

      if (!usuarioTemModalidade && !algumFilhoTemModalidade) {
        return false;
      }
    }

    if (filtros.statusPagamento !== "todos") {
      const usuarioTemModalidadeAtiva = usuario.modalidades?.some(
        (m) => m && m.ativo !== false,
      );

      const algumFilhoTemModalidadeAtiva = usuario.filhos?.some((filho) =>
        filho.modalidades?.some((m) => m && m.ativo !== false),
      );

      if (!usuarioTemModalidadeAtiva && !algumFilhoTemModalidadeAtiva) {
        return false;
      }

      if (filtros.statusPagamento === "pagos") {
        const usuarioPago = usuario.pagamento && usuarioTemModalidadeAtiva;

        const algumFilhoPago = usuario.filhos?.some(
          (filho) =>
            filho.pagamento &&
            filho.modalidades?.some((m) => m && m.ativo !== false),
        );

        if (!usuarioPago && !algumFilhoPago) return false;
      }

      if (filtros.statusPagamento === "aguardando") {
        const usuarioAguardando =
          !usuario.pagamento &&
          usuario.avisoPagamento &&
          usuarioTemModalidadeAtiva;

        const algumFilhoAguardando = usuario.filhos?.some(
          (filho) =>
            !filho.pagamento &&
            filho.avisoPagamento &&
            filho.modalidades?.some((m) => m && m.ativo !== false),
        );

        if (!usuarioAguardando && !algumFilhoAguardando) return false;
      }

      if (filtros.statusPagamento === "pendentes") {
        const usuarioPendente =
          !usuario.pagamento &&
          !usuario.avisoPagamento &&
          usuarioTemModalidadeAtiva;

        const algumFilhoPendente = usuario.filhos?.some(
          (filho) =>
            !filho.pagamento &&
            !filho.avisoPagamento &&
            filho.modalidades?.some((m) => m && m.ativo !== false),
        );

        if (!usuarioPendente && !algumFilhoPendente) return false;
      }
    }

    return true;
  });
  const estatisticas = {
    total: usuarios.length,

    pendentes: usuarios.reduce((totalPendentes, usuario) => {
      const usuarioPendente =
        !usuario.pagamento &&
        usuario.modalidades &&
        usuario.modalidades.some((m) => m.ativo !== false)
          ? 1
          : 0;

      const filhosPendentes = usuario.filhos
        ? usuario.filhos.filter(
            (filho) =>
              !filho.pagamento &&
              filho.modalidades &&
              filho.modalidades.some((m) => m.ativo !== false),
          ).length
        : 0;

      return totalPendentes + usuarioPendente + filhosPendentes;
    }, 0),

    pagos: usuarios.reduce((totalPagos, usuario) => {
      const usuarioPago = usuario.pagamento ? 1 : 0;

      const filhosPagos = usuario.filhos
        ? usuario.filhos.filter((filho) => filho.pagamento).length
        : 0;

      return totalPagos + usuarioPago + filhosPagos;
    }, 0),

    comFilhos: usuarios.filter((u) => u.filhos && u.filhos.length > 0).length,

    totalAlunos:
      usuarios.reduce(
        (total, usuario) =>
          total + (usuario.filhos ? usuario.filhos.length : 0),
        0,
      ) + usuarios.length,
  };

  const renderConteudoSecao = () => {
    switch (secaoAtiva) {
      case "presencas":
        return (
          <View style={styles.secaoContent}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="calendar" size={22} color="#B8860B" />
                  <Text style={styles.sectionTitle}>
                    Presenças para Confirmar
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.refreshButton,
                    presencasLoading && styles.refreshButtonDisabled,
                  ]}
                  onPress={() => buscarPresencasDoDia()}
                  disabled={presencasLoading}
                >
                  <Ionicons name="refresh" size={20} color="#B8860B" />
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

      case "gestao":
        return (
          <View style={styles.secaoContent}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="stats-chart" size={22} color="#B8860B" />
                  <Text style={styles.sectionTitle}>Estatísticas Gerais</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.refreshButton,
                    refreshing && styles.refreshButtonDisabled,
                  ]}
                  onPress={onRefresh}
                  disabled={refreshing}
                >
                  <Ionicons name="refresh" size={20} color="#B8860B" />
                </TouchableOpacity>
              </View>
              <Estatisticas estatisticas={estatisticas} />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="people" size={22} color="#B8860B" />
                  <Text style={styles.sectionTitle}>Gestão de Usuários</Text>
                </View>
              </View>

              <View style={styles.filtrosContainer}>
                <Filtros filtros={filtros} onFiltrosChange={setFiltros} />
              </View>

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

      case "alunos":
        return (
          <View style={styles.secaoContent}>
            <ListaAlunos
              usuarios={usuarios}
              onAbrirDetalhes={handleAbrirDetalhesAluno}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          </View>
        );

      case "relatorios":
        return (
          <View style={styles.secaoContent}>
            <ListaAlunosRelatorio
              usuarios={usuarios}
              onAbrirDetalhes={handleAbrirDetalhesAluno}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          </View>
        );

      case "estoque":
        return (
          <View style={styles.secaoContent}>
            <Estoque />
          </View>
        );

      case "avisos":
        return (
          <View style={styles.secaoContent}>
            <AvisosManager isVisible={secaoAtiva === "avisos"} />
          </View>
        );

      default:
        return null;
    }
  };

  const renderCardsNavegacao = () => {
    const cards = [
      {
        key: "presencas" as AdminSection,
        title: "Presenças",
        icon: "calendar",
        description: "Confirmar presenças do dia",
        badge: stats.pendentesHoje > 0 ? stats.pendentesHoje : undefined,
        color: "#B8860B",
      },
      {
        key: "gestao" as AdminSection,
        title: "Gestão",
        icon: "people",
        description: "Gerenciar usuários e pagamentos",
        color: "#10B981",
      },
      {
        key: "alunos" as AdminSection,
        title: "Alunos",
        icon: "list",
        description: "Lista completa de alunos",
        color: "#3B82F6",
      },
      {
        key: "relatorios" as AdminSection,
        title: "Relatorios",
        icon: "analytics",
        description: "Análise de presença e dados",
        color: "#8B5CF6",
      },
      {
        key: "estoque" as AdminSection,
        title: "Estoque",
        icon: "cube",
        description: "Estoque de equipamentos e roupas",
        color: "#84CC16",
      },
      {
        key: "avisos" as AdminSection,
        title: "Avisos",
        icon: "megaphone",
        description: "Gerenciar avisos e notificações",
        color: "#EF4444",
      },
    ];

    return (
      <View style={styles.cardsContainer}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.key}
            style={[styles.card, { borderLeftColor: card.color }]}
            onPress={() => setSecaoAtiva(card.key)}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: card.color },
                ]}
              >
                <Ionicons name={card.icon as any} size={24} color="#FFF" />
              </View>
              {card.badge && (
                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>{card.badge}</Text>
                </View>
              )}
            </View>

            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>

            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={20} color={card.color} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderBotaoVoltar = () => {
    if (secaoAtiva === null) return null;

    return (
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setSecaoAtiva(null as any)}
      >
        <Ionicons name="arrow-back" size={20} color="#B8860B" />
        <Text style={styles.backButtonText}>Voltar ao Menu</Text>
      </TouchableOpacity>
    );
  };

  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  if (!isAdmin) {
    return <AcessoNegado onRetry={carregarUsuarios} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="shield" size={32} color="#B8860B" />
          <Text style={styles.headerTitle}>Painel Administrativo</Text>
          <Text style={styles.headerSubtitle}>Logado como: {user?.email}</Text>
        </View>
      </View>

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
        {secaoAtiva && renderBotaoVoltar()}

        {secaoAtiva ? (
          renderConteudoSecao()
        ) : (
          <View style={styles.menuContainer}>{renderCardsNavegacao()}</View>
        )}

        <View style={styles.footerSpace} />
      </ScrollView>

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
    backgroundColor: "#000",
    paddingTop: 10,
    paddingBottom: 1,
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
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#AAA",
    textAlign: "center",
  },
  menuContainer: {
    paddingTop: 20,
    alignItems: "center",
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 8,
  },
  menuSubtitle: {
    fontSize: 16,
    color: "#AAA",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  cardsContainer: {
    width: "100%",
    gap: 16,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#B8860B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  cardBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    flex: 1,
  },
  cardDescription: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
    flex: 1,
  },
  cardArrow: {
    marginLeft: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    marginTop: 15,
  },
  backButtonText: {
    color: "#B8860B",
    fontSize: 16,
    fontWeight: "600",
  },
  secaoContent: {
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#B8860B",
    letterSpacing: 0.5,
  },
  refreshButton: {
    padding: 10,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  filtrosContainer: {
    marginBottom: 20,
  },
  resultadosInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  resultadosLeft: {
    flex: 1,
  },
  resultadosTexto: {
    color: "#AAA",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  buscaTexto: {
    color: "#B8860B",
    fontSize: 12,
    fontWeight: "500",
  },
  recarregandoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  recarregandoTexto: {
    color: "#B8860B",
    fontSize: 12,
    fontWeight: "500",
  },
  usuariosContainer: {
    gap: 16,
  },
  nenhumResultado: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#333",
    borderStyle: "dashed",
  },
  nenhumResultadoTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  nenhumResultadoText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  footerSpace: {
    height: 40,
  },
});
