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
      } else {
        Alert.alert("Erro", "Nenhum usuário autenticado.");
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
  // Se não existir graduação, retorna um texto padrão
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
      nome: novoFilho.nome!,
      modalidade: novoFilho.modalidade!,
      graduacao: novoFilho.graduacao!,
      dataDeRegistro: new Date().toISOString().split("T")[0],
      pagamento: false
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
          {renderInfoField("Nome", usuario.nome, true)}
          {renderInfoField("Email", usuario.email, true)}
          {renderInfoField("Telefone", usuario.telefone || "", true)}
          {renderInfoField("Data de Registro", formatarData(usuario.dataDeRegistro))}

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
          <TouchableOpacity onPress={() => setModalFilho(true)}>
            <Text style={styles.addButton}>+ Adicionar</Text>
          </TouchableOpacity>
        </View>

        {usuario.filhos && usuario.filhos.length > 0 ? (
          usuario.filhos.map((filho) => (
            <View key={filho.id} style={styles.filhoCard}>
              <View style={styles.filhoHeader}>
                <Text style={styles.filhoName}>{filho.nome}</Text>
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
              </View>

              <View style={styles.filhoInfo}>
                <Text style={styles.filhoGraduacao}>
                  {formatarGraduacao(filho.graduacao, filho.modalidade)}
                </Text>
                <Text style={styles.filhoData}>
                  Registrado em: {formatarData(filho.dataDeRegistro)}
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

      {/* Modal para Adicionar Filho */}
      <Modal
        visible={modalFilho}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalFilho(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Filho</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nome do filho"
              value={novoFilho.nome}
              onChangeText={(text) => setNovoFilho((prev) => ({ ...prev, nome: text }))}
            />

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Modalidade:</Text>
              <View style={styles.modalidadeButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalidadeButton,
                    novoFilho.modalidade === "Jiu-Jitsu" &&
                      styles.modalidadeButtonSelected,
                  ]}
                  onPress={() =>
                    setNovoFilho({
                      ...novoFilho,
                      modalidade: "Jiu-Jitsu",
                      graduacao: { cor: "Branca", grau: 1 },
                    })
                  }
                >
                  <Text
                    style={[
                      styles.modalidadeButtonText,
                      novoFilho.modalidade === "Jiu-Jitsu" &&
                        styles.modalidadeButtonTextSelected,
                    ]}
                  >
                    Jiu-Jitsu
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalidadeButton,
                    novoFilho.modalidade === "Muay Thai" &&
                      styles.modalidadeButtonSelected,
                  ]}
                  onPress={() =>
                    setNovoFilho({
                      ...novoFilho,
                      modalidade: "Muay Thai",
                      graduacao: { cor: "Amarela" },
                    })
                  }
                >
                  <Text
                    style={[
                      styles.modalidadeButtonText,
                      novoFilho.modalidade === "Muay Thai" &&
                        styles.modalidadeButtonTextSelected,
                    ]}
                  >
                    Muay Thai
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalFilho(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAdicionarFilho}
              >
                <Text style={styles.confirmButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ⚙️ Estilos (os mesmos que você já tinha)
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
  modalidadeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  modalidadeBadgeText: { fontSize: 12, color: "#FFF", fontWeight: "600" },
  filhoInfo: { marginBottom: 8 },
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
  modalContent: { backgroundColor: "#1a1a1a", borderRadius: 12, padding: 24, width: "100%", maxWidth: 400 },
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
