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
// Assumindo que Filho, Usuario e as interfaces de graduação estão definidas em '../types/usuarios'
// e as constantes de graduação estão disponíveis, conforme fornecido.
import { graduaçõesJiuJitsu, graduaçõesMuayThai } from "@/types/graduacoes";
import {
  Filho,
  GraduacaoJiuJitsu,
  GraduacaoMuayThai,
  Usuario,
} from "../types/usuarios";

// ⚠️ Se suas constantes de graduação não estiverem em outro arquivo, COPIE e COLE
// as definições aqui. Assumindo que elas estão importadas ou definidas no topo:


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

  // 🔹 Busca o usuário autenticado e seus dados no Firestore
  useEffect(() => {
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
    if (!usuario?.id) return;

    try {
      const userRef = doc(db, "usuarios", usuario.id);
      await updateDoc(userRef, {
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        observacao: usuario.observacao,
        modalidade: usuario.modalidade,
        graduacao: usuario.graduacao,
      });

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      setEditando(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    }
  };

  // 🔹 Adiciona um novo filho ao usuário
  const handleAdicionarFilho = async () => {
    if (!novoFilho.nome || !usuario?.id) {
      Alert.alert("Erro", "Por favor, informe o nome do filho.");
      return;
    }

    const filhoCompleto: Filho = {
      id: Date.now().toString(),
      nome: novoFilho.nome ?? "",
      modalidade: novoFilho.modalidade ?? "Jiu-Jitsu",
      graduacao: novoFilho.graduacao ?? { cor: "Branca", grau: 1 },
      dataDeRegistro: new Date().toISOString().split("T")[0],
      pagamento: novoFilho.pagamento ?? false,
      idade: novoFilho.idade,
      observacao: novoFilho.observacao ?? "",
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

      Alert.alert("Sucesso", "Filho adicionado com sucesso!");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível adicionar o filho.");
    }
  };


  // 🆕 FUNÇÃO: Inicia a edição de um filho
  const handleEditarFilho = (filho: Filho) => {
    setFilhoEmEdicao(filho); // Coloca o filho no estado de edição
    setModalFilho(true);     // Abre o modal
  };

  // 🆕 FUNÇÃO: Salva as alterações de um filho no Firestore
  const handleSalvarEdicaoFilho = async () => {
    if (!filhoEmEdicao || !usuario?.id) return;

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


  const renderInfoField = (label: string, value: string, editable?: boolean) => (
    <View style={styles.infoField}>
      <Text style={styles.infoLabel}>{label}</Text>
      {editable && editando ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) =>
            setUsuario((prev) => (prev ? { ...prev, [label.toLowerCase()]: text } : prev))
          }
        />
      ) : (
        <Text style={styles.infoValue}>{value}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#fff" }}>Carregando...</Text>
      </View>
    );
  }

  if (!usuario) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#fff" }}>Usuário não encontrado 😕</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header do Perfil */}
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
      </View>

      {/* Informações Pessoais (Sem alterações relevantes aqui) */}
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
          {renderInfoField("Nome", usuario.nome, true)}
          {renderInfoField("Email", usuario.email, true)}
          {renderInfoField("Telefone", usuario.telefone || "", true)}
          {renderInfoField("Data de Registro", formatarData(usuario.dataDeRegistro))}
          {renderInfoField("Observação", usuario.observacao || "", true)}
          {renderInfoField("Pagamento", usuario.pagamento ? "Pago" : "Pendente")}

          {/* Modalidade editável */}
          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>Modalidade</Text>
            {editando ? (
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
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

          {/* Graduação editável */}
          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>Graduação</Text>
            {editando ? (
              usuario.modalidade === "Muay Thai" ? (
                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                  {graduaçõesMuayThai.map((grad) => (
                    <TouchableOpacity
                      key={`${grad.cor}-${grad.pontaBranca ? "P" : "S"}`}
                      style={[
                        styles.modalidadeButton,
                        (usuario.graduacao as GraduacaoMuayThai)?.cor === grad.cor &&
                        (usuario.graduacao as GraduacaoMuayThai)?.pontaBranca === grad.pontaBranca &&
                        styles.modalidadeButtonSelected,
                        { paddingHorizontal: 6, paddingVertical: 8 }
                      ]}
                      onPress={() =>
                        setUsuario((prev) =>
                          prev
                            ? { ...prev, graduacao: grad as GraduacaoMuayThai }
                            : prev
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.modalidadeButtonText,
                          (usuario.graduacao as GraduacaoMuayThai)?.cor === grad.cor &&
                          (usuario.graduacao as GraduacaoMuayThai)?.pontaBranca === grad.pontaBranca &&
                          styles.modalidadeButtonTextSelected,
                        ]}
                      >
                        {grad.cor} {grad.pontaBranca ? "(PB)" : ""}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : usuario.modalidade === "Jiu-Jitsu" ? (
                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                  {graduaçõesJiuJitsu.map((grad) => (
                    <TouchableOpacity
                      key={`${grad.cor}-${grad.grau}`}
                      style={[
                        styles.modalidadeButton,
                        (usuario.graduacao as GraduacaoJiuJitsu)?.cor === grad.cor &&
                        (usuario.graduacao as GraduacaoJiuJitsu)?.grau === grad.grau &&
                        styles.modalidadeButtonSelected,
                        { paddingHorizontal: 6, paddingVertical: 8 }
                      ]}
                      onPress={() =>
                        setUsuario((prev) =>
                          prev ? { ...prev, graduacao: grad as GraduacaoJiuJitsu } : prev
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.modalidadeButtonText,
                          (usuario.graduacao as GraduacaoJiuJitsu)?.cor === grad.cor &&
                          (usuario.graduacao as GraduacaoJiuJitsu)?.grau === grad.grau &&
                          styles.modalidadeButtonTextSelected,
                        ]}
                      >
                        {grad.cor} {grad.grau}º
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.infoValue}>—</Text>
              )
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
          usuario.filhos.map((filho, index) => (
            // 🆕 Botão de edição adicionado no filhoCard
            <View key={filho.id} style={styles.filhoCard}>
              <View style={styles.filhoHeader}>
                <Text style={styles.filhoName}>{filho.nome}</Text>
                <TouchableOpacity onPress={() => handleEditarFilho(filho)}>
                    <Text style={styles.editButton}>Editar</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.filhoInfo}>
                <View
                  style={[
                    styles.modalidadeBadge,
                    {
                      backgroundColor:
                        filho.modalidade === "Muay Thai" ? "#8B0000" : "#00008B",
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
                <Text style={styles.filhoData}>
                  Registrado em: {formatarData(filho.dataDeRegistro)}
                </Text>
                {filho.idade && <Text style={styles.filhoData}>Idade: {filho.idade} anos</Text>}
                {filho.observacao && <Text style={styles.filhoData}>Observação: {filho.observacao}</Text>}
                <Text style={styles.filhoData}>
                  Pagamento: {filho.pagamento ? "Pago" : "Pendente"}
                </Text>
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
        {/* 🆕 Lógica dinâmica para Adicionar/Editar */}
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


// 🆕 Novo componente para o conteúdo do Modal para facilitar a leitura
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
  
  const setDadosFilho = (updates: Partial<Filho>) => {
    if (filhoEmEdicao) {
      setFilhoEmEdicao(prev => prev ? ({ ...prev, ...updates } as Filho) : null);
    } else {
      setNovoFilho(prev => ({ ...prev, ...updates }));
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
  
  // Tipagem da graduação (simplificada para o JSX)
  const graduacaoJiuJitsu = dadosFilho.graduacao as GraduacaoJiuJitsu;
  const graduacaoMuayThai = dadosFilho.graduacao as GraduacaoMuayThai;


  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{modalTitle}</Text>

        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {/* Nome */}
          <TextInput
            style={styles.modalInput}
            placeholder="Nome do filho"
            value={dadosFilho.nome}
            onChangeText={(text) => setDadosFilho({ nome: text })}
          />

          {/* Idade */}
          <TextInput
            style={styles.modalInput}
            placeholder="Idade (opcional)"
            keyboardType="numeric"
            value={dadosFilho.idade?.toString() || ""}
            onChangeText={(text) =>
              setDadosFilho({ idade: Number(text) })
            }
          />

          {/* Pagamento */}
          <View style={[styles.modalRow, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
            <Text style={styles.modalLabel}>Pagamento:</Text>
            <TouchableOpacity
              style={[
                styles.modalidadeButton,
                dadosFilho.pagamento && styles.modalidadeButtonSelected,
                { flex: 0.4, minWidth: 100 }
              ]}
              onPress={() => setDadosFilho({ pagamento: !dadosFilho.pagamento })}
            >
              <Text style={[styles.modalidadeButtonText, dadosFilho.pagamento && styles.modalidadeButtonTextSelected]}>
                {dadosFilho.pagamento ? "Pago" : "Pendente"}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Observação */}
          <TextInput
            style={styles.modalInput}
            placeholder="Observação (opcional)"
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
              <TouchableOpacity
                style={[
                  styles.modalidadeButton,
                  dadosFilho.modalidade === "Jiu-Jitsu" &&
                  styles.modalidadeButtonSelected,
                ]}
                onPress={() =>
                  setDadosFilho({
                    modalidade: "Jiu-Jitsu",
                    graduacao: { cor: "Branca", grau: 1 }, // Resetar para graduação inicial
                  })
                }
              >
                <Text
                  style={[
                    styles.modalidadeButtonText,
                    dadosFilho.modalidade === "Jiu-Jitsu" &&
                    styles.modalidadeButtonTextSelected,
                  ]}
                >
                  Jiu-Jitsu
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalidadeButton,
                  dadosFilho.modalidade === "Muay Thai" &&
                  styles.modalidadeButtonSelected,
                ]}
                onPress={() =>
                  setDadosFilho({
                    modalidade: "Muay Thai",
                    graduacao: { cor: "Amarela" }, // Resetar para graduação inicial
                  })
                }
              >
                <Text
                  style={[
                    styles.modalidadeButtonText,
                    dadosFilho.modalidade === "Muay Thai" &&
                    styles.modalidadeButtonTextSelected,
                  ]}
                >
                  Muay Thai
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* 🆕 Seleção de Graduação Dinâmica */}
          <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Graduação:</Text>
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                {dadosFilho.modalidade === "Jiu-Jitsu"
                  ? graduaçõesJiuJitsu.map((grad) => (
                      <TouchableOpacity
                        key={`${grad.cor}-${grad.grau}`}
                        style={[
                          styles.modalidadeButton,
                          graduacaoJiuJitsu?.cor === grad.cor &&
                          graduacaoJiuJitsu?.grau === grad.grau &&
                          styles.modalidadeButtonSelected,
                          { paddingHorizontal: 6, paddingVertical: 8 }
                        ]}
                        onPress={() => setDadosFilho({ graduacao: grad })}
                      >
                        <Text
                          style={[
                            styles.modalidadeButtonText,
                            graduacaoJiuJitsu?.cor === grad.cor &&
                            graduacaoJiuJitsu?.grau === grad.grau &&
                            styles.modalidadeButtonTextSelected,
                          ]}
                        >
                          {grad.cor} {grad.grau}º
                        </Text>
                      </TouchableOpacity>
                    ))
                  : graduaçõesMuayThai.map((grad) => (
                      <TouchableOpacity
                        key={`${grad.cor}-${grad.pontaBranca ? "P" : "S"}`}
                        style={[
                          styles.modalidadeButton,
                          graduacaoMuayThai?.cor === grad.cor &&
                          graduacaoMuayThai?.pontaBranca === grad.pontaBranca &&
                          styles.modalidadeButtonSelected,
                          { paddingHorizontal: 6, paddingVertical: 8 }
                        ]}
                        onPress={() => setDadosFilho({ graduacao: grad })}
                      >
                        <Text
                          style={[
                            styles.modalidadeButtonText,
                            graduacaoMuayThai?.cor === grad.cor &&
                            graduacaoMuayThai?.pontaBranca === grad.pontaBranca &&
                            styles.modalidadeButtonTextSelected,
                          ]}
                        >
                          {grad.cor}
                          {grad.pontaBranca ? " (PB)" : ""}
                        </Text>
                      </TouchableOpacity>
                    ))}
              </View>
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


// ⚙️ Estilos (mantidos do seu código original)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    backgroundColor: "#000",
    alignItems: "center",
    paddingVertical: 32,
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
  },
  avatarText: { fontSize: 24, fontWeight: "bold", color: "#000" },
  userName: { fontSize: 24, fontWeight: "bold", color: "#FFF", marginBottom: 8 },
  userGraduacao: { fontSize: 16, color: "#B8860B", fontWeight: "600" },
  userModalidade: { fontSize: 14, color: "#CCC" },
  section: { marginVertical: 8, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#B8860B", textTransform: "uppercase" },
  editButton: { fontSize: 14, color: "#B8860B", fontWeight: "600" },
  addButton: { fontSize: 14, color: "#B8860B", fontWeight: "600" },
  infoCard: { backgroundColor: "#1a1a1a", padding: 16, borderRadius: 8 },
  infoField: { marginBottom: 16 },
  infoLabel: { fontSize: 12, color: "#B8860B", fontWeight: "600" },
  infoValue: { fontSize: 16, color: "#FFF", fontWeight: "500" },
  input: { backgroundColor: "#2a2a2a", borderRadius: 6, padding: 12, color: "#FFF" },
  saveButton: {
    backgroundColor: "#B8860B",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: { color: "#000", fontSize: 16, fontWeight: "600" },
  filhoCard: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#B8860B",
  },
  filhoHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  filhoName: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
  modalidadeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  modalidadeBadgeText: { fontSize: 12, color: "#FFF", fontWeight: "600" },
  filhoInfo: { marginBottom: 8, marginTop: 8 },
  filhoGraduacao: { fontSize: 14, color: "#B8860B", marginBottom: 4 },
  filhoData: { fontSize: 12, color: "#CCC" },
  emptyState: {
    backgroundColor: "#1a1a1a",
    padding: 32,
    borderRadius: 8,
    alignItems: "center",
  },
  emptyStateText: { fontSize: 16, color: "#CCC", marginBottom: 8 },
  emptyStateSubtext: { fontSize: 14, color: "#666" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: { backgroundColor: "#1a1a1a", borderRadius: 12, padding: 24, width: "100%", maxWidth: 400, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#FFF", marginBottom: 20, textAlign: "center" },
  modalInput: {
    backgroundColor: "#2a2a2a",
    borderRadius: 6,
    padding: 12,
    color: "#FFF",
    fontSize: 16,
    marginBottom: 16,
  },
  modalRow: { marginBottom: 20 },
  modalLabel: { fontSize: 14, color: "#CCC", marginBottom: 8 },
  modalidadeButtons: { flexDirection: "row", gap: 8 },
  modalidadeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
  },
  modalidadeButtonSelected: { backgroundColor: "#B8860B" },
  modalidadeButtonText: { color: "#CCC", fontWeight: "500" },
  modalidadeButtonTextSelected: { color: "#000", fontWeight: "600" },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalButton: { flex: 1, padding: 16, borderRadius: 6, alignItems: "center" },
  cancelButton: { backgroundColor: "#2a2a2a" },
  confirmButton: { backgroundColor: "#B8860B" },
  cancelButtonText: { color: "#CCC", fontWeight: "600" },
  confirmButtonText: { color: "#000", fontWeight: "600" },
});