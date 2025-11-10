// components/Admin/DetalhesAlunoModal.tsx
import { UsuarioCompleto } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface DetalhesAlunoModalProps {
  visible: boolean;
  usuario: UsuarioCompleto | null;
  onClose: () => void;
}

// Função para formatar datas
const formatarData = (data: string | Date) => {
  if (!data) return 'Não informado';
  
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  
  // Verificar se a data é válida
  if (isNaN(dataObj.getTime())) return 'Data inválida';
  
  return dataObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const DetalhesAlunoModal: React.FC<DetalhesAlunoModalProps> = ({
  visible,
  usuario,
  onClose,
}) => {
  if (!usuario) return null;

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

  const calcularFrequencia = (avisaPresenca: string[] = []) => {
    const totalPresencas = avisaPresenca.length;
    
    // Filtrar presenças dos últimos 30 dias
    const ultimoMes = avisaPresenca.filter(dataPresencaStr => {
      try {
        const dataPresenca = new Date(dataPresencaStr);
        const umMesAtras = new Date();
        umMesAtras.setMonth(umMesAtras.getMonth() - 1);
        return dataPresenca >= umMesAtras;
      } catch {
        return false;
      }
    }).length;

    return { total: totalPresencas, ultimoMes };
  };

  const frequenciaUsuario = calcularFrequencia(usuario.avisaPresenca);

  // Encontrar a última aula (mais recente)
  const encontrarUltimaAula = (avisaPresenca: string[] = []) => {
    if (!avisaPresenca.length) return 'Nunca';
    
    try {
      // Ordenar datas e pegar a mais recente
      const datasOrdenadas = avisaPresenca
        .map(data => new Date(data))
        .filter(data => !isNaN(data.getTime()))
        .sort((a, b) => b.getTime() - a.getTime());
      
      return datasOrdenadas.length > 0 ? formatarData(datasOrdenadas[0]) : 'Nunca';
    } catch {
      return 'Nunca';
    }
  };

  const ultimaAula = encontrarUltimaAula(usuario.avisaPresenca);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#B8860B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Aluno</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {/* Informações Básicas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nome:</Text>
                <Text style={styles.infoValue}>{usuario.nome}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{usuario.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Telefone:</Text>
                <Text style={styles.infoValue}>{usuario.telefone || 'Não informado'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Data de Registro:</Text>
                <Text style={styles.infoValue}>
                  {formatarData(usuario.dataDeRegistro)}
                </Text>
              </View>
            </View>
          </View>

          {/* Status do Pagamento */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status do Pagamento</Text>
            <View style={[
              styles.pagamentoCard,
              { backgroundColor: usuario.pagamento ? '#1a3a1a' : '#3a1a1a' }
            ]}>
              <Ionicons
                name={usuario.pagamento ? "checkmark-circle" : "alert-circle"}
                size={24}
                color={usuario.pagamento ? "#22c55e" : "#ef4444"}
              />
              <View style={styles.pagamentoInfo}>
                <Text style={styles.pagamentoStatus}>
                  {usuario.pagamento ? 'Pagamento em dia' : 'Pagamento pendente'}
                </Text>
                <Text style={styles.pagamentoData}>
                  Dia de pagamento: {usuario.dataPagamento ? 
                    new Date(usuario.dataPagamento).getDate() : '-'} de cada mês
                </Text>
              </View>
            </View>
          </View>

          {/* Modalidades */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Modalidades</Text>
            <View style={styles.modalidadesList}>
              {usuario.modalidades?.map((modalidade, index) => (
                <View key={index} style={styles.modalidadeCard}>
                  <View style={styles.modalidadeHeader}>
                    <Text style={styles.modalidadeNome}>
                      {modalidade.modalidade}
                    </Text>
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
          </View>

          {/* Frequência do Usuário */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequência</Text>
            <View style={styles.frequenciaCard}>
              <View style={styles.frequenciaItem}>
                <Text style={styles.frequenciaNumber}>
                  {frequenciaUsuario.total}
                </Text>
                <Text style={styles.frequenciaLabel}>Total de aulas</Text>
              </View>
              <View style={styles.frequenciaItem}>
                <Text style={styles.frequenciaNumber}>
                  {frequenciaUsuario.ultimoMes}
                </Text>
                <Text style={styles.frequenciaLabel}>Últimos 30 dias</Text>
              </View>
              <View style={styles.frequenciaItem}>
                <Text style={styles.frequenciaNumber}>
                  {ultimaAula}
                </Text>
                <Text style={styles.frequenciaLabel}>Última aula</Text>
              </View>
            </View>
          </View>

          {/* Filhos */}
          {usuario.filhos && usuario.filhos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Alunos Cadastrados</Text>
              <View style={styles.filhosList}>
                {usuario.filhos.map((filho, index) => {
                  const frequenciaFilho = calcularFrequencia(filho.avisaPresenca);
                  const ultimaAulaFilho = encontrarUltimaAula(filho.avisaPresenca);
                  
                  return (
                    <View key={filho.id || `filho-${index}`} style={styles.filhoCard}>
                      <View style={styles.filhoHeader}>
                        <Text style={styles.filhoNome}>{filho.nome}</Text>
                        {filho.idade && (
                          <Text style={styles.filhoIdade}>{filho.idade} anos</Text>
                        )}
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

                      {/* Frequência do Filho */}
                      <View style={styles.filhoFrequencia}>
                        <View style={styles.frequenciaRow}>
                          <Text style={styles.frequenciaLabel}>
                            Total: {frequenciaFilho.total} aulas
                          </Text>
                          <Text style={styles.frequenciaSubLabel}>
                            {frequenciaFilho.ultimoMes} nos últimos 30 dias
                          </Text>
                        </View>
                        <Text style={styles.ultimaAulaText}>
                          Última aula: {ultimaAulaFilho}
                        </Text>
                      </View>

                      <Text style={styles.filhoData}>
                        Registrado em: {formatarData(filho.dataDeRegistro)}
                      </Text>
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
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
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
  infoLabel: {
    fontSize: 14,
    color: '#B8860B',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  pagamentoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    gap: 12,
  },
  pagamentoInfo: {
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
  frequenciaSubLabel: {
    fontSize: 11,
    color: '#888',
  },
  ultimaAulaText: {
    fontSize: 12,
    color: '#B8860B',
    fontStyle: 'italic',
  },
  filhoData: {
    fontSize: 12,
    color: '#666',
  },
});