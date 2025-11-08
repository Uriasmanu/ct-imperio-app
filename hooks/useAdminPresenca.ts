// src/hooks/useAdminPresenca.ts
import { db } from '@/config/firebaseConfig';
import { PresencaParaConfirmar, PresencaStats } from '@/types/admin';
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const useAdminPresenca = () => {
    const [presencasParaConfirmar, setPresencasParaConfirmar] = useState<PresencaParaConfirmar[]>([]);
    const [loading, setLoading] = useState(true);

    // Buscar todas as presenças do dia
    const buscarPresencasDoDia = async (data: string = new Date().toISOString().split('T')[0]) => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "usuarios"));
            const todasPresencas: PresencaParaConfirmar[] = [];

            querySnapshot.forEach((doc) => {
                const usuarioData = doc.data();

                // Presenças do usuário
                const presencasUsuario = usuarioData.Presenca || [];
                presencasUsuario.forEach((presenca: any) => {
                    if (presenca.date === data) {
                        todasPresencas.push({
                            id: `usuario-${doc.id}-${presenca.date}`, 
                            usuarioId: doc.id,
                            usuarioNome: usuarioData.nome,
                            data: presenca.date,
                            timestamp: new Date(presenca.date + 'T00:00:00'),
                            modalidades: usuarioData.modalidades?.map((m: any) => m.modalidade) || [],
                            confirmada: presenca.confirmada || false,
                            tipo: 'usuario'
                        });
                    }
                });

                // Presenças dos filhos
                const filhos = usuarioData.filhos || [];
                filhos.forEach((filho: any) => {
                    const presencasFilho = filho.Presenca || [];
                    presencasFilho.forEach((presenca: any) => {
                        if (presenca.date === data) {
                            todasPresencas.push({
                                id: `filho-${filho.id}-${presenca.date}`,
                                usuarioId: doc.id,
                                usuarioNome: usuarioData.nome,
                                filhoId: filho.id,
                                filhoNome: filho.nome,
                                data: presenca.date,
                                timestamp: new Date(presenca.date + 'T00:00:00'),
                                modalidades: filho.modalidades?.map((m: any) => m.modalidade) || [],
                                confirmada: presenca.confirmada || false,
                                tipo: 'filho'
                            });
                        }
                    });
                });
            });

            // Ordenar por horário (mais recente primeiro)
            todasPresencas.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            setPresencasParaConfirmar(todasPresencas);
        } catch (error) {
            console.error('Erro ao buscar presenças:', error);
            Alert.alert('Erro', 'Não foi possível carregar as presenças');
        } finally {
            setLoading(false);
        }
    };

    // Confirmar presença
    const confirmarPresenca = async (presencaId: string) => {
        try {
            const [tipo, userId, data] = presencaId.split('-'); 

            const userDocRef = doc(db, "usuarios", userId);

            if (tipo === 'usuario') {
                const userDoc = await getDoc(userDocRef);
                
                // ✅ VERIFICAÇÃO ADICIONADA
                if (!userDoc.exists()) {
                    Alert.alert('Erro', 'Usuário não encontrado');
                    return false;
                }

                const userData = userDoc.data();
                
                // ✅ VERIFICAÇÃO ADICIONADA
                if (!userData) {
                    Alert.alert('Erro', 'Dados do usuário não encontrados');
                    return false;
                }

                const presencasAtuais = userData.Presenca || [];
                const presencasAtualizadas = presencasAtuais.map((presenca: any) =>
                    presenca.date === data ? { ...presenca, confirmada: true } : presenca
                );

                await updateDoc(userDocRef, { Presenca: presencasAtualizadas });
            } else {
                // Para filhos
                const userDoc = await getDoc(userDocRef);
                
                // ✅ VERIFICAÇÃO ADICIONADA
                if (!userDoc.exists()) {
                    Alert.alert('Erro', 'Usuário não encontrado');
                    return false;
                }

                const userData = userDoc.data();
                
                // ✅ VERIFICAÇÃO ADICIONADA
                if (!userData) {
                    Alert.alert('Erro', 'Dados do usuário não encontrados');
                    return false;
                }

                const filhosAtuais = userData.filhos || [];
                const filhosAtualizados = filhosAtuais.map((filho: any) => {
                    const presencasFilho = filho.Presenca || [];
                    return {
                        ...filho,
                        Presenca: presencasFilho.map((presenca: any) =>
                            presenca.date === data ? { ...presenca, confirmada: true } : presenca
                        )
                    };
                });

                await updateDoc(userDocRef, { filhos: filhosAtualizados });
            }

            // Atualizar lista local
            setPresencasParaConfirmar(prev =>
                prev.map(p => p.id === presencaId ? { ...p, confirmada: true } : p)
            );

            Alert.alert('Sucesso', 'Presença confirmada com sucesso!');
            return true;
        } catch (error) {
            console.error('Erro ao confirmar presença:', error);
            Alert.alert('Erro', 'Não foi possível confirmar a presença');
            return false;
        }
    };

    // Estatísticas
    const stats: PresencaStats = {
        totalParaConfirmar: presencasParaConfirmar.length,
        confirmadasHoje: presencasParaConfirmar.filter(p => p.confirmada).length,
        pendentesHoje: presencasParaConfirmar.filter(p => !p.confirmada).length
    };

    useEffect(() => {
        buscarPresencasDoDia();
    }, []);

    return {
        presencasParaConfirmar,
        stats,
        loading,
        confirmarPresenca,
        buscarPresencasDoDia
    };
};