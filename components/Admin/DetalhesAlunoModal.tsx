import { usePresencaAdmin } from '@/hooks/usePresencaAdmin';
import { professores, UsuarioCompleto } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Hook de pagamento administrativo
import { MultiModalidadeSelector } from '@/components/perfil/MultiModalidadeSelector';
import { ProfessorSelector } from '@/components/perfil/ProfessorSelector';
import { db } from '@/config/firebaseConfig';
import { useDeletarUsuario } from '@/hooks/useDeletarUsuario';
import { usePagamentoAdmin } from '@/hooks/usePagamentoAdmin';
import { doc, updateDoc } from 'firebase/firestore';

interface DetalhesAlunoModalProps {
  visible: boolean;
  usuario: UsuarioCompleto | null;
  onClose: () => void;
  onPagamentoAtualizado?: () => void;
  onUsuarioDeletado?: () => void;
  onUsuarioAtualizado?: () => void; // Nova prop para notificar atualizações
}

interface PresencaState {
  hasPresenca: boolean;
  isConfirmed: boolean;
}

// Função para formatar datas
const formatarData = (data: string | Date) => {
  if (!data) return 'Não informado';

  const dataObj = typeof data === 'string' ? new Date(data) : data;

  if (isNaN(dataObj.getTime())) return 'Data inválida';

  return dataObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Função para calcular informações do semestre
const getSemestreInfo = () => {
  const hoje = new Date();
  const currentMonth = hoje.getMonth();
  const isPrimeiroSemestre = currentMonth >= 0 && currentMonth <= 5;

  return {
    isPrimeiroSemestre,
    nome: isPrimeiroSemestre ? '1º Semestre' : '2º Semestre',
    periodo: isPrimeiroSemestre ? 'Jan-Jun' : 'Jul-Dez'
  };
};

// Função para calcular dias úteis
const calcularDiasUteis = (inicio: Date, fim: Date): number => {
  let count = 0;
  const current = new Date(inicio);

  while (current <= fim) {
    const day = current.getDay();
    const isPrimeiroJaneiro = current.getMonth() === 0 && current.getDate() === 1;

    if (day >= 1 && day <= 6 && !isPrimeiroJaneiro) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
};

// Função para calcular porcentagem
const calcularPorcentagemPresenca = (totalPresencas: number): number => {
  const hoje = new Date();
  const currentYear = hoje.getFullYear();
  const currentMonth = hoje.getMonth();

  let inicioSemestre: Date;
  let fimSemestre: Date;

  if (currentMonth >= 0 && currentMonth <= 5) {
    inicioSemestre = new Date(currentYear, 0, 2);
    fimSemestre = new Date(currentYear, 5, 30);
  } else {
    inicioSemestre = new Date(currentYear, 6, 1);
    fimSemestre = new Date(currentYear, 11, 31);
  }

  const dataLimite = hoje < fimSemestre ? hoje : fimSemestre;
  const diasUteisNoSemestre = calcularDiasUteis(inicioSemestre, dataLimite);

  if (diasUteisNoSemestre === 0) return 0;
  return Math.round((totalPresencas / diasUteisNoSemestre) * 100);
};

// Componente para Gerenciar Pagamento do ADMIN
const GerenciarPagamentoAdmin: React.FC<{
  item: UsuarioCompleto | any;
  tipo: "usuario" | "filho";
  usuarioId?: string;
  onPagamentoAtualizado: () => void;
}> = ({ item, tipo, usuarioId, onPagamentoAtualizado }) => {
  const {
    modalPagamento,
    setModalPagamento,
    processando,
    handleConfirmarPagamento,
    handleReverterPagamento,
    formatarData,
    getStatusInfo,
    dataUltimoPagamento
  } = usePagamentoAdmin({
    item,
    usuarioId,
    tipo,
    onPagamentoAtualizado,
  });

  const statusInfo = getStatusInfo();

  return (
    <>
      <View style={styles.pagamentoContainer}>
        {/* Status do Pagamento - Sempre clicável para o admin */}
        <TouchableOpacity
          style={[
            styles.statusContainer,
            item.pagamento ? styles.pagamentoPago :
              item.avisoPagamento ? styles.pagamentoAguardando : styles.pagamentoPendente
          ]}
          onPress={() => setModalPagamento(true)}
        >
          <Ionicons
            name={statusInfo.icone as any}
            size={16}
            color={statusInfo.cor}
          />
          <Text style={[styles.statusText, { color: statusInfo.cor }]}>
            {statusInfo.texto}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalPagamento}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !processando && setModalPagamento(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gerenciar Pagamento - ADMIN</Text>
              <TouchableOpacity
                onPress={() => !processando && setModalPagamento(false)}
                disabled={processando}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.pagamentoInfo}>
              <View style={styles.alunoInfo}>
                <Ionicons name="person" size={20} color="#B8860B" />
                <Text style={styles.pagamentoNome}>{item.nome}</Text>
              </View>

              <View style={[
                styles.statusBadge,
                { backgroundColor: `${statusInfo.cor}20` }
              ]}>
                <Ionicons name={statusInfo.icone as any} size={16} color={statusInfo.cor} />
                <Text style={[styles.statusBadgeText, { color: statusInfo.cor }]}>
                  {statusInfo.textoLongo.toUpperCase()}
                </Text>
              </View>

              <Text style={styles.statusDescricao}>
                {statusInfo.descricao}
              </Text>

              {dataUltimoPagamento && (
                <View style={styles.dataInfo}>
                  <Ionicons name="calendar" size={16} color="#666" />
                  <Text style={styles.pagamentoData}>
                    Último pagamento: {formatarData(dataUltimoPagamento)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalPagamento(false)}
                disabled={processando}
              >
                <Text style={styles.cancelButtonText}>Fechar</Text>
              </TouchableOpacity>

              {/* BOTÕES DO ADMIN: Confirmar ou Reverter pagamento */}
              {!item.pagamento ? (
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleConfirmarPagamento}
                  disabled={processando}
                >
                  {processando ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      {item.avisoPagamento ? 'Confirmar Pagamento' : 'Marcar como Pago'}
                    </Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.modalButton, styles.reverterButton]}
                  onPress={handleReverterPagamento}
                  disabled={processando}
                >
                  {processando ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.reverterButtonText}>Reverter para Pendente</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Componente BotaoMarcarPresencaUsuario
const BotaoMarcarPresencaUsuario: React.FC<{
  usuario: UsuarioCompleto;
  estadoUsuario: PresencaState;
  loading: boolean;
  marcandoPresenca: string | null;
  onMarcarPresenca: (usuarioId: string, usuarioNome: string, isChild?: boolean, childId?: string, childName?: string) => Promise<void>;
}> = ({ usuario, estadoUsuario, loading, marcandoPresenca, onMarcarPresenca }) => {
  const handleMarcarPresenca = async () => {
    if (estadoUsuario.hasPresenca) {
      Alert.alert('Aviso', `${usuario.nome} já marcou presença para hoje. Tente novamente amanhã.`);
      return;
    }

    await onMarcarPresenca(usuario.id, usuario.nome, false);
  };

  const isLoading = loading || marcandoPresenca === usuario.id;
  const hasPresenca = estadoUsuario.hasPresenca;
  const isConfirmed = estadoUsuario.isConfirmed;

  return (
    <View style={styles.presencaContainer}>
      <TouchableOpacity
        style={[
          styles.presencaButton,
          !hasPresenca && styles.presencaButtonAvailable,
          hasPresenca && !isConfirmed && styles.presencaButtonPending,
          hasPresenca && isConfirmed && styles.presencaButtonConfirmed,
        ]}
        onPress={handleMarcarPresenca}
        disabled={isLoading || hasPresenca}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : !hasPresenca ? (
          <View style={styles.buttonContent}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#000" />
            <Text style={styles.presencaButtonText}>MARCAR PRESENÇA</Text>
          </View>
        ) : hasPresenca && !isConfirmed ? (
          <View style={styles.buttonContent}>
            <Ionicons name="time" size={20} color="#F59E0B" />
            <Text style={styles.presencaButtonText}>AGUARDANDO CONFIRMAÇÃO</Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text style={styles.presencaButtonConfirmedText}>PRESENÇA CONFIRMADA</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Componente BotaoMarcarPresencaFilho
const BotaoMarcarPresencaFilho: React.FC<{
  filho: any;
  usuario: UsuarioCompleto;
  estadoFilho: PresencaState;
  loading: boolean;
  marcandoPresenca: string | null;
  onMarcarPresenca: (usuarioId: string, usuarioNome: string, isChild?: boolean, childId?: string, childName?: string) => Promise<void>;
}> = ({ filho, usuario, estadoFilho, loading, marcandoPresenca, onMarcarPresenca }) => {
  const handleMarcarPresenca = async () => {
    if (estadoFilho.hasPresenca) {
      Alert.alert('Aviso', `${filho.nome} já marcou presença para hoje. Tente novamente amanhã.`);
      return;
    }

    await onMarcarPresenca(usuario.id, usuario.nome, true, filho.id, filho.nome);
  };

  const isLoading = loading || marcandoPresenca === filho.id;
  const hasPresenca = estadoFilho.hasPresenca;
  const isConfirmed = estadoFilho.isConfirmed;

  return (
    <View style={styles.presencaContainer}>
      <TouchableOpacity
        style={[
          styles.presencaButton,
          !hasPresenca && styles.presencaButtonAvailable,
          hasPresenca && !isConfirmed && styles.presencaButtonPending,
          hasPresenca && isConfirmed && styles.presencaButtonConfirmed,
        ]}
        onPress={handleMarcarPresenca}
        disabled={isLoading || hasPresenca}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : !hasPresenca ? (
          <View style={styles.buttonContent}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#000" />
            <Text style={styles.presencaButtonText}>MARCAR PRESENÇA</Text>
          </View>
        ) : hasPresenca && !isConfirmed ? (
          <View style={styles.buttonContent}>
            <Ionicons name="time" size={20} color="#F59E0B" />
            <Text style={styles.presencaButtonText}>AGUARDANDO CONFIRMAÇÃO</Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text style={styles.presencaButtonConfirmedText}>PRESENÇA CONFIRMADA</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export const DetalhesAlunoModal: React.FC<DetalhesAlunoModalProps> = ({
  visible,
  usuario,
  onClose,
  onPagamentoAtualizado,
  onUsuarioDeletado,
  onUsuarioAtualizado,
}) => {
  const [marcandoPresenca, setMarcandoPresenca] = useState<string | null>(null);
  const [presencaStates, setPresencaStates] = useState<{ [key: string]: PresencaState }>({});
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [editando, setEditando] = useState(false);
  const [usuarioEditado, setUsuarioEditado] = useState<UsuarioCompleto | null>(null);
  const [salvando, setSalvando] = useState(false);

  const { deletando, deletarUsuario } = useDeletarUsuario();

  // Função para deletar usuário
  const handleDeletarUsuario = async () => {
    if (!usuario) return;

    try {
      const success = await deletarUsuario(usuario.id, usuario.nome);

      if (success) {
        Alert.alert(
          'Sucesso',
          'Usuário deletado com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => {
                setModalDeleteVisible(false);
                onClose();
                onUsuarioDeletado?.();
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error);
      Alert.alert(
        'Erro',
        `Não foi possível deletar o usuário: ${error.message || 'Tente novamente.'}`
      );
    }
  };

  const confirmarDelecao = () => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o usuário "${usuario?.nome}"? Esta ação não pode ser desfeita e irá remover:\n\n• Dados pessoais\n• Histórico de pagamentos\n• Histórico de presenças\n• Dados dos dependentes`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => setModalDeleteVisible(true)
        }
      ]
    );
  };

  const {
    loading,
    checkInAdmin,
    checkPresencaToday,
    todayString,
  } = usePresencaAdmin();

  const handlePagamentoAtualizado = () => {
    onPagamentoAtualizado?.();
  };

  // Inicializar dados editáveis quando o usuário ou modal mudar
  useEffect(() => {
    if (visible && usuario) {
      setUsuarioEditado(usuario);
      setEditando(false);
      carregarEstadosPresenca();
    }
  }, [visible, usuario]);

  // Função para salvar as alterações do usuário
  const handleSalvarAlteracoes = async () => {
    if (!usuarioEditado?.id) {
      Alert.alert("Erro", "Usuário não encontrado.");
      return;
    }

    if (!usuarioEditado.modalidades || usuarioEditado.modalidades.length === 0) {
      Alert.alert("Campo obrigatório", "Selecione pelo menos uma modalidade antes de salvar.");
      return;
    }

    setSalvando(true);
    try {
      const userRef = doc(db, "usuarios", usuarioEditado.id);
      await updateDoc(userRef, {
        nome: usuarioEditado.nome ?? "",
        email: usuarioEditado.email ?? "",
        telefone: usuarioEditado.telefone ?? "",
        observacao: usuarioEditado.observacao ?? "",
        modalidades: usuarioEditado.modalidades ?? [],
        professores: usuarioEditado.professores ?? [],
      });

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      setEditando(false);
      onUsuarioAtualizado?.(); // Notificar que o usuário foi atualizado
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setSalvando(false);
    }
  };

  // Função para cancelar edição
  const handleCancelarEdicao = () => {
    setUsuarioEditado(usuario);
    setEditando(false);
  };

  const carregarEstadosPresenca = async () => {
    if (!usuario) return;

    const novosEstados: { [key: string]: PresencaState } = {};

    // Verificar presença do usuário principal
    const estadoUsuario = await checkPresencaToday(usuario.id, false);
    novosEstados[usuario.id] = estadoUsuario;

    // Verificar presença dos filhos
    if (usuario.filhos) {
      for (const filho of usuario.filhos) {
        const estadoFilho = await checkPresencaToday(usuario.id, true, filho.id);
        novosEstados[filho.id] = estadoFilho;
      }
    }

    setPresencaStates(novosEstados);
  };

  const handleMarcarPresenca = async (userId: string, userName: string, isChild: boolean = false, childId?: string, childName?: string) => {
    const targetId = isChild && childId ? childId : userId;
    setMarcandoPresenca(targetId);

    try {
      const success = await checkInAdmin(userId, userName, isChild, childId, childName);
      if (success) {
        setPresencaStates(prev => ({
          ...prev,
          [targetId]: { hasPresenca: true, isConfirmed: false }
        }));
      }
    } catch (error) {
      console.error('Erro ao marcar presença:', error);
    } finally {
      setMarcandoPresenca(null);
    }
  };

  const formatarGraduacao = (graduacao: any, modalidade: string) => {
    if (!graduacao) return 'Sem graduação';

    if (modalidade === 'Muay Thai') {
      return graduacao?.pontaBranca
        ? `${graduacao.cor} (Ponta Branca)`
        : graduacao.cor;
    } else {
      return `${graduacao.cor} - ${graduacao.grau ?? 0}º Grau`;
    }
  };

  const obterNomesProfessores = (professorIds: string[] | undefined): string[] => {
    if (!professorIds || professorIds.length === 0) return [];

    return professorIds
      .map(id => {
        const professor = professores.find(p => p.id === id);
        return professor ? professor.nome : null;
      })
      .filter((nome): nome is string => nome !== null);
  };

  const obterProfessoresCompletos = (professorIds: string[] | undefined) => {
    if (!professorIds || professorIds.length === 0) return [];

    return professores.filter(prof => professorIds.includes(prof.id));
  };

  const obterArrayPresenca = (dados: any, filho?: any): string[] => {
    try {
      if (filho) {
        return Array.isArray(filho.Presenca) ? filho.Presenca :
          Array.isArray(filho.presenca) ? filho.presenca :
            Array.isArray(filho.avisaPresenca) ? filho.avisaPresenca : [];
      } else {
        return Array.isArray(dados.Presenca) ? dados.Presenca :
          Array.isArray(dados.presenca) ? dados.presenca :
            Array.isArray(dados.avisaPresenca) ? dados.avisaPresenca : [];
      }
    } catch {
      return [];
    }
  };

  const calcularFrequencia = (presencaArray: string[] = []) => {
    const totalPresencas = presencaArray.length;

    const ultimoMes = presencaArray.filter(dataPresencaStr => {
      try {
        const dataPresenca = new Date(dataPresencaStr);
        const umMesAtras = new Date();
        umMesAtras.setMonth(umMesAtras.getMonth() - 1);
        return dataPresenca >= umMesAtras;
      } catch {
        return false;
      }
    }).length;

    const porcentagemSemestre = calcularPorcentagemPresenca(totalPresencas);

    return {
      total: totalPresencas,
      ultimoMes,
      porcentagemSemestre
    };
  };

  const getPorcentagemColor = (porcentagem: number): string => {
    if (porcentagem >= 75) return '#22c55e';
    if (porcentagem >= 50) return '#eab308';
    return '#ef4444';
  };

  // Componente para renderizar campo de informação editável
  const renderInfoField = (label: string, value: string, editable?: boolean, key?: string) => (
    <View style={styles.infoFieldContainer} key={key}>
      <Text style={styles.infoLabel}>{label}:</Text>
      {editable && editando ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => {
            if (usuarioEditado && key) {
              setUsuarioEditado({ ...usuarioEditado, [key]: text });
            }
          }}
          placeholderTextColor="#666"
          placeholder={`Digite ${label.toLowerCase()}...`}
        />
      ) : (
        <Text style={styles.infoValue}>{value || "Não informado"}</Text>
      )}
    </View>
  );

  // Função para renderizar modalidades em modo de edição
  const renderModalidadesEditaveis = () => {
    if (!usuarioEditado) return null;

    return editando ? (
      <View style={styles.modalidadesEditContainer}>
        <Text style={styles.infoLabel}>Modalidades:</Text>
        <MultiModalidadeSelector
          modalidades={usuarioEditado.modalidades || []}
          onModalidadesChange={(modalidades) => {
            setUsuarioEditado({ ...usuarioEditado, modalidades });
          }}
        />
      </View>
    ) : (
      renderModalidadesUsuario()
    );
  };

  // Função para renderizar professores em modo de edição
  const renderProfessoresEditaveis = () => {
    if (!usuarioEditado) return null;

    return editando ? (
      <View style={styles.professoresEditContainer}>
        <Text style={styles.infoLabel}>Professores:</Text>
        <ProfessorSelector
          professoresSelecionados={usuarioEditado.professores || []}
          onProfessoresChange={(professoresIds) => {
            setUsuarioEditado({ ...usuarioEditado, professores: professoresIds });
          }}
        />
      </View>
    ) : (
      renderProfessoresUsuario()
    );
  };

  // Função para renderizar modalidades do usuário (modo visualização)
  const renderModalidadesUsuario = () => {
    if (!usuarioEditado?.modalidades || usuarioEditado.modalidades.length === 0) {
      return <Text style={styles.infoValue}>Nenhuma modalidade selecionada</Text>;
    }

    return (
      <View style={styles.modalidadesList}>
        {usuarioEditado.modalidades.map((modalidade, index) => (
          <View key={index} style={styles.modalidadeCard}>
            <View style={styles.modalidadeHeader}>
              <Text style={styles.modalidadeNome}>{modalidade.modalidade}</Text>
              <Text style={[
                styles.modalidadeStatus,
                { color: modalidade.ativo ? '#22c55e' : '#ef4444' }
              ]}>
                {modalidade.ativo ? '✅ Ativo' : '⏸️ Inativo'}
              </Text>
            </View>
            <Text style={styles.modalidadeGraduacao}>
              {formatarGraduacao(modalidade.graduacao, modalidade.modalidade)}
            </Text>
            <Text style={styles.modalidadeData}>
              Desde: {formatarData(modalidade.dataInicio)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Função para renderizar professores do usuário (modo visualização)
  const renderProfessoresUsuario = () => {
    if (!usuarioEditado?.professores || usuarioEditado.professores.length === 0) {
      return <Text style={styles.infoValue}>Nenhum professor associado</Text>;
    }

    return (
      <View style={styles.professoresList}>
        {obterProfessoresCompletos(usuarioEditado.professores).map((professor) => (
          <View key={professor.id} style={styles.professorItem}>
            <View style={styles.professorInfo}>
              <Ionicons name="person-circle-outline" size={20} color="#B8860B" />
              <View style={styles.professorDetails}>
                <Text style={styles.professorNome}>{professor.nome}</Text>
                <Text style={styles.professorEmail}>{professor.email}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const semestreInfo = getSemestreInfo();

  if (!usuario || !usuarioEditado) return null;

  const presencaUsuario = obterArrayPresenca(usuarioEditado);
  const frequenciaUsuario = calcularFrequencia(presencaUsuario);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header Atualizado com Botão de Edição */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#B8860B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Aluno</Text>
          <View style={styles.headerActions}>
            {!editando ? (
              <>
                <TouchableOpacity
                  style={styles.editHeaderButton}
                  onPress={() => setEditando(true)}
                >
                  <Ionicons name="create-outline" size={20} color="#B8860B" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={confirmarDelecao}
                  disabled={deletando}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={deletando ? "#666" : "#ef4444"}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.editModeActions}>
                <TouchableOpacity
                  style={styles.cancelEditButton}
                  onPress={handleCancelarEdicao}
                  disabled={salvando}
                >
                  <Ionicons name="close" size={20} color="#ef4444" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveEditButton}
                  onPress={handleSalvarAlteracoes}
                  disabled={salvando}
                >
                  {salvando ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Ionicons name="checkmark" size={20} color="#22c55e" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Modal de Confirmação de Deleção */}
        <Modal
          visible={modalDeleteVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => !deletando && setModalDeleteVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
                <TouchableOpacity
                  onPress={() => !deletando && setModalDeleteVisible(false)}
                  disabled={deletando}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.deleteContent}>
                <Ionicons name="warning" size={48} color="#ef4444" />
                <Text style={styles.deleteTitle}>Atenção!</Text>
                <Text style={styles.deleteText}>
                  Esta ação irá excluir permanentemente o usuário {'"'}
                  <Text style={styles.deleteUserName}>{usuario?.nome}</Text>
                  {'"'}, todos os seus dados, histórico de pagamentos e presenças.
                </Text>
                <Text style={styles.deleteWarning}>
                  ⚠️ Esta ação não pode ser desfeita!
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalDeleteVisible(false)}
                  disabled={deletando}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteConfirmButton]}
                  onPress={handleDeletarUsuario}
                  disabled={deletando}
                >
                  {deletando ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.deleteConfirmButtonText}>Excluir Permanentemente</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <ScrollView style={styles.content}>
          {/* Informações Básicas - Agora Editáveis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>
            <View style={styles.infoCard}>
              {renderInfoField("Nome", usuarioEditado.nome || "", true, "nome")}
              {renderInfoField("Email", usuarioEditado.email || "", true, "email")}
              {renderInfoField("Telefone", usuarioEditado.telefone || "", true, "telefone")}
              {renderInfoField("Observação", usuarioEditado.observacao || "", true, "observacao")}
              <View style={styles.infoFieldContainer}>
                <Text style={styles.infoLabel}>Data de Registro:</Text>
                <Text style={styles.infoValue}>
                  {formatarData(usuarioEditado.dataDeRegistro)}
                </Text>
              </View>
            </View>
          </View>

          {/* Status do Pagamento */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status do Pagamento</Text>
            <View style={styles.pagamentoSectionCard}>
              <View style={styles.pagamentoInfoHeader}>
                <Ionicons
                  name={usuarioEditado.pagamento ? "checkmark-circle" : "alert-circle"}
                  size={24}
                  color={usuarioEditado.pagamento ? "#22c55e" : "#ef4444"}
                />
                <View style={styles.pagamentoInfoText}>
                  <Text style={styles.pagamentoStatus}>
                    {usuarioEditado.pagamento ? 'Pagamento em dia' : 'Pagamento pendente'}
                  </Text>
                  <Text style={styles.pagamentoData}>
                    Dia de pagamento: {usuarioEditado.dataPagamento ?
                      new Date(usuarioEditado.dataPagamento).getDate() : '-'} de cada mês
                  </Text>
                </View>
              </View>

              <GerenciarPagamentoAdmin
                item={usuarioEditado}
                tipo="usuario"
                onPagamentoAtualizado={handlePagamentoAtualizado}
              />
            </View>
          </View>

          {/* Modalidades - Editáveis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Modalidades</Text>
            <View style={styles.infoCard}>
              {renderModalidadesEditaveis()}
            </View>
          </View>

          {/* Professores - Editáveis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professores</Text>
            <View style={styles.infoCard}>
              {renderProfessoresEditaveis()}
            </View>
          </View>

          {/* Frequência do Usuário */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequência - {semestreInfo.nome}</Text>
            <View style={styles.frequenciaCard}>
              <View style={styles.frequenciaItem}>
                <Text style={styles.frequenciaNumber}>
                  {frequenciaUsuario.total}
                </Text>
                <Text style={styles.frequenciaLabel}>Total de aulas</Text>
              </View>
              <View style={styles.frequenciaItem}>
                <Text style={[
                  styles.frequenciaNumber,
                  { color: getPorcentagemColor(frequenciaUsuario.porcentagemSemestre) }
                ]}>
                  {frequenciaUsuario.porcentagemSemestre}%
                </Text>
                <Text style={styles.frequenciaLabel}>No semestre</Text>
                <Text style={styles.semestreInfo}>
                  {semestreInfo.periodo}
                </Text>
              </View>
            </View>
          </View>

          {/* Marcar Presença do Usuário */}
          {usuarioEditado.modalidades?.some(m => m.ativo) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Marcar Presença</Text>
              <View style={styles.presencaCard}>
                <View>
                  <Text style={styles.presencaNome}>{usuarioEditado.nome}</Text>
                </View>
                <BotaoMarcarPresencaUsuario
                  usuario={usuarioEditado}
                  estadoUsuario={presencaStates[usuarioEditado.id] || { hasPresenca: false, isConfirmed: false }}
                  loading={loading}
                  marcandoPresenca={marcandoPresenca}
                  onMarcarPresenca={handleMarcarPresenca}
                />
              </View>
            </View>
          )}

          {/* Filhos */}
          {usuarioEditado.filhos && usuarioEditado.filhos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Alunos Dependentes</Text>
              <View style={styles.filhosList}>
                {usuarioEditado.filhos.map((filho, index) => {
                  const presencaFilho = obterArrayPresenca(usuarioEditado, filho);
                  const frequenciaFilho = calcularFrequencia(presencaFilho);

                  return (
                    <View key={filho.id || `filho-${index}`} style={styles.filhoCard}>
                      <View style={styles.filhoHeader}>
                        <Text style={styles.filhoNome}>{filho.nome}</Text>
                        {filho.idade && (
                          <Text style={styles.filhoIdade}>{filho.idade} anos</Text>
                        )}
                      </View>

                      {/* Pagamento do Filho */}
                      <View style={styles.filhoPagamentoSection}>
                        <GerenciarPagamentoAdmin
                          item={filho}
                          tipo="filho"
                          usuarioId={usuarioEditado.id}
                          onPagamentoAtualizado={handlePagamentoAtualizado}
                        />
                      </View>

                      {/* Modalidades do Filho */}
                      {filho.modalidades && filho.modalidades.length > 0 && (
                        <View style={styles.filhoModalidades}>
                          {filho.modalidades.map((modalidade, idx) => (
                            <View key={idx} style={styles.filhoModalidadeItem}>
                              <Text style={styles.filhoModalidadeNome}>
                                {modalidade.modalidade}
                              </Text>
                              <Text style={styles.filhoModalidadeGraduacao}>
                                {formatarGraduacao(modalidade.graduacao, modalidade.modalidade)}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Professores do Filho */}
                      {filho.professores && filho.professores.length > 0 && (
                        <View style={styles.filhoProfessoresSection}>
                          <Text style={styles.filhoSectionLabel}>Professores:</Text>
                          <View style={styles.filhoProfessoresList}>
                            {obterProfessoresCompletos(filho.professores).map((professor) => (
                              <View key={professor.id} style={styles.filhoProfessorChip}>
                                <Text style={styles.filhoProfessorChipText}>
                                  {professor.nome}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Frequência do Filho */}
                      <View style={styles.filhoFrequencia}>
                        <View style={styles.frequenciaRow}>
                          <Text style={styles.frequenciaLabel}>
                            Total: {frequenciaFilho.total} aulas
                          </Text>
                          <Text style={[
                            styles.frequenciaPorcentagem,
                            { color: getPorcentagemColor(frequenciaFilho.porcentagemSemestre) }
                          ]}>
                            {frequenciaFilho.porcentagemSemestre}% no semestre
                          </Text>
                        </View>
                      </View>

                      {/* Marcar Presença do Filho */}
                      <View style={styles.filhoPresencaSection}>
                        <BotaoMarcarPresencaFilho
                          filho={filho}
                          usuario={usuarioEditado}
                          estadoFilho={presencaStates[filho.id] || { hasPresenca: false, isConfirmed: false }}
                          loading={loading}
                          marcandoPresenca={marcandoPresenca}
                          onMarcarPresenca={handleMarcarPresenca}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#000',
    marginTop: 30
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editHeaderButton: {
    padding: 8,
  },
  editModeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelEditButton: {
    padding: 8,
  },
  saveEditButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B8860B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  modalidadesEditContainer: {
    marginBottom: 16,
  },
  professoresEditContainer: {
    marginBottom: 16,
  },
  pagamentoSectionCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  pagamentoInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  pagamentoInfoText: {
    flex: 1,
  },
  pagamentoStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  pagamentoData: {
    fontSize: 12,
    color: '#CCC',
  },
  modalidadesList: {
    gap: 12,
  },
  modalidadeCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
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
    fontWeight: '500',
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
  frequenciaCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  frequenciaItem: {
    alignItems: 'center',
  },
  frequenciaNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B8860B',
    marginBottom: 4,
  },
  frequenciaLabel: {
    fontSize: 12,
    color: '#CCC',
    textAlign: 'center',
  },
  semestreInfo: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
    textAlign: 'center',
  },
  filhosList: {
    gap: 12,
  },
  filhoCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderLeftWidth: 4,
    borderLeftColor: '#B8860B',
  },
  filhoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filhoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  filhoIdade: {
    fontSize: 14,
    color: '#B8860B',
    fontWeight: '500',
  },
  filhoPagamentoSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  filhoModalidades: {
    gap: 8,
    marginBottom: 12,
  },
  filhoModalidadeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  filhoModalidadeNome: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
  },
  filhoModalidadeGraduacao: {
    fontSize: 12,
    color: '#B8860B',
  },
  filhoFrequencia: {
    marginBottom: 8,
  },
  frequenciaRow: {
    marginBottom: 4,
  },
  frequenciaPorcentagem: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  filhoData: {
    fontSize: 12,
    color: '#666',
  },
  presencaCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    gap: 12,
  },
  presencaNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
  },
  presencaContainer: {
    alignItems: 'center',
    gap: 8,
  },
  presencaButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  presencaButtonAvailable: {
    backgroundColor: '#3B82F6',
  },
  presencaButtonPending: {
    backgroundColor: '#F59E0B',
  },
  presencaButtonConfirmed: {
    backgroundColor: '#1e3a28',
    borderColor: '#22c55e',
    borderWidth: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  presencaButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  presencaButtonConfirmedText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: 'bold',
  },
  ultimaPresenca: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  filhoPresencaSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
  },
  pagamentoContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 44,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  pagamentoPago: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderColor: "#22c55e",
  },
  pagamentoAguardando: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "#f59e0b",
  },
  pagamentoPendente: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "#ef4444",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: "#333",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  pagamentoInfo: {
    backgroundColor: "#2a2a2a",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    gap: 12,
  },
  alunoInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pagamentoNome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statusDescricao: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  dataInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: 'center',
  },

  modalActions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  cancelButton: {
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#333",
  },
  confirmButton: {
    backgroundColor: '#22c55e',
  },
  reverterButton: {
    backgroundColor: '#ef4444',
  },
  cancelButtonText: {
    color: "#CCC",
    fontWeight: "600",
    fontSize: 16,
  },
  confirmButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  reverterButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  deleteContent: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    textAlign: 'center',
  },
  deleteText: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'center',
    lineHeight: 20,
  },
  deleteUserName: {
    fontWeight: 'bold',
    color: '#FFF',
  },
  deleteWarning: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  deleteConfirmButton: {
    backgroundColor: '#ef4444',
  },
  deleteConfirmButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },

  professoresCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  professoresList: {
    gap: 12,
  },
  professorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  professorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  professorDetails: {
    flex: 1,
  },
  professorNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  professorEmail: {
    fontSize: 12,
    color: '#B8860B',
  },
  semProfessoresText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 16,
  },
  filhoProfessoresSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  filhoSectionLabel: {
    fontSize: 12,
    color: '#B8860B',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  filhoProfessoresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filhoProfessorChip: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B8860B',
  },
  filhoProfessorChipText: {
    fontSize: 11,
    color: '#B8860B',
    fontWeight: '500',
  },
   infoFieldContainer: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#B8860B',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#B8860B',
    minHeight: 44,
  },

});