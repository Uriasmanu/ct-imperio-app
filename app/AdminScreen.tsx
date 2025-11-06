import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
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
  ModalidadeUsuario,
  Usuario,
} from "../types/usuarios";

export default function perfilScreen() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [editando, setEditando] = useState(false);
  const [modalFilho, setModalFilho] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [atualizacao, setAtualizacao] = useState(0);
  const [filhoEmEdicao, setFilhoEmEdicao] = useState<Filho | null>(null);

  // Carregar usuário (mantenha a mesma função)
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

  // Funções para gerenciar modalidades do usuário
  const adicionarModalidadeUsuario = (modalidade: ModalidadeUsuario['nome']) => {
    if (!usuario) return;

    const modalidadeExistente = usuario.modalidades.find(m => m.nome === modalidade);
    if (modalidadeExistente) return;

    const novaModalidade: ModalidadeUsuario = {
      nome: modalidade,
      ativa: true,
      graduacao: modalidade === "Muay Thai" 
        ? { cor: "Branca", pontaBranca: false }
        : { cor: "Branca", grau: 1 }
    };

    setUsuario(prev => prev ? {
      ...prev,
      modalidades: [...prev.modalidades, novaModalidade]
    } : prev);
  };

  const removerModalidadeUsuario = (modalidadeNome: string) => {
    if (!usuario) return;
    
    setUsuario(prev => prev ? {
      ...prev,
      modalidades: prev.modalidades.filter(m => m.nome !== modalidadeNome)
    } : prev);
  };

  const atualizarGraduacaoUsuario = (modalidadeNome: string, graduacao: GraduacaoMuayThai | GraduacaoJiuJitsu) => {
    if (!usuario) return;

    setUsuario(prev => prev ? {
      ...prev,
      modalidades: prev.modalidades.map(m => 
        m.nome === modalidadeNome ? { ...m, graduacao } : m
      )
    } : prev);
  };

  // Função para salvar perfil atualizada
  const handleSalvarPerfil = async () => {
    if (!usuario?.id) {
      Alert.alert("Erro", "Usuário não encontrado.");
      return;
    }

    if (usuario.modalidades.length === 0) {
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

  // Função para formatar graduação
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

  // Função para renderizar modalidades ativas no header
  const renderModalidadesHeader = () => {
    if (!usuario?.modalidades.length) return "Sem modalidades";

    return usuario.modalidades
      .filter(m => m.ativa)
      .map(m => m.nome)
      .join(", ");
  };

  // Função para renderizar as modalidades do usuário em edição
  const renderModalidadesUsuario = () => {
    if (!usuario) return null;

    return (
      <View style={styles.infoField}>
        <Text style={styles.infoLabel}>Modalidades</Text>
        {editando ? (
          <View>
            <View style={styles.modalidadeGrid}>
              {["Jiu-Jitsu", "Muay Thai", "Boxe", "MMA"].map((mod) => {
                const modalidadeAtiva = usuario.modalidades.find(m => m.nome === mod);
                return (
                  <TouchableOpacity
                    key={mod}
                    style={[
                      styles.modalidadeButton,
                      modalidadeAtiva && styles.modalidadeButtonSelected,
                    ]}
                    onPress={() => {
                      if (modalidadeAtiva) {
                        removerModalidadeUsuario(mod);
                      } else {
                        adicionarModalidadeUsuario(mod as ModalidadeUsuario['nome']);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.modalidadeButtonText,
                        modalidadeAtiva && styles.modalidadeButtonTextSelected,
                      ]}
                    >
                      {mod} {modalidadeAtiva ? "✓" : "+"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Seletores de graduação para cada modalidade ativa */}
            {usuario.modalidades.map((modalidade) => (
              <View key={modalidade.nome} style={styles.modalidadeContainer}>
                <Text style={styles.modalidadeTitle}>{modalidade.nome}</Text>
                <GraduacaoSelector
                  modalidade={modalidade.nome}
                  graduacaoAtual={modalidade.graduacao}
                  onSelect={(graduacao) => {
                    atualizarGraduacaoUsuario(modalidade.nome, graduacao);
                  }}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.modalidadesList}>
            {usuario.modalidades.map((modalidade) => (
              <View key={modalidade.nome} style={styles.modalidadeItem}>
                <Text style={styles.modalidadeNome}>{modalidade.nome}</Text>
                <Text style={styles.modalidadeGraduacao}>
                  {formatarGraduacao(modalidade.graduacao, modalidade.nome)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Atualize a renderização do filho para mostrar múltiplas modalidades
  const renderFilhoModalidades = (filho: Filho) => {
    return (
      <View style={styles.filhoModalidades}>
        {filho.modalidades.map((modalidade) => (
          <View key={modalidade.nome} style={styles.modalidadeBadgeContainer}>
            <View
              style={[
                styles.modalidadeBadge,
                {
                  backgroundColor:
                    modalidade.nome === "Muay Thai" ? "#dc2626" : 
                    modalidade.nome === "Jiu-Jitsu" ? "#1e40af" :
                    modalidade.nome === "Boxe" ? "#059669" : "#7c3aed",
                },
              ]}
            >
              <Text style={styles.modalidadeBadgeText}>
                {modalidade.nome}
              </Text>
            </View>
            <Text style={styles.filhoGraduacao}>
              {formatarGraduacao(modalidade.graduacao, modalidade.nome)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Restante do componente mantém a mesma estrutura, mas atualize onde mostra modalidades:

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
        <Text style={styles.userModalidades}>{renderModalidadesHeader()}</Text>

        {/* Mostrar primeira graduação como exemplo no header */}
        {usuario.modalidades.length > 0 && (
          <Text style={styles.userGraduacao}>
            {formatarGraduacao(usuario.modalidades[0].graduacao, usuario.modalidades[0].nome)}
            {usuario.modalidades.length > 1 && ` +${usuario.modalidades.length - 1}`}
          </Text>
        )}

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

          {renderModalidadesUsuario()}

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
                {renderFilhoModalidades(filho)}

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