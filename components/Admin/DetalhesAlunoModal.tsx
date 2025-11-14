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

// Função para calcular informações do semestre (igual ao hook)
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

// Função para calcular dias úteis (igual ao hook)
const calcularDiasUteis = (inicio: Date, fim: Date): number => {
  let count = 0;
  const current = new Date(inicio);

  while (current <= fim) {
    const day = current.getDay();
    const isPrimeiroJaneiro = current.getMonth() === 0 && current.getDate() === 1;

    // Conta apenas de segunda (1) a sábado (6), exceto 1º de janeiro
    if (day >= 1 && day <= 6 && !isPrimeiroJaneiro) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
};

// Função para calcular porcentagem (igual ao hook)
const calcularPorcentagemPresenca = (totalPresencas: number): number => {
  const hoje = new Date();
  const currentYear = hoje.getFullYear();
  const currentMonth = hoje.getMonth();

  // Definir semestres
  let inicioSemestre: Date;
  let fimSemestre: Date;

  if (currentMonth >= 0 && currentMonth <= 5) {
    // Primeiro semestre: janeiro a junho
    inicioSemestre = new Date(currentYear, 0, 2);
    fimSemestre = new Date(currentYear, 5, 30);
  } else {
    // Segundo semestre: julho a dezembro
    inicioSemestre = new Date(currentYear, 6, 1);
    fimSemestre = new Date(currentYear, 11, 31);
  }

  // Se hoje estiver antes do fim do semestre, usar a data atual como limite
  const dataLimite = hoje < fimSemestre ? hoje : fimSemestre;

  const diasUteisNoSemestre = calcularDiasUteis(inicioSemestre, dataLimite);

  if (diasUteisNoSemestre === 0) return 0;
  return Math.round((totalPresencas / diasUteisNoSemestre) * 100);
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

  // 🔥 CORREÇÃO: Função segura para obter presenças
  const obterArrayPresenca = (dados: any, filho?: any): string[] => {
    try {
      if (filho) {
        // Para filhos, tentar diferentes possíveis nomes de campo
        return Array.isArray(filho.Presenca) ? filho.Presenca : 
               Array.isArray(filho.presenca) ? filho.presenca :
               Array.isArray(filho.avisaPresenca) ? filho.avisaPresenca : [];
      } else {
        // Para usuário principal, tentar diferentes possíveis nomes de campo
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
    
    // Filtrar presenças dos últimos 30 dias
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

    // 🔥 CORREÇÃO: Usar a função local para calcular porcentagem
    const porcentagemSemestre = calcularPorcentagemPresenca(totalPresencas);

    return { 
      total: totalPresencas, 
      ultimoMes,
      porcentagemSemestre 
    };
  };

  // 🔥 CORREÇÃO: Usar função segura para obter presenças
  const presencaUsuario = obterArrayPresenca(usuario);
  const frequenciaUsuario = calcularFrequencia(presencaUsuario);

  // Determinar cor baseada na porcentagem
  const getPorcentagemColor = (porcentagem: number): string => {
    if (porcentagem >= 75) return '#22c55e'; // Verde
    if (porcentagem >= 50) return '#eab308'; // Amarelo
    return '#ef4444'; // Vermelho
  };

  // Obter informações do semestre
  const semestreInfo = getSemestreInfo();

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

          {/* Filhos */}
          {usuario.filhos && usuario.filhos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Filhos Registrados</Text>
              <View style={styles.filhosList}>
                {usuario.filhos.map((filho, index) => {
                  // 🔥 CORREÇÃO: Usar função segura para obter presenças dos filhos
                  const presencaFilho = obterArrayPresenca(usuario, filho);
                  const frequenciaFilho = calcularFrequencia(presencaFilho);
                  
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
                          <Text style={[
                            styles.frequenciaPorcentagem,
                            { color: getPorcentagemColor(frequenciaFilho.porcentagemSemestre) }
                          ]}>
                            {frequenciaFilho.porcentagemSemestre}% no semestre
                          </Text>
                        </View>
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

// Os estilos permanecem os mesmos...
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
});