import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "@/config/firebaseConfig";
import { graduaçõesJiuJitsu, graduaçõesMuayThai } from "@/types/graduacoes";
import {
  Filho,
  GraduacaoJiuJitsu,
  GraduacaoMuayThai,
  Usuario,
} from "../types/usuarios"; // Assumindo este caminho

// --- CONSTANTES DE TEMA ---
const COLOR_PRIMARY = "#FFD700"; // Dourado forte, substitui B8860B em alguns locais para contraste
const COLOR_SECONDARY = "#B8860B"; // Goldenrod (Bronzde/Dourado mais suave)
const COLOR_BACKGROUND = "#121212"; // Quase preto (melhor que #000 para Dark Mode)
const COLOR_CARD_BACKGROUND = "#1e1e1e"; // Cinza escuro para cards/superfícies
const COLOR_TEXT_HIGH = "#FFFFFF"; // Branco puro para textos principais (alto contraste)
const COLOR_TEXT_LOW = "#CCCCCC"; // Cinza claro para textos de baixo destaque
const COLOR_SUCCESS = "#008000"; // Verde para Sucesso
const COLOR_ERROR = "#8B0000"; // Vermelho escuro para Erro/Pendente

// --- GRADUAÇÃO SELECTOR (Mantido e Estilizado) ---

interface GraduacaoSelectorProps {
  modalidade: string;
  graduacaoAtual: GraduacaoMuayThai | GraduacaoJiuJitsu | undefined;
  onSelect: (grad: GraduacaoMuayThai | GraduacaoJiuJitsu) => void;
}

const GraduacaoSelector: React.FC<GraduacaoSelectorProps> = ({
  modalidade,
  graduacaoAtual,
  onSelect,
}) => {
  if (modalidade === "Jiu-Jitsu") {
    const atual = graduacaoAtual as GraduacaoJiuJitsu;
    const faixasUnicas = Array.from(new Set(graduaçõesJiuJitsu.map(g => g.cor))).map(cor =>
      graduaçõesJiuJitsu.find(g => g.cor === cor)
    ).filter((g): g is GraduacaoJiuJitsu => !!g);

    const faixaSelecionada = atual?.cor || faixasUnicas[0]?.cor;
    const grausDaFaixa = graduaçõesJiuJitsu
      .filter(g => g.cor === faixaSelecionada)
      .sort((a, b) => (a.grau ?? 0) - (b.grau ?? 0));
    return (
      <View style={styles.graduacaoContainer}>
        {/* Seleção de Faixa */}
        <Text style={styles.modalLabel}>Faixa:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {faixasUnicas.map((grad) => (
            <TouchableOpacity
              key={grad.cor}
              style={[
                styles.grauButton,
                faixaSelecionada === grad.cor && styles.modalidadeButtonSelected,
              ]}
              onPress={() => {
                const novoGrau = grausDaFaixa.find(g => g.cor === grad.cor && g.grau === atual?.grau) ? atual.grau : 1;
                onSelect({ cor: grad.cor, grau: novoGrau } as GraduacaoJiuJitsu);
              }}
            >
              <Text style={[
                styles.modalidadeButtonText,
                faixaSelecionada === grad.cor && styles.modalidadeButtonTextSelected,
              ]}>
                {grad.cor}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Seleção de Grau (Visível apenas se houver uma faixa selecionada e graus > 1) */}
        {grausDaFaixa.length > 1 && (
          <>
            <Text style={[styles.modalLabel, { marginTop: 12 }]}>Grau:</Text>
            <View style={styles.grauButtonsContainer}>
              {grausDaFaixa.map((grad) => (
                <TouchableOpacity
                  key={`${grad.cor}-${grad.grau}`}
                  style={[
                    styles.grauButton,
                    atual?.cor === grad.cor && atual?.grau === grad.grau && styles.modalidadeButtonSelected,
                  ]}
                  onPress={() => onSelect(grad)}
                >
                  <Text style={[
                    styles.modalidadeButtonText,
                    atual?.cor === grad.cor && atual?.grau === grad.grau && styles.modalidadeButtonTextSelected,
                  ]}>
                    {grad.grau}º
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    );
  } else if (modalidade === "Muay Thai") {
    const atual = graduacaoAtual as GraduacaoMuayThai;
    return (
      <View style={styles.graduacaoContainer}>
        <Text style={styles.modalLabel}>Grau (Kruang):</Text>
        <View style={styles.grauButtonsContainer}>
          {graduaçõesMuayThai.map((grad) => (
            <TouchableOpacity
              key={`${grad.cor}-${grad.pontaBranca ? "P" : "S"}`}
              style={[
                styles.grauButton,
                atual?.cor === grad.cor && atual?.pontaBranca === grad.pontaBranca && styles.modalidadeButtonSelected,
              ]}
              onPress={() => onSelect(grad)}
            >
              <Text style={[
                styles.modalidadeButtonText,
                atual?.cor === grad.cor && atual?.pontaBranca === grad.pontaBranca && styles.modalidadeButtonTextSelected,
              ]}>
                {grad.cor} {grad.pontaBranca ? " (PB)" : ""}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return <Text style={styles.infoValue}>Modalidade sem graduação definida.</Text>;
};

const hoje = new Date();
const dataPagamentoPadrao = new Date(hoje.getFullYear(), hoje.getMonth(), 10).toISOString();

// --- PERFIL SCREEN ---

export default function PerfilScreen() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [editando, setEditando] = useState(false);
  const [modalFilho, setModalFilho] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🆕 ESTADO PARA EDIÇÃO: Armazena o filho que está sendo editado
  const [filhoEmEdicao, setFilhoEmEdicao] = useState<Filho | null>(null);

  const [novoFilho, setNovoFilho] = useState<Partial<Filho>>({
    nome: "",
    modalidade: "Jiu-Jitsu",
    graduacao: { cor: "Branca", grau: 1 },
  });

  // ... [useEffect para carregar usuário e verificarPagamentosFilhos - MANTIDO] ...

  const verificarPagamentosFilhos = async () => {
    if (!usuario?.id || !usuario.filhos) return;

    const hoje = new Date();
    let atualizou = false;

    const filhosAtualizados = usuario.filhos.map(filho => {
      // Verifica se o pagamento está vencido (30 dias)
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
    // Busca o usuário autenticado e seus dados no Firestore
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "usuarios", user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setUsuario(snap.data() as Usuario);
          } else {
            Alert.alert("Erro", "Usuário não encontrado no banco de dados.");
          }
        } catch (error) {
          console.error(error);
          Alert.alert("Erro", "Não foi possível carregar os dados do usuário.");
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);
  
  useEffect(() => {
    // Roda a verificação de pagamentos sempre que o usuário for carregado/atualizado
    if(usuario) verificarPagamentosFilhos();
  }, [usuario?.filhos, usuario?.id]);


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

  // 🔹 Atualiza os dados pessoais no Firestore
  const handleSalvarPerfil = async () => {
    if (!usuario?.id) {
      Alert.alert("Erro", "Usuário não encontrado. Tente novamente.");
      return;
    }

    if (!usuario.modalidade || !usuario.graduacao) {
      Alert.alert("Campo obrigatório", "Verifique se Modalidade e Graduação estão definidos.");
      return;
    }

    try {
      const userRef = doc(db, "usuarios", usuario.id);

      await updateDoc(userRef, {
        nome: usuario.nome ?? "",
        email: usuario.email ?? "",
        telefone: usuario.telefone ?? "",
        observacao: usuario.observacao ?? "",
        modalidade: usuario.modalidade,
        graduacao: usuario.graduacao,
        // Mantém a lógica de atualização da data de pagamento para o próprio usuário
        dataUltimoPagamento: usuario.pagamento ? new Date().toISOString() : "",
      });

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      setEditando(false);
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Erro ao salvar",
        "Não foi possível salvar as alterações. Verifique os campos e tente novamente."
      );
    }
  };


  // 🔹 Adiciona um novo filho ao usuário
  const handleAdicionarFilho = async () => {
    if (!usuario?.id) {
      Alert.alert("Erro", "Usuário não encontrado. Tente fazer login novamente.");
      return;
    }
    
    // UX: Validação de campos obrigatórios
    if (!novoFilho.nome?.trim() || !novoFilho.idade) {
        Alert.alert("Campos obrigatórios", "Por favor, informe o nome e a idade do filho.");
        return;
    }

    // 🔧 Construção segura do objeto Filho
    const filhoCompleto: Filho = {
      id: Date.now().toString(),
      nome: novoFilho.nome.trim(),
      idade: Number(novoFilho.idade),
      modalidade: novoFilho.modalidade ?? "Jiu-Jitsu",
      graduacao:
        novoFilho.graduacao ||
        (novoFilho.modalidade === "Muay Thai"
          ? { cor: "Amarela" }
          : { cor: "Branca", grau: 1 }),
      dataDeRegistro: new Date().toISOString().split("T")[0],
      pagamento: novoFilho.pagamento ?? false,
      observacao: novoFilho.observacao?.trim() || "",
      dataPagamento: novoFilho.dataPagamento || dataPagamentoPadrao, // Usa o padrão se não for definido
      dataUltimoPagamento: novoFilho.pagamento ? new Date().toISOString() : "",
    };

    try {
      const userRef = doc(db, "usuarios", usuario.id);
      const novosFilhos = [...(usuario.filhos || []), filhoCompleto];
      await updateDoc(userRef, { filhos: novosFilhos });

      setUsuario((prev) => (prev ? { ...prev, filhos: novosFilhos } : prev));
      setModalFilho(false);
      setNovoFilho({
        nome: "",
        modalidade: "Jiu-Jitsu",
        graduacao: { cor: "Branca", grau: 1 },
      });

      Alert.alert("Sucesso", `${filhoCompleto.nome} foi adicionado com sucesso!`);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível adicionar o filho. Tente novamente.");
    }
  };


  // 🆕 FUNÇÃO: Inicia a edição de um filho
  const handleEditarFilho = (filho: Filho) => {
    setFilhoEmEdicao(filho);
    setModalFilho(true);
  };

  // 🆕 FUNÇÃO: Salva as alterações de um filho no Firestore (APENAS DADOS)
  const handleSalvarEdicaoFilho = async () => {
    if (!filhoEmEdicao || !usuario?.id) return;
    
    // UX: Validação
    if (!filhoEmEdicao.nome?.trim() || !filhoEmEdicao.idade) {
        Alert.alert("Campos obrigatórios", "O nome e a idade são obrigatórios.");
        return;
    }
    if (!filhoEmEdicao.graduacao) {
        Alert.alert("Incompleto", "A graduação deve ser selecionada.");
        return;
    }

    try {
      const userRef = doc(db, "usuarios", usuario.id);

      // Mapeia a lista de filhos, substituindo o filho editado
      const novosFilhos = (usuario.filhos || []).map((f) =>
        f.id === filhoEmEdicao.id ? filhoEmEdicao : f
      );

      await updateDoc(userRef, { filhos: novosFilhos });

      setUsuario((prev) => (prev ? { ...prev, filhos: novosFilhos } : prev));
      // Fechar modal e resetar estados
      setModalFilho(false);
      setFilhoEmEdicao(null);

      Alert.alert("Sucesso", "Informações do filho atualizadas com sucesso!");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar as alterações do filho.");
    }
  };
  
  // 🆕 FUNÇÃO: Altera o status de pagamento de um filho (AÇÃO SEPARADA)
  const handleConfirmarPagamentoFilho = async (filhoId: string, statusAtual: boolean) => {
    if (!usuario?.id) return;

    // UX: Confirmação para evitar cliques acidentais
    Alert.alert(
      statusAtual ? "Marcar como Pendente?" : "Confirmar Pagamento?",
      `Tem certeza que deseja mudar o status de pagamento para ${statusAtual ? "Pendente" : "Pago"}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: statusAtual ? "Marcar Pendente" : "Confirmar",
          onPress: async () => {
            try {
              const userRef = doc(db, "usuarios", usuario.id);
              const novosFilhos = (usuario.filhos || []).map((f) => {
                if (f.id === filhoId) {
                  const novoStatus = !statusAtual;
                  return {
                    ...f,
                    pagamento: novoStatus,
                    // Atualiza data apenas se for marcar como Pago
                    dataUltimoPagamento: novoStatus ? new Date().toISOString() : f.dataUltimoPagamento,
                  };
                }
                return f;
              });

              await updateDoc(userRef, { filhos: novosFilhos });

              setUsuario((prev) => (prev ? { ...prev, filhos: novosFilhos } : prev));
              Alert.alert("Sucesso", `Pagamento atualizado para ${statusAtual ? "Pendente" : "Pago"}!`);
            } catch (error) {
              console.error(error);
              Alert.alert("Erro", "Não foi possível atualizar o pagamento.");
            }
          },
        },
      ]
    );
  };


  const renderInfoField = (label: string, value: string, editable?: boolean, keyToUpdate?: keyof Usuario, keyboardType: 'default' | 'numeric' = 'default') => (
    <View style={styles.infoField}>
      <Text style={styles.infoLabel}>{label}</Text>
      {editable && editando ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) =>
            keyToUpdate && setUsuario((prev) => (prev ? { ...prev, [keyToUpdate]: text } : prev))
          }
          keyboardType={keyboardType}
          placeholder={`Digite o ${label.toLowerCase()}`}
          placeholderTextColor={COLOR_TEXT_LOW}
        />
      ) : (
        <Text style={styles.infoValue}>{value || "Não informado"}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLOR_BACKGROUND, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: COLOR_TEXT_HIGH }}>Carregando...</Text>
      </View>
    );
  }

  if (!usuario) {
    return (
      <View style={{ flex: 1, backgroundColor: COLOR_BACKGROUND, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: COLOR_TEXT_HIGH }}>Usuário não encontrado 😕</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header do Perfil */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {usuario.nome.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)}
          </Text>
        </View>
        <Text style={styles.userName}>{usuario.nome}</Text>
        <Text style={styles.userGraduacao}>
          {formatarGraduacao(usuario.graduacao, usuario.modalidade)}
        </Text>
        <Text style={styles.userModalidade}>{usuario.modalidade}</Text>
      </View>

      {/* Informações Pessoais */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>INFORMAÇÕES PESSOAIS</Text>
          <TouchableOpacity onPress={() => setEditando(!editando)}>
            <Text style={styles.editButton}>
              {editando ? "Cancelar" : "Editar"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          {renderInfoField("Nome", usuario.nome, true, "nome")}
          {renderInfoField("Email", usuario.email, true, "email")}
          {renderInfoField("Telefone", usuario.telefone || "", true, "telefone", 'numeric')}
          {renderInfoField("Data de Registro", formatarData(usuario.dataDeRegistro))}
          {renderInfoField("Observação", usuario.observacao || "", true, "observacao")}

          {/* ✅ CAMPO DE PAGAMENTO DO USUÁRIO */}
          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>Dia de pagamento:</Text>
            <Text style={styles.infoValue}>
              {new Date(usuario.dataPagamento).getDate()} de cada mês
            </Text>
            
            <Text style={[styles.infoLabel, {marginTop: 10}]}>Status Pagamento:</Text>
            {editando ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity
                  style={[
                    styles.modalidadeButton,
                    usuario.pagamento ? styles.pagoButton : styles.pendenteButton,
                    { flex: 0.4, minWidth: 100 }
                  ]}
                  onPress={() => setUsuario(prev => {
                    if (!prev) return prev;
                    const novoStatus = !prev.pagamento;
                    return {
                      ...prev,
                      pagamento: novoStatus,
                      dataUltimoPagamento: novoStatus ? new Date().toISOString() : prev.dataUltimoPagamento,
                    };
                  })}
                >
                  <Text style={styles.pagamentoButtonText}>
                    {usuario.pagamento ? "Pago" : "Pendente"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[styles.infoValue, {color: usuario.pagamento ? COLOR_SUCCESS : COLOR_ERROR}]}>
                {usuario.pagamento ? "Pago" : "Pendente"}
              </Text>
            )}
          </View>

          {/* Modalidade editável */}
          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>Modalidade</Text>
            {editando ? (
              <View style={styles.modalidadeGroup}>
                {/* Otimizando os botões de modalidade */}
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

          {/* Graduação editável (NOVO COMPONENTE APLICADO) */}
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
              <Text style={styles.infoValue}>{formatarGraduacao(usuario.graduacao, usuario.modalidade)}</Text>
            )}
          </View>

          {editando && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSalvarPerfil}>
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Seção de Filhos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FILHOS CADASTRADOS</Text>
          <TouchableOpacity onPress={() => { setFilhoEmEdicao(null); setModalFilho(true); }}>
            <Text style={styles.addButton}>+ Adicionar</Text>
          </TouchableOpacity>
        </View>

        {usuario.filhos && usuario.filhos.length > 0 ? (
          usuario.filhos.map((filho) => (
            <View key={filho.id} style={styles.filhoCard}>
              <View style={styles.filhoHeader}>
                <Text style={styles.filhoName}>{filho.nome}</Text>
                
                {/* 🆕 BOTÕES DE AÇÃO SEPARADOS */}
                <View style={styles.filhoActions}>
                    <TouchableOpacity onPress={() => handleEditarFilho(filho)}>
                        <Text style={styles.editButton}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => handleConfirmarPagamentoFilho(filho.id, filho.pagamento)}
                        style={[
                            styles.pagamentoButton,
                            filho.pagamento ? styles.pagoButton : styles.pendenteButton
                        ]}
                    >
                        <Text style={styles.pagamentoButtonText}>
                            {filho.pagamento ? "PAGO" : "PENDENTE"}
                        </Text>
                    </TouchableOpacity>
                </View>
              </View>

              <View style={styles.filhoInfo}>
                <View
                  style={[
                    styles.modalidadeBadge,
                    {
                      backgroundColor:
                        filho.modalidade === "Muay Thai" ? COLOR_ERROR : COLOR_SECONDARY,
                    },
                  ]}
                >
                  <Text style={styles.modalidadeBadgeText}>
                    {filho.modalidade}
                  </Text>
                </View>
                <Text style={[styles.filhoGraduacao, {marginTop: 8}]}>
                  {formatarGraduacao(filho.graduacao, filho.modalidade)}
                </Text>
                {filho.idade && <Text style={styles.filhoData}>Idade: {filho.idade} anos</Text>}
                <Text style={styles.filhoData}>
                  Registrado em: {formatarData(filho.dataDeRegistro)}
                </Text>
                <Text style={styles.filhoData}>
                  Dia de pagamento: {new Date(filho.dataPagamento).getDate()} de cada mês
                </Text>
                {filho.observacao && <Text style={styles.filhoData}>Observação: {filho.observacao}</Text>}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nenhum filho cadastrado</Text>
            <Text style={styles.emptyStateSubtext}>
              Clique em "Adicionar" para cadastrar um filho
            </Text>
          </View>
        )}
      </View>

      {/* Modal para Adicionar/Editar Filho */}
      <Modal
        visible={modalFilho}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalFilho(false)}
      >
        {modalFilho && (
          <ModalContent
            filhoEmEdicao={filhoEmEdicao}
            novoFilho={novoFilho}
            setFilhoEmEdicao={setFilhoEmEdicao}
            setNovoFilho={setNovoFilho}
            setModalFilho={setModalFilho}
            handleAdicionarFilho={handleAdicionarFilho}
            handleSalvarEdicaoFilho={handleSalvarEdicaoFilho}
          />
        )}
      </Modal>
    </ScrollView>
  );
}


// --- MODAL CONTENT (SEM PAGAMENTO) ---

interface ModalContentProps {
  filhoEmEdicao: Filho | null;
  novoFilho: Partial<Filho>;
  setFilhoEmEdicao: React.Dispatch<React.SetStateAction<Filho | null>>;
  setNovoFilho: React.Dispatch<React.SetStateAction<Partial<Filho>>>;
  setModalFilho: React.Dispatch<React.SetStateAction<boolean>>;
  handleAdicionarFilho: () => Promise<void>;
  handleSalvarEdicaoFilho: () => Promise<void>;
}

const ModalContent: React.FC<ModalContentProps> = ({
  filhoEmEdicao,
  novoFilho,
  setFilhoEmEdicao,
  setNovoFilho,
  setModalFilho,
  handleAdicionarFilho,
  handleSalvarEdicaoFilho,
}) => {
  // Determinar qual objeto usar para leitura e escrita
  const dadosFilho = filhoEmEdicao || novoFilho;

  const setDadosFilho = (updates: Partial<Filho> | ((prev: Partial<Filho>) => Partial<Filho>)) => {
    if (filhoEmEdicao) {
      setFilhoEmEdicao(prev => {
        const nextState = typeof updates === "function" ? updates(prev!) : updates;
        return prev ? ({ ...prev, ...nextState }) : null;
      });
    } else {
      setNovoFilho(prev => ({ ...prev, ...(typeof updates === "function" ? updates(prev) : updates) }));
    }
  };


  const modalTitle = filhoEmEdicao ? "Editar Filho" : "Adicionar Filho";
  const handleAcao = filhoEmEdicao ? handleSalvarEdicaoFilho : handleAdicionarFilho;
  const confirmButtonText = filhoEmEdicao ? "Salvar" : "Adicionar";

  const closeModal = () => {
    setModalFilho(false);
    setFilhoEmEdicao(null);
    setNovoFilho({
      nome: "",
      modalidade: "Jiu-Jitsu",
      graduacao: { cor: "Branca", grau: 1 },
    });
  };

  // Para garantir que a graduação é válida ao mudar a modalidade
  const handleModalidadeChange = (modalidade: Filho["modalidade"]) => {
    if (modalidade === "Jiu-Jitsu") {
      setDadosFilho({
        modalidade: modalidade,
        graduacao: { cor: "Branca", grau: 1 }
      });
    } else if (modalidade === "Muay Thai") {
      setDadosFilho({
        modalidade: modalidade,
        graduacao: { cor: "Amarela" } // Primeiro kruang
      });
    } else {
      setDadosFilho({
        modalidade: modalidade,
        graduacao: undefined
      });
    }
  };


  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{modalTitle}</Text>

        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {/* Nome */}
          <TextInput
            style={styles.modalInput}
            placeholder="Nome do filho"
            placeholderTextColor={COLOR_TEXT_LOW}
            value={dadosFilho.nome}
            onChangeText={(text) => setDadosFilho({ nome: text })}
          />

          {/* Idade */}
          <TextInput
            style={styles.modalInput}
            placeholder="Idade"
            placeholderTextColor={COLOR_TEXT_LOW}
            keyboardType="numeric"
            value={dadosFilho.idade?.toString() || ""}
            onChangeText={(text) =>
              setDadosFilho({ idade: Number(text.replace(/[^0-9]/g, '')) }) // Garante apenas números
            }
          />
          
          {/* Dia do Pagamento (Apenas dia, não o status) */}
          <View style={[styles.modalRow, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
            <Text style={styles.modalLabel}>Dia de Pagamento (Mês):</Text>
            <TextInput
                style={[styles.modalInput, {flex: 0.3, textAlign: 'center'}]}
                placeholder="10"
                placeholderTextColor={COLOR_TEXT_LOW}
                keyboardType="numeric"
                maxLength={2}
                value={dadosFilho.dataPagamento ? new Date(dadosFilho.dataPagamento).getDate().toString() : '10'}
                onChangeText={(text) => {
                    const dia = Number(text.replace(/[^0-9]/g, ''));
                    if (dia > 0 && dia <= 31) {
                        const hoje = new Date();
                        const novaData = new Date(hoje.getFullYear(), hoje.getMonth(), dia).toISOString();
                        setDadosFilho({ dataPagamento: novaData });
                    }
                }}
            />
          </View>


          {/* Observação */}
          <TextInput
            style={[styles.modalInput, {height: 80}]}
            placeholder="Observação (opcional)"
            placeholderTextColor={COLOR_TEXT_LOW}
            value={dadosFilho.observacao || ""}
            onChangeText={(text) =>
              setDadosFilho({ observacao: text })
            }
            multiline
          />

          {/* Modalidade */}
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Modalidade:</Text>
            <View style={styles.modalidadeButtons}>
              {["Jiu-Jitsu", "Muay Thai"].map(mod => (
                <TouchableOpacity
                    key={mod}
                    style={[
                        styles.modalidadeButton,
                        dadosFilho.modalidade === mod && styles.modalidadeButtonSelected,
                    ]}
                    onPress={() => handleModalidadeChange(mod as Filho["modalidade"])}
                >
                    <Text
                    style={[
                        styles.modalidadeButtonText,
                        dadosFilho.modalidade === mod && styles.modalidadeButtonTextSelected,
                    ]}
                    >
                    {mod}
                    </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Seleção de Graduação Dinâmica com o novo componente */}
          <View style={styles.modalRow}>
            <GraduacaoSelector
              modalidade={dadosFilho.modalidade || "Jiu-Jitsu"} // Default
              graduacaoAtual={dadosFilho.graduacao}
              onSelect={(graduacao) => setDadosFilho({ graduacao: graduacao })}
            />
          </View>
        </ScrollView>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={closeModal}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalButton, styles.confirmButton]}
            onPress={handleAcao}
          >
            <Text style={styles.confirmButtonText}>{confirmButtonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};


// --- ESTILOS OTIMIZADOS PARA UI/UX ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR_BACKGROUND },
  header: {
    backgroundColor: COLOR_BACKGROUND,
    alignItems: "center",
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_CARD_BACKGROUND,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLOR_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: { fontSize: 28, fontWeight: "bold", color: COLOR_BACKGROUND }, // Texto em cor escura no fundo dourado
  userName: { fontSize: 24, fontWeight: "bold", color: COLOR_TEXT_HIGH, marginBottom: 4 },
  userGraduacao: { fontSize: 16, color: COLOR_PRIMARY, fontWeight: "600" },
  userModalidade: { fontSize: 14, color: COLOR_TEXT_LOW },
  section: { marginVertical: 12, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16, alignItems: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: COLOR_SECONDARY, textTransform: "uppercase" },
  editButton: { fontSize: 14, color: COLOR_PRIMARY, fontWeight: "600" },
  addButton: { fontSize: 14, color: COLOR_PRIMARY, fontWeight: "600" },
  
  // Cards e Inputs
  infoCard: { backgroundColor: COLOR_CARD_BACKGROUND, padding: 16, borderRadius: 10 },
  infoField: { marginBottom: 18 },
  infoLabel: { fontSize: 12, color: COLOR_SECONDARY, fontWeight: "600", marginBottom: 6 },
  infoValue: { fontSize: 16, color: COLOR_TEXT_HIGH, fontWeight: "500" },
  input: { 
    backgroundColor: "#2a2a2a", // Um tom mais escuro que o card para contraste de input
    borderRadius: 6, 
    padding: 12, 
    color: COLOR_TEXT_HIGH,
    borderWidth: 1,
    borderColor: '#333',
  },
  
  // Botões Principais
  saveButton: {
    backgroundColor: COLOR_PRIMARY,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: { color: COLOR_BACKGROUND, fontSize: 16, fontWeight: "700" }, // Texto em cor escura no fundo dourado
  
  // Cards dos Filhos
  filhoCard: {
    backgroundColor: COLOR_CARD_BACKGROUND,
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLOR_SECONDARY,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filhoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center', marginBottom: 8 },
  filhoName: { fontSize: 18, fontWeight: "bold", color: COLOR_TEXT_HIGH },
  filhoActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  filhoInfo: { marginBottom: 8, marginTop: 8 },
  filhoGraduacao: { fontSize: 14, color: COLOR_PRIMARY, fontWeight: '500', marginBottom: 4 },
  filhoData: { fontSize: 12, color: COLOR_TEXT_LOW, lineHeight: 18 },

  // Badges e Botões de Pagamento (Ação Separada)
  modalidadeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
  modalidadeBadgeText: { fontSize: 12, color: COLOR_TEXT_HIGH, fontWeight: "600" },
  pagamentoButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  pagoButton: {
    backgroundColor: COLOR_SUCCESS, 
  },
  pendenteButton: {
    backgroundColor: COLOR_ERROR, 
  },
  pagamentoButtonText: {
    color: COLOR_TEXT_HIGH,
    fontSize: 10, // Menor para encaixar
    fontWeight: 'bold',
  },

  // Modalidade/Graduação Selector
  modalidadeGroup: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  modalidadeButton: {
    flex: 1 / 2, // Distribui em duas colunas (cerca de 45% cada)
    minWidth: '45%',
    backgroundColor: '#333',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
    marginVertical: 4,
  },
  modalidadeButtonSelected: {
    backgroundColor: COLOR_SECONDARY,
    borderColor: COLOR_PRIMARY,
    borderWidth: 2,
  },
  modalidadeButtonText: {
    color: COLOR_TEXT_HIGH,
    fontWeight: '600',
    fontSize: 14,
  },
  modalidadeButtonTextSelected: {
    color: COLOR_BACKGROUND, // Cor escura quando selecionado
    fontWeight: '700',
  },
  graduacaoContainer: { marginTop: 8 },
  scrollContent: { paddingRight: 20, paddingVertical: 4 },
  grauButtonsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  grauButton: {
    minWidth: 40,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#333',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },

  // Modal Estilos
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLOR_CARD_BACKGROUND,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%', // Limita a altura para scroll
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLOR_PRIMARY,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: COLOR_TEXT_HIGH,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalRow: { marginBottom: 15 },
  modalLabel: { fontSize: 14, color: COLOR_SECONDARY, fontWeight: "600", marginBottom: 8 },
  modalitySelector: { flexDirection: 'row', justifyContent: 'space-around' },
  modalidadeButtons: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  modalButton: { paddingVertical: 14, borderRadius: 8, flex: 1, marginHorizontal: 5, alignItems: 'center' },
  confirmButton: { backgroundColor: COLOR_PRIMARY },
  confirmButtonText: { color: COLOR_BACKGROUND, fontSize: 16, fontWeight: '700' },
  cancelButton: { backgroundColor: '#333', borderWidth: 1, borderColor: '#555' },
  cancelButtonText: { color: COLOR_TEXT_LOW, fontSize: 16, fontWeight: '600' },

  // Empty State
  emptyState: {
    backgroundColor: COLOR_CARD_BACKGROUND,
    padding: 32,
    borderRadius: 10,
    alignItems: "center",
  },
  emptyStateText: { fontSize: 16, color: COLOR_TEXT_LOW, marginBottom: 8 },
  emptyStateSubtext: { fontSize: 14, color: '#666' },
});