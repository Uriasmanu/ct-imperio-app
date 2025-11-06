import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { GraduacaoSelector } from "@/components/perfil/GraduacaoSelector";
import { ModalFilho } from "@/components/perfil/ModalFilho";
import { GerenciarPagamento } from "@/components/perfil/Pagamento/GerenciarPagamento";
import { auth, db } from "@/config/firebaseConfig";
import {
  Filho,
  GraduacaoJiuJitsu,
  GraduacaoMuayThai,
  Usuario,
} from "../types/usuarios";


export default function PerfilScreen() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [editando, setEditando] = useState(false);
  const [modalFilho, setModalFilho] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [atualizacao, setAtualizacao] = useState(0);
  const [filhoEmEdicao, setFilhoEmEdicao] = useState<Filho | null>(null);

  const carregarUsuario = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, "usuarios", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setUsuario(snap.data() as Usuario);
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados.");
      }
    }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarUsuario();
  };


  const verificarPagamentosFilhos = async () => {
    if (!usuario?.id || !usuario.filhos) return;

    const hoje = new Date();
    let atualizou = false;

    const filhosAtualizados = usuario.filhos.map(filho => {
      if (!filho.dataUltimoPagamento) return filho;

      const ultimaData = new Date(filho.dataUltimoPagamento);
      const diffDias = Math.floor((hoje.getTime() - ultimaData.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDias >= 30 && filho.pagamento) {
        atualizou = true;
        return { ...filho, pagamento: false };
      }
      return filho;
    });

    if (atualizou) {
      try {
        const userRef = doc(db, "usuarios", usuario.id);
        await updateDoc(userRef, { filhos: filhosAtualizados });
        setUsuario(prev => prev ? { ...prev, filhos: filhosAtualizados } : prev);
      } catch (error) {
        console.error("Erro ao atualizar pagamentos:", error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await carregarUsuario();
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [atualizacao]);

  useEffect(() => {
    if (usuario) {
      verificarPagamentosFilhos();
    }
  }, [usuario]);

  const handlePagamentoAtualizado = () => {
    setAtualizacao(prev => prev + 1);
  };

  const handleSalvarPerfil = async () => {
    if (!usuario?.id) {
      Alert.alert("Erro", "Usuário não encontrado.");
      return;
    }

    if (!usuario.modalidade) {
      Alert.alert("Campo obrigatório", "Selecione uma modalidade antes de salvar.");
      return;
    }

    try {
      const userRef = doc(db, "usuarios", usuario.id);
      await updateDoc(userRef, {
        nome: usuario.nome ?? "",
        email: usuario.email ?? "",
        telefone: usuario.telefone ?? "",
        observacao: usuario.observacao ?? "",
        modalidade: usuario.modalidade ?? "",
        graduacao: usuario.graduacao ?? { cor: "Branca", grau: 1 },
      });

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      setEditando(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    }
  };

  const handleEditarFilho = (filho: Filho) => {
    setFilhoEmEdicao(filho);
    setModalFilho(true);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const formatarGraduacao = (
    graduacao?: GraduacaoMuayThai | GraduacaoJiuJitsu,
    modalidade?: string
  ) => {
    if (!graduacao) return "Sem graduação";

    if (modalidade === "Muay Thai") {
      const grad = graduacao as GraduacaoMuayThai;
      return grad?.pontaBranca ? `${grad.cor} (Ponta Branca)` : grad.cor;
    } else {
      const grad = graduacao as GraduacaoJiuJitsu;
      const grau = grad?.grau ?? 0;
      return `${grad.cor} - ${grau}º Grau`;
    }
  };

  const renderInfoField = (label: string, value: string, editable?: boolean, key?: string) => (
    <View style={styles.infoField} key={key}>
      <Text style={styles.infoLabel}>{label}</Text>
      {editable && editando ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) =>
            setUsuario((prev) => prev ? { ...prev, [key || label.toLowerCase()]: text } : prev)
          }
          placeholderTextColor="#666"
        />
      ) : (
        <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
          {value || "Não informado"}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B8860B" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  if (!usuario) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="sad-outline" size={64} color="#666" />
        <Text style={styles.errorText}>Usuário não encontrado</Text>
        <Text style={styles.errorSubtext}>Tente fazer login novamente</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#B8860B"]}
          tintColor="#B8860B"
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {usuario.nome.split(" ").map((n) => n[0]).join("").toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{usuario.nome}</Text>
        <Text style={styles.userGraduacao}>
          {formatarGraduacao(usuario.graduacao, usuario.modalidade)}
        </Text>
        <Text style={styles.userModalidade}>{usuario.modalidade}</Text>

        <View style={styles.pagamentoHeader}>
          <Ionicons
            name={usuario.pagamento ? "checkmark-circle" : "alert-circle"}
            size={16}
            color={usuario.pagamento ? "#22c55e" : "#ef4444"}
          />
          <Text style={[
            styles.pagamentoHeaderText,
            { color: usuario.pagamento ? "#22c55e" : "#ef4444" }
          ]}>
            {usuario.pagamento ? "Pagamento em dia" : "Pagamento pendente"}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="person" size={20} color="#B8860B" />
            <Text style={styles.sectionTitle}>INFORMAÇÕES PESSOAIS</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditando(!editando)}
          >
            <Ionicons
              name={editando ? "close" : "create-outline"}
              size={20}
              color="#B8860B"
            />
            <Text style={styles.editButtonText}>
              {editando ? "Cancelar" : "Editar"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          {renderInfoField("Nome", usuario.nome, true, "nome")}
          {renderInfoField("Email", usuario.email, true, "email")}
          {renderInfoField("Telefone", usuario.telefone || "", true, "telefone")}
          {renderInfoField("Data de Registro", formatarData(usuario.dataDeRegistro), false)}
          {renderInfoField("Observação", usuario.observacao || "", true, "observacao")}

          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>Dia de pagamento:</Text>
            <Text style={styles.infoValue}>
              {new Date(usuario.dataPagamento).getDate()} de cada mês
            </Text>
          </View>

          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>Status do Pagamento</Text>
            <GerenciarPagamento
              item={usuario}
              onPagamentoAtualizado={handlePagamentoAtualizado}
              tipo="usuario"
            />

          </View>

          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>Modalidade</Text>
            {editando ? (
              <View style={styles.modalidadeGrid}>
                {["Jiu-Jitsu", "Muay Thai", "Boxe", "MMA"].map((mod) => (
                  <TouchableOpacity
                    key={mod}
                    style={[
                      styles.modalidadeButton,
                      usuario.modalidade === mod && styles.modalidadeButtonSelected,
                    ]}
                    onPress={() =>
                      setUsuario((prev) =>
                        prev ? { ...prev, modalidade: mod as Usuario["modalidade"] } : prev
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.modalidadeButtonText,
                        usuario.modalidade === mod && styles.modalidadeButtonTextSelected,
                      ]}
                    >
                      {mod}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.infoValue}>{usuario.modalidade}</Text>
            )}
          </View>

          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>Graduação</Text>
            {editando ? (
              <GraduacaoSelector
                modalidade={usuario.modalidade}
                graduacaoAtual={usuario.graduacao}
                onSelect={(graduacao) => {
                  setUsuario((prev) =>
                    prev ? { ...prev, graduacao: graduacao } : prev
                  );
                }}
              />
            ) : (
              <Text style={styles.infoValue}>
                {formatarGraduacao(usuario.graduacao, usuario.modalidade)}
              </Text>
            )}
          </View>

          {editando && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSalvarPerfil}
            >
              <Ionicons name="save" size={20} color="#000" />
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="people" size={20} color="#B8860B" />
            <Text style={styles.sectionTitle}>ALUNOS CADASTRADOS</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => { setFilhoEmEdicao(null); setModalFilho(true); }}
          >
            <Ionicons name="add" size={20} color="#B8860B" />
            <Text style={styles.addButtonText}>Adicionar</Text>
          </TouchableOpacity>
        </View>

        {usuario.filhos && usuario.filhos.length > 0 ? (
          usuario.filhos.map((filho) => (
            <View key={filho.id} style={styles.filhoCard}>
              <View style={styles.filhoHeader}>
                <View style={styles.filhoInfoHeader}>
                  <Text style={styles.filhoName}>{filho.nome}</Text>
                  {filho.idade && (
                    <Text style={styles.filhoIdade}>{filho.idade} anos</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.editIconButton}
                  onPress={() => handleEditarFilho(filho)}
                >
                  <Ionicons name="create-outline" size={18} color="#B8860B" />
                </TouchableOpacity>
              </View>

              <View style={styles.filhoContent}>
                <View style={styles.filhoBadges}>
                  <View
                    style={[
                      styles.modalidadeBadge,
                      {
                        backgroundColor:
                          filho.modalidade === "Muay Thai" ? "#dc2626" : "#1e40af",
                      },
                    ]}
                  >
                    <Text style={styles.modalidadeBadgeText}>
                      {filho.modalidade}
                    </Text>
                  </View>
                  <Text style={styles.filhoGraduacao}>
                    {formatarGraduacao(filho.graduacao, filho.modalidade)}
                  </Text>
                </View>

                <Text style={styles.filhoData}>
                  Registrado em: {formatarData(filho.dataDeRegistro)}
                </Text>

                {filho.observacao ? (
                  <Text style={styles.filhoObservacao}>{filho.observacao}</Text>
                ) : null}

                <View style={styles.pagamentoSection}>
                  <Text style={styles.infoLabel}>Status do Pagamento:</Text>
                  <GerenciarPagamento
                    item={filho}
                    usuarioId={usuario.id}
                    onPagamentoAtualizado={handlePagamentoAtualizado}
                    tipo="filho"
                  />
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#666" />
            <Text style={styles.emptyStateText}>Nenhum aluno cadastrado</Text>
            <Text style={styles.emptyStateSubtext}>
              Clique em "Adicionar" para cadastrar um aluno
            </Text>
          </View>
        )}
      </View>

      <ModalFilho
        visible={modalFilho}
        filhoEmEdicao={filhoEmEdicao}
        onClose={() => {
          setModalFilho(false);
          setFilhoEmEdicao(null);
        }}
        onAdicionarFilho={async (filhoData) => {
          if (!usuario?.id) return;

          const filhoCompleto: Filho = {
            ...filhoData,
            id: Date.now().toString(),
          };

          const userRef = doc(db, "usuarios", usuario.id);
          const novosFilhos = [...(usuario.filhos || []), filhoCompleto];
          await updateDoc(userRef, { filhos: novosFilhos });
          setUsuario((prev) => (prev ? { ...prev, filhos: novosFilhos } : prev));
        }}
        onSalvarEdicaoFilho={async (filhoEditado) => {
          if (!usuario?.id) return;

          const userRef = doc(db, "usuarios", usuario.id);
          const novosFilhos = (usuario.filhos || []).map((f) =>
            f.id === filhoEditado.id ? filhoEditado : f
          );
          await updateDoc(userRef, { filhos: novosFilhos });
          setUsuario((prev) => (prev ? { ...prev, filhos: novosFilhos } : prev));
        }}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 20,
  },
  header: {
    backgroundColor: "#000",
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#B8860B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#DAA520",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
    textAlign: "center",
  },
  userGraduacao: {
    fontSize: 16,
    color: "#B8860B",
    fontWeight: "600",
    marginBottom: 4,
  },
  userModalidade: {
    fontSize: 14,
    color: "#CCC",
    marginBottom: 12,
  },
  pagamentoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pagamentoHeaderText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#B8860B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    fontSize: 14,
    color: "#B8860B",
    fontWeight: "600",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    fontSize: 14,
    color: "#B8860B",
    fontWeight: "600",
  },
  editIconButton: {
    padding: 8,
  },
  infoCard: {
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  infoField: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    color: "#B8860B",
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    padding: 12,
    color: "#FFF",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  modalidadeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#B8860B",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  filhoCard: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#B8860B",
    borderWidth: 1,
    borderColor: "#333",
  },
  filhoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  filhoInfoHeader: {
    flex: 1,
  },
  filhoName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  filhoIdade: {
    fontSize: 14,
    color: "#B8860B",
    fontWeight: "500",
  },
  filhoContent: {
    gap: 8,
  },
  filhoBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  modalidadeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalidadeBadgeText: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "600",
  },
  filhoGraduacao: {
    fontSize: 14,
    color: "#B8860B",
    fontWeight: "500",
  },
  filhoData: {
    fontSize: 12,
    color: "#888",
  },
  filhoObservacao: {
    fontSize: 14,
    color: "#CCC",
    fontStyle: "italic",
    marginTop: 4,
  },
  pagamentoSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  emptyState: {
    backgroundColor: "#1a1a1a",
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#333",
    borderStyle: "dashed",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#CCC",
    fontWeight: "600",
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  loadingText: {
    color: "#B8860B",
    fontSize: 16,
    fontWeight: "500",
  },
  errorText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  errorSubtext: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
  warningButton: {
    backgroundColor: "#ef4444",
  },
  warningButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  modalidadeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalidadeButtonSelected: {
    backgroundColor: '#B8860B',
    borderColor: '#DAA520',
  },
  modalidadeButtonText: {
    color: '#CCC',
    fontWeight: '500',
    fontSize: 14,
  },
  modalidadeButtonTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
});