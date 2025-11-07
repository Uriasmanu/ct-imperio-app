import { Ionicons } from "@expo/vector-icons";
import { doc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
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

import { ModalFilho } from "@/components/perfil/ModalFilho";
import { MultiModalidadeSelector } from "@/components/perfil/MultiModalidadeSelector";
import { GerenciarPagamento } from "@/components/perfil/Pagamento/GerenciarPagamento";
import { db } from "@/config/firebaseConfig";

import { PresencaSection } from "@/components/perfil/PresencaSection";
import { useAuth } from "@/hooks/useAuth";
import {
  Filho,
  GraduacaoJiuJitsu,
  GraduacaoMuayThai
} from "../types/usuarios";

export default function perfilScreen() {
  const [editando, setEditando] = useState(false);
  const [modalFilho, setModalFilho] = useState(false);
  const [filhoEmEdicao, setFilhoEmEdicao] = useState<Filho | null>(null);
  const [usuarioNaoEncontrado, setUsuarioNaoEncontrado] = useState(false);

  const {
    usuario,
    setUsuario: atualizarUsuario,
    loading,
    refreshing,
    onRefresh,
    handlePagamentoAtualizado,
    adicionarFilho,
    editarFilho,
  } = useAuth();


  const handleSalvarPerfil = async () => {
    if (!usuario?.id) {
      Alert.alert("Erro", "Usuário não encontrado.");
      return;
    }

    if (!usuario.modalidades || usuario.modalidades.length === 0) {
      Alert.alert("Campo obrigatório", "Selecione pelo menos uma modalidade antes de salvar.");
      return;
    }

    try {
      const userRef = doc(db, "usuarios", usuario.id);
      await updateDoc(userRef, {
        nome: usuario.nome ?? "",
        email: usuario.email ?? "",
        telefone: usuario.telefone ?? "",
        observacao: usuario.observacao ?? "",
        modalidades: usuario.modalidades ?? [],
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

  const renderModalidadesUsuario = () => {
    if (!usuario?.modalidades || usuario.modalidades.length === 0) {
      return <Text style={styles.infoValue}>Nenhuma modalidade selecionada</Text>;
    }

    return (
      <View style={styles.modalidadesList}>
        {usuario.modalidades.map((modalidadeAluno, index) => (
          <View key={`${modalidadeAluno.modalidade}-${index}`} style={styles.modalidadeItem}>
            <View style={styles.modalidadeHeader}>
              <Text style={styles.modalidadeNome}>{modalidadeAluno.modalidade}</Text>
              <Text style={styles.modalidadeStatus}>
                {modalidadeAluno.ativo ? '✅ Ativo' : '⏸️ Inativo'}
              </Text>
            </View>
            <Text style={styles.modalidadeGraduacao}>
              {formatarGraduacao(modalidadeAluno.graduacao, modalidadeAluno.modalidade)}
            </Text>
            <Text style={styles.modalidadeData}>
              Desde: {formatarData(modalidadeAluno.dataInicio)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderFilhoModalidades = (filho: Filho) => {
    if (!filho.modalidades || filho.modalidades.length === 0) {
      return <Text style={styles.filhoGraduacao}>Sem modalidades</Text>;
    }

    return (
      <View style={styles.filhoModalidades}>
        {filho.modalidades.map((modalidadeAluno, index) => (
          <View key={`${modalidadeAluno.modalidade}-${index}`} style={styles.filhoModalidadeItem}>
            <View
              style={[
                styles.modalidadeBadge,
                {
                  backgroundColor:
                    modalidadeAluno.modalidade === "Muay Thai" ? "#dc2626" :
                      modalidadeAluno.modalidade === "Jiu-Jitsu" ? "#1e40af" :
                        modalidadeAluno.modalidade === "Boxe" ? "#059669" : "#7c3aed",
                },
              ]}
            >
              <Text style={styles.modalidadeBadgeText}>
                {modalidadeAluno.modalidade}
              </Text>
            </View>
            <Text style={styles.filhoGraduacao}>
              {formatarGraduacao(modalidadeAluno.graduacao, modalidadeAluno.modalidade)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderInfoField = (label: string, value: string, editable?: boolean, key?: string) => (
    <View style={styles.infoField} key={key}>
      <Text style={styles.infoLabel}>{label}</Text>
      {editable && editando ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => {
            if (usuario && key) {
              atualizarUsuario({ ...usuario, [key]: text });
            }
          }}
          placeholderTextColor="#666"
        />
      ) : (
        <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
          {value || "Não informado"}
        </Text>
      )}
    </View>
  );

  const getPrimeiraModalidadeAtiva = () => {
    if (!usuario?.modalidades || usuario.modalidades.length === 0) return "Sem modalidade";
    const ativa = usuario.modalidades.find(m => m.ativo);
    return ativa ? ativa.modalidade : usuario.modalidades[0].modalidade;
  };

  const getPrimeiraGraduacaoAtiva = () => {
    if (!usuario?.modalidades || usuario.modalidades.length === 0) return undefined;
    const ativa = usuario.modalidades.find(m => m.ativo);
    return ativa ? ativa.graduacao : usuario.modalidades[0].graduacao;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B8860B" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
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
      {/* CABEÇALHO DO USUÁRIO */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {usuario?.nome?.split(" ").map(n => n[0]).join("").toUpperCase() ?? ""}
          </Text>
        </View>
        <Text style={styles.userName}>{usuario?.nome ?? ""}</Text>
        <Text style={styles.userGraduacao}>
          {formatarGraduacao(getPrimeiraGraduacaoAtiva(), getPrimeiraModalidadeAtiva())}
        </Text>
        <Text style={styles.userModalidade}>
          {usuario?.modalidades?.length && usuario.modalidades.length > 1
            ? `${usuario.modalidades.length} modalidades`
            : getPrimeiraModalidadeAtiva()}
        </Text>

        <View style={styles.pagamentoHeader}>
          <Ionicons
            name={usuario?.pagamento ? "checkmark-circle" : "alert-circle"}
            size={16}
            color={usuario?.pagamento ? "#22c55e" : "#ef4444"}
          />
          <Text style={[styles.pagamentoHeaderText, { color: usuario?.pagamento ? "#22c55e" : "#ef4444" }]}>
            {usuario?.pagamento ? "Pagamento em dia" : "Pagamento pendente"}
          </Text>
        </View>
      </View>

      {/* INFORMAÇÕES PESSOAIS */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="person" size={20} color="#B8860B" />
            <Text style={styles.sectionTitle}>INFORMAÇÕES PESSOAIS</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => setEditando(!editando)}>
            <Ionicons name={editando ? "close" : "create-outline"} size={20} color="#B8860B" />
            <Text style={styles.editButtonText}>{editando ? "Cancelar" : "Editar"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          {renderInfoField("Nome", usuario?.nome ?? "", true, "nome")}
          {renderInfoField("Email", usuario?.email ?? "", true, "email")}
          {renderInfoField("Telefone", usuario?.telefone ?? "", true, "telefone")}
          {renderInfoField("Data de Registro", usuario?.dataDeRegistro ? formatarData(usuario.dataDeRegistro) : "", false)}
          {renderInfoField("Observação", usuario?.observacao ?? "", true, "observacao")}


          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>Dia de pagamento:</Text>
            <Text style={styles.infoValue}>
              {usuario?.dataPagamento ? new Date(usuario.dataPagamento).getDate() : "-"} de cada mês
            </Text>
          </View>

          {usuario?.modalidades?.length ? (
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Status do Pagamento</Text>
              {usuario && (
                <GerenciarPagamento
                  item={usuario}
                  onPagamentoAtualizado={handlePagamentoAtualizado}
                  tipo="usuario"
                />
              )}
            </View>
          ) : null}



          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>Modalidades</Text>
            {editando ? (
              <MultiModalidadeSelector
                modalidades={usuario?.modalidades || []}
                onModalidadesChange={(modalidades) => {
                  if (usuario) atualizarUsuario({ ...usuario, modalidades });
                }}
              />
            ) : (
              renderModalidadesUsuario()
            )}
          </View>

          {editando && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSalvarPerfil}>
              <Ionicons name="save" size={20} color="#000" />
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {usuario?.modalidades?.length ? (
        <View style={styles.section}>
          <PresencaSection />
        </View>
      ) : null}

      {/* FILHOS */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="people" size={20} color="#B8860B" />
            <Text style={styles.sectionTitle}>FILHOS CADASTRADOS</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => { setFilhoEmEdicao(null); setModalFilho(true); }}
          >
            <Ionicons name="add" size={20} color="#B8860B" />
            <Text style={styles.addButtonText}>Adicionar</Text>
          </TouchableOpacity>
        </View>

        {usuario?.filhos?.length ? (
          usuario.filhos.map(filho => (
            <View key={filho.id} style={styles.filhoCard}>
              <View style={styles.filhoHeader}>
                <View style={styles.filhoInfoHeader}>
                  <Text style={styles.filhoName}>{filho.nome}</Text>
                  {filho.idade && <Text style={styles.filhoIdade}>{filho.idade} anos</Text>}
                </View>
                <TouchableOpacity style={styles.editIconButton} onPress={() => handleEditarFilho(filho)}>
                  <Ionicons name="create-outline" size={18} color="#B8860B" />
                </TouchableOpacity>
              </View>

              <View style={styles.filhoContent}>
                {renderFilhoModalidades(filho)}
                <Text style={styles.filhoData}>Registrado em: {formatarData(filho.dataDeRegistro)}</Text>
                {filho.observacao && <Text style={styles.filhoObservacao}>{filho.observacao}</Text>}

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
            <Text style={styles.emptyStateSubtext}>Clique em "Adicionar" para cadastrar um aluno</Text>
          </View>
        )}
      </View>

      {/* MODAL FILHO */}
      <ModalFilho
        visible={modalFilho}
        filhoEmEdicao={filhoEmEdicao}
        onClose={() => { setModalFilho(false); setFilhoEmEdicao(null); }}
        onAdicionarFilho={async (filhoData) => {
          const sucesso = await adicionarFilho(filhoData);
          Alert.alert(sucesso ? "Sucesso" : "Erro", sucesso ? "Aluno adicionado com sucesso!" : "Não foi possível adicionar o aluno.");
        }}
        onSalvarEdicaoFilho={async (filhoEditado) => {
          const sucesso = await editarFilho(filhoEditado);
          Alert.alert(sucesso ? "Sucesso" : "Erro", sucesso ? "Aluno atualizado com sucesso!" : "Não foi possível atualizar o aluno.");
        }}
      />
    </ScrollView>
  );
}

// --------- STYLES (mesmos que você já tinha) ---------
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
  modalidadesList: {
    gap: 12,
  },
  modalidadeItem: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalidadeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalidadeNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  modalidadeStatus: {
    fontSize: 12,
    color: '#888',
  },
  modalidadeGraduacao: {
    fontSize: 14,
    color: '#B8860B',
    fontWeight: '500',
    marginBottom: 4,
  },
  modalidadeData: {
    fontSize: 12,
    color: '#666',
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
  filhoModalidades: {
    gap: 8,
  },
  filhoModalidadeItem: {
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
});
