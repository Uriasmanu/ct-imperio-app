// components/Admin/ListaAlunos.tsx
import { UsuarioCompleto } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ListaAlunosProps {
    usuarios: UsuarioCompleto[];
    onAbrirDetalhes: (usuario: UsuarioCompleto) => void;
    refreshing: boolean;
    onRefresh: () => void;
}

export const ListaAlunos: React.FC<ListaAlunosProps> = ({
    usuarios = [], // Valor padrão para evitar undefined
    onAbrirDetalhes,
    refreshing,
    onRefresh,
}) => {
    const [busca, setBusca] = useState('');
    const [filtroModalidade, setFiltroModalidade] = useState('todas');

    // Função para calcular porcentagem de frequência
    const calcularFrequencia = (avisaPresenca: string[] = []) => {
        const totalPresencas = avisaPresenca?.length || 0;

        // Considerando 4 semanas por mês (aproximação)
        const presencasEsperadas = 16; // 4 aulas por semana × 4 semanas
        const porcentagem = Math.min((totalPresencas / presencasEsperadas) * 100, 100);

        return {
            total: totalPresencas,
            porcentagem: Math.round(porcentagem)
        };
    };

    // Função para formatar data do último pagamento
    const formatarUltimoPagamento = (dataUltimoPagamento: string) => {
        if (!dataUltimoPagamento) return 'Nunca';

        try {
            const data = new Date(dataUltimoPagamento);
            if (isNaN(data.getTime())) return 'Data inválida';

            const hoje = new Date();
            const diffTime = Math.abs(hoje.getTime() - data.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return 'Hoje';
            if (diffDays === 1) return 'Ontem';
            if (diffDays < 30) return `${diffDays} dias atrás`;

            const diffMonths = Math.floor(diffDays / 30);
            if (diffMonths === 1) return '1 mês atrás';
            return `${diffMonths} meses atrás`;
        } catch {
            return 'Data inválida';
        }
    };

    // Filtrar usuários com validações
    const usuariosFiltrados = usuarios.filter(usuario => {
        if (!usuario) return false;

        // Filtro por busca
        if (busca && !usuario.nome?.toLowerCase().includes(busca.toLowerCase())) {
            return false;
        }

        // Filtro por modalidade
        if (filtroModalidade !== 'todas') {
            const modalidades = usuario.modalidades || [];
            if (!modalidades.some(m => m?.modalidade === filtroModalidade)) {
                return false;
            }
        }

        return true;
    });

    return (
        <View style={styles.container}>
            {/* CABEÇALHO E FILTROS */}
            <View style={styles.header}>
                <View style={styles.sectionTitleContainer}>
                    <Ionicons name="list" size={22} color="#B8860B" />
                    <Text style={styles.sectionTitle}>Lista de Alunos</Text>
                </View>

                {/* BARRA DE BUSCA */}
                <View style={styles.buscaContainer}>
                    <Ionicons name="search" size={20} color="#666" />
                    <TextInput
                        style={styles.buscaInput}
                        placeholder="Buscar aluno..."
                        placeholderTextColor="#666"
                        value={busca}
                        onChangeText={setBusca}
                    />
                    {busca ? (
                        <TouchableOpacity onPress={() => setBusca('')}>
                            <Ionicons name="close-circle" size={20} color="#666" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* FILTRO DE MODALIDADE */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filtrosHorizontal}
                >
                    <TouchableOpacity
                        style={[
                            styles.filtroChip,
                            filtroModalidade === 'todas' && styles.filtroChipAtivo
                        ]}
                        onPress={() => setFiltroModalidade('todas')}
                    >
                        <Text style={[
                            styles.filtroChipText,
                            filtroModalidade === 'todas' && styles.filtroChipTextAtivo
                        ]}>
                            Todas
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filtroChip,
                            filtroModalidade === 'Muay Thai' && styles.filtroChipAtivo
                        ]}
                        onPress={() => setFiltroModalidade('Muay Thai')}
                    >
                        <Text style={[
                            styles.filtroChipText,
                            filtroModalidade === 'Muay Thai' && styles.filtroChipTextAtivo
                        ]}>
                            Muay Thai
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filtroChip,
                            filtroModalidade === 'Jiu-Jitsu' && styles.filtroChipAtivo
                        ]}
                        onPress={() => setFiltroModalidade('Jiu-Jitsu')}
                    >
                        <Text style={[
                            styles.filtroChipText,
                            filtroModalidade === 'Jiu-Jitsu' && styles.filtroChipTextAtivo
                        ]}>
                            Jiu-Jitsu
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filtroChip,
                            filtroModalidade === 'Boxe' && styles.filtroChipAtivo
                        ]}
                        onPress={() => setFiltroModalidade('Boxe')}
                    >
                        <Text style={[
                            styles.filtroChipText,
                            filtroModalidade === 'Boxe' && styles.filtroChipTextAtivo
                        ]}>
                            Boxe
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filtroChip,
                            filtroModalidade === 'MMA' && styles.filtroChipAtivo
                        ]}
                        onPress={() => setFiltroModalidade('MMA')}
                    >
                        <Text style={[
                            styles.filtroChipText,
                            filtroModalidade === 'MMA' && styles.filtroChipTextAtivo
                        ]}>
                            MMA
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* LISTA DE ALUNOS */}
            <ScrollView
                style={styles.listaContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#B8860B"]}
                        tintColor="#B8860B"
                    />
                }
            >
                <View style={styles.resultadosInfo}>
                    <Text style={styles.resultadosTexto}>
                        {usuariosFiltrados.length} de {usuarios.length} alunos
                    </Text>
                </View>

                {usuariosFiltrados.length > 0 ? (
                    usuariosFiltrados.map((usuario) => {
                        if (!usuario) return null;

                        const frequencia = calcularFrequencia(usuario.avisaPresenca);
                        const modalidadesAtivas = (usuario.modalidades || []).filter(m => m?.ativo);
                        const possuiFilhos = usuario.filhos && usuario.filhos.length > 0;

                        return (
                            <TouchableOpacity
                                key={usuario.id}
                                style={styles.alunoCard}
                                onPress={() => onAbrirDetalhes(usuario)}
                            >
                                {/* CABEÇALHO DO CARD */}
                                <View style={styles.cardHeader}>
                                    <View style={styles.alunoInfo}>
                                        <Text style={styles.alunoNome}>{usuario.nome || 'Nome não informado'}</Text>
                                        <View style={styles.statusRow}>
                                            <Ionicons
                                                name={usuario.pagamento ? "checkmark-circle" : "alert-circle"}
                                                size={16}
                                                color={usuario.pagamento ? "#22c55e" : "#ef4444"}
                                            />
                                            <Text style={[
                                                styles.statusPagamento,
                                                { color: usuario.pagamento ? "#22c55e" : "#ef4444" }
                                            ]}>
                                                {usuario.pagamento ? 'Em dia' : 'Pendente'}
                                            </Text>
                                        </View>
                                    </View>

                                    <Ionicons name="chevron-forward" size={20} color="#B8860B" />
                                </View>

                                {/* INFORMAÇÕES PRINCIPAIS */}
                                <View style={styles.cardContent}>
                                    {/* FREQUÊNCIA */}
                                    <View style={styles.infoItem}>
                                        <Ionicons name="calendar" size={16} color="#B8860B" />
                                        <Text style={styles.infoLabel}>Frequência:</Text>
                                        <View style={styles.frequenciaContainer}>
                                            <Text style={styles.frequenciaPorcentagem}>
                                                {frequencia.porcentagem}%
                                            </Text>
                                            <View style={styles.barraFrequencia}>
                                                <View
                                                    style={[
                                                        styles.barraPreenchimento,
                                                        {
                                                            width: `${frequencia.porcentagem}%`,
                                                            backgroundColor:
                                                                frequencia.porcentagem >= 80 ? '#22c55e' :
                                                                    frequencia.porcentagem >= 60 ? '#eab308' : '#ef4444'
                                                        }
                                                    ]}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    {/* ÚLTIMO PAGAMENTO */}
                                    <View style={styles.infoItem}>
                                        <Ionicons name="cash" size={16} color="#B8860B" />
                                        <Text style={styles.infoLabel}>Último pagamento:</Text>
                                        <Text style={styles.infoValue}>
                                            {formatarUltimoPagamento(usuario.dataUltimoPagamento)}
                                        </Text>
                                    </View>

                                    {/* MODALIDADES */}
                                    <View style={styles.infoItem}>
                                        <Ionicons name="fitness" size={16} color="#B8860B" />
                                        <Text style={styles.infoLabel}>Modalidades:</Text>
                                        <View style={styles.modalidadesContainer}>
                                            {modalidadesAtivas.length > 0 ? (
                                                modalidadesAtivas.map((modalidade, index) => (
                                                    <View
                                                        key={index}
                                                        style={[
                                                            styles.modalidadeBadge,
                                                            {
                                                                backgroundColor:
                                                                    modalidade?.modalidade === "Muay Thai" ? "#dc2626" :
                                                                        modalidade?.modalidade === "Jiu-Jitsu" ? "#1e40af" :
                                                                            modalidade?.modalidade === "Boxe" ? "#059669" : "#7c3aed",
                                                            }
                                                        ]}
                                                    >
                                                        <Text style={styles.modalidadeBadgeText}>
                                                            {modalidade?.modalidade || 'Desconhecida'}
                                                        </Text>
                                                    </View>
                                                ))
                                            ) : (
                                                <Text style={styles.infoValue}>Nenhuma modalidade</Text>
                                            )}
                                        </View>
                                    </View>

                                    {/* FILHOS */}
                                    <View style={styles.infoItem}>
                                        <Ionicons name="people" size={16} color="#B8860B" />
                                        <Text style={styles.infoLabel}>Alunos cadastrados:</Text>
                                        <Text style={styles.infoValue}>
                                            {possuiFilhos ? `${usuario.filhos!.length} aluno(s)` : 'Nenhum'}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <View style={styles.nenhumResultado}>
                        <Ionicons name="search-outline" size={56} color="#666" />
                        <Text style={styles.nenhumResultadoTitle}>
                            Nenhum aluno encontrado
                        </Text>
                        <Text style={styles.nenhumResultadoText}>
                            Tente ajustar os filtros ou termos de busca
                        </Text>
                    </View>
                )}

                <View style={styles.espacoFinal} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        marginBottom: 20,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#B8860B',
        letterSpacing: 0.5,
    },
    buscaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 12,
        gap: 12,
    },
    buscaInput: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
    },
    filtrosHorizontal: {
        marginBottom: 8,
    },
    filtroChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
        marginRight: 8,
    },
    filtroChipAtivo: {
        backgroundColor: '#B8860B',
        borderColor: '#B8860B',
    },
    filtroChipText: {
        color: '#CCC',
        fontSize: 12,
        fontWeight: '600',
    },
    filtroChipTextAtivo: {
        color: '#000',
        fontWeight: '700',
    },
    listaContainer: {
        flex: 1,
    },
    resultadosInfo: {
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    resultadosTexto: {
        color: '#AAA',
        fontSize: 14,
        fontWeight: '500',
    },
    alunoCard: {
        backgroundColor: '#1a1a1a',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    alunoInfo: {
        flex: 1,
    },
    alunoNome: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusPagamento: {
        fontSize: 12,
        fontWeight: '500',
    },
    cardContent: {
        gap: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: '#B8860B',
        fontWeight: '600',
        minWidth: 120,
    },
    infoValue: {
        fontSize: 14,
        color: '#FFF',
        fontWeight: '500',
        flex: 1,
    },
    frequenciaContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    frequenciaPorcentagem: {
        fontSize: 14,
        color: '#FFF',
        fontWeight: '600',
        minWidth: 40,
    },
    barraFrequencia: {
        flex: 1,
        height: 6,
        backgroundColor: '#333',
        borderRadius: 3,
        overflow: 'hidden',
    },
    barraPreenchimento: {
        height: '100%',
        borderRadius: 3,
    },
    modalidadesContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    modalidadeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    modalidadeBadgeText: {
        fontSize: 10,
        color: '#FFF',
        fontWeight: '600',
    },
    nenhumResultado: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
        borderStyle: 'dashed',
    },
    nenhumResultadoTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    nenhumResultadoText: {
        color: '#888',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    espacoFinal: {
        height: 20,
    },
});