// src/hooks/usePresenca.ts
import { db } from '@/config/firebaseConfig';
import { PresencaParaConfirmar, PresencaStats } from '@/types/admin';
import { CalendarDay, Filho, PresencaRecord } from '@/types/usuarios';
import { collection, doc, getDoc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './useAuth';

export const usePresenca = (userId?: string) => {
    const [presencaRecords, setPresencaRecords] = useState<PresencaRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const { usuario } = useAuth();
    const [presencasParaConfirmar, setPresencasParaConfirmar] = useState<PresencaParaConfirmar[]>([]);
    const currentUserId = userId || usuario?.id;
    const isChild = !!userId;

    // Utilitário para formatar a data como YYYY-MM-DD
    const formatDate = (date: Date): string => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const today = new Date();
    const todayString = formatDate(today);
    const currentYear = today.getFullYear();

    // FUNÇÃO CRÍTICA: Verificar se é um novo dia
    const isNewDay = (): boolean => {
        if (presencaRecords.length === 0) return true;

        // Encontrar o último registro de presença (mais recente)
        const lastRecord = presencaRecords.reduce((latest, current) => {
            const latestDate = new Date(latest.date + 'T00:00:00');
            const currentDate = new Date(current.date + 'T00:00:00');
            return currentDate > latestDate ? current : latest;
        }, presencaRecords[0]);

        // Comparar se a última presença é de HOJE
        const lastPresencaDate = new Date(lastRecord.date + 'T00:00:00');
        const todayMidnight = new Date();
        todayMidnight.setHours(0, 0, 0, 0);

        // Se a última presença não é de hoje, é um novo dia
        return lastPresencaDate < todayMidnight;
    };



    // Verificar se é 1º de janeiro
    const isFirstJanuary = () => {
        return today.getMonth() === 0 && today.getDate() === 1;
    };

    // Verificar se uma data está dentro do período válido (2 de janeiro a 31 de dezembro do ano atual)
    const isValidDate = (dateString: string): boolean => {
        const date = new Date(dateString + 'T00:00:00');
        const year = date.getFullYear();

        // Só aceita datas do ano atual
        if (year !== currentYear) return false;

        // Não aceita 1º de janeiro
        if (date.getMonth() === 0 && date.getDate() === 1) return false;

        return true;
    };

    // Filtrar presenças válidas (apenas do ano atual, exceto 1º de janeiro)
    const filterValidPresencas = (presencaArray: string[]): string[] => {
        return presencaArray.filter(dateString => isValidDate(dateString));
    };

    // Referência do documento (usuário ou filho)
    const getUserDocRef = () => {
        if (isChild && usuario?.id) {
            return doc(db, "usuarios", usuario.id);
        } else if (currentUserId) {
            return doc(db, "usuarios", currentUserId);
        }
        return null;
    };

    // FUNÇÃO CRÍTICA: Remover presenças antigas do Firebase
    const removeOldPresencasFromFirebase = async (userData: any, userDocRef: any): Promise<boolean> => {
        try {
            let presencaArray: string[] = [];

            if (isChild) {
                const filhos = userData.filhos || [];
                const filho = filhos.find((f: any) => f.id === userId);
                presencaArray = filho?.Presenca || [];
            } else {
                presencaArray = userData.Presenca || [];
            }

            // Filtrar apenas presenças válidas
            const validPresencas = filterValidPresencas(presencaArray);

            // Se houver presenças para remover, atualizar no Firebase
            if (validPresencas.length !== presencaArray.length) {
                if (isChild) {
                    const filhos = userData.filhos || [];
                    const filhoIndex = filhos.findIndex((f: any) => f.id === userId);

                    if (filhoIndex !== -1) {
                        const novosFilhos = [...filhos];
                        novosFilhos[filhoIndex] = {
                            ...filhos[filhoIndex],
                            Presenca: validPresencas
                        };

                        await updateDoc(userDocRef, {
                            filhos: novosFilhos
                        });
                    }
                } else {
                    await updateDoc(userDocRef, {
                        Presenca: validPresencas
                    });
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Erro ao remover presenças antigas do Firebase:', error);
            return false;
        }
    };

    // FUNÇÃO CRÍTICA: Limpar TODAS as presenças no dia 1º de janeiro
    const clearAllPresencasOnNewYear = async (userData: any, userDocRef: any): Promise<boolean> => {
        try {
            if (isChild) {
                const filhos = userData.filhos || [];
                const filhoIndex = filhos.findIndex((f: any) => f.id === userId);

                if (filhoIndex !== -1) {
                    const novosFilhos = [...filhos];
                    novosFilhos[filhoIndex] = {
                        ...filhos[filhoIndex],
                        Presenca: [] // Limpa TODAS as presenças
                    };

                    await updateDoc(userDocRef, {
                        filhos: novosFilhos
                    });
                }
            } else {
                await updateDoc(userDocRef, {
                    Presenca: [] // Limpa TODAS as presenças
                });
            }
            return true;
        } catch (error) {
            console.error('❌ Erro ao limpar histórico no dia 1º de janeiro:', error);
            return false;
        }
    };

    // src/hooks/usePresenca.ts

    useEffect(() => {
        const userDocRef = getUserDocRef();
        if (!userDocRef) {
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(
            userDocRef,
            async (snapshot) => {
                if (!snapshot.exists()) {
                    setPresencaRecords([]);
                    setLoading(false);
                    return;
                }

                const userData = snapshot.data();
                let presencaArray: any[] = [];

                if (isChild) {
                    const filhos = userData.filhos || [];
                    const filho = filhos.find((f: Filho) => f.id === userId);

                    // Verificar se encontrou o filho
                    if (!filho) {
                        setPresencaRecords([]);
                        setLoading(false);
                        return;
                    }
                    presencaArray = filho.Presenca || [];
                } else {
                    presencaArray = userData.Presenca || [];
                }

                // Converter corretamente para PresencaRecord[]
                const records: PresencaRecord[] = presencaArray
                    .map((item: any) => {
                        // Se for string (formato antigo)
                        if (typeof item === 'string') {
                            return {
                                date: item,
                                confirmada: false,

                            };
                        }
                        // Se for objeto (formato novo)
                        if (typeof item === 'object' && item !== null) {
                            return {
                                date: item.date || item,
                                timestamp: new Date((item.date || item) + 'T00:00:00'),
                                confirmada: item.confirmada || false
                            };
                        }
                        return null;
                    })
                    .filter((item): item is PresencaRecord => item !== null)
                    // Ordenar por data (mais recente primeiro)
                    .sort((a, b) => {
                        const dateA = new Date(a.date + 'T00:00:00');
                        const dateB = new Date(b.date + 'T00:00:00');
                        return dateB.getTime() - dateA.getTime();
                    });
                // Limpar presenças antigas ou 1º de janeiro
                if (isFirstJanuary()) {
                    setPresencaRecords([]);
                } else {
                    const recordsFiltrados = records.filter(record => {
                        const date = new Date(record.date + 'T00:00:00');

                        // somente ano atual
                        if (date.getFullYear() !== currentYear) return false;

                        // remover 1º de janeiro
                        if (date.getMonth() === 0 && date.getDate() === 1) return false;

                        return true;
                    });

                    setPresencaRecords(recordsFiltrados);

                }
                setLoading(false);
            },
            (error) => {
                console.error('❌ Erro no onSnapshot:', error);
                setPresencaRecords([]);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUserId, userId, isChild, usuario?.id]);

    const isPresencaCheckedInToday = presencaRecords.some(
        record => record.date === todayString
    );

    // Verificar se a presença de hoje está confirmada
    const isPresencaConfirmadaToday = presencaRecords.some(
        record => record.date === todayString && record.confirmada === true
    );

    // Marcar presença
    const checkIn = async (): Promise<boolean> => {
        const userDocRef = getUserDocRef();
        if (!userDocRef || !currentUserId) {
            console.error('Usuário não autenticado ou documento não encontrado');
            return false;
        }

        if (isFirstJanuary()) {
            Alert.alert('Aviso', 'Não é permitido marcar presença no dia 1º de janeiro');
            return false;
        }

        if (isPresencaCheckedInToday) {
            return false;
        }

        const dateString = formatDate(today);
        const newRecord: PresencaRecord = {
            date: dateString,
            confirmada: false
        };

        try {
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                console.error('Documento do usuário não encontrado');
                return false;
            }

            const userData = userDoc.data();

            if (isChild) {
                const filhos = userData.filhos || [];
                const filhoIndex = filhos.findIndex((f: any) => f.id === userId);
                if (filhoIndex === -1) {
                    console.error('Filho não encontrado');
                    return false;
                }

                const filhoAtual = filhos[filhoIndex];
                const presencasAtuais: PresencaRecord[] = filhoAtual.Presenca || [];

                const jaTemPresencaHoje = presencasAtuais.some(
                    (r: any) => r.date === todayString
                );

                if (jaTemPresencaHoje) {
                    Alert.alert('Aviso', 'A presença do filho já foi registrada hoje.');
                    return false;
                }

                const newRecord: PresencaRecord = {
                    date: todayString,
                    confirmada: false
                };

                const novasPresencas = [...presencasAtuais, newRecord];
                const novosFilhos = [...filhos];
                novosFilhos[filhoIndex] = { ...filhoAtual, Presenca: novasPresencas };

                await updateDoc(userDocRef, { filhos: novosFilhos });
            } else {
                const presencasAtuais: PresencaRecord[] = userData.Presenca || [];

                const jaTemPresencaHoje = presencasAtuais.some(
                    (r: any) => r.date === todayString
                );

                if (jaTemPresencaHoje) {
                    Alert.alert('Aviso', 'Você já marcou presença hoje.');
                    return false;
                }

                const newRecord: PresencaRecord = {
                    date: todayString,
                    confirmada: false
                };

                const novasPresencas = [...presencasAtuais, newRecord];
                await updateDoc(userDocRef, { Presenca: novasPresencas });
            }


            return true;
        } catch (error) {
            console.error('❌ Erro ao marcar presença:', error);
            return false;
        }
    };


    // Calcular porcentagem baseada em dias úteis POR SEMESTRE
    const calcularPorcentagemPresenca = (totalPresencas: number): number => {
        const hoje = new Date();
        const currentMonth = hoje.getMonth(); // 0-11 (janeiro=0, dezembro=11)

        // Definir semestres
        let inicioSemestre: Date;
        let fimSemestre: Date;

        if (currentMonth >= 0 && currentMonth <= 5) {
            // Primeiro semestre: janeiro a junho
            inicioSemestre = new Date(currentYear, 0, 2); // 2 de janeiro
            fimSemestre = new Date(currentYear, 5, 30); // 30 de junho
        } else {
            // Segundo semestre: julho a dezembro
            inicioSemestre = new Date(currentYear, 6, 1); // 1 de julho
            fimSemestre = new Date(currentYear, 11, 31); // 31 de dezembro
        }

        // Se hoje estiver antes do fim do semestre, usar a data atual como limite
        const dataLimite = hoje < fimSemestre ? hoje : fimSemestre;

        const diasUteisNoSemestre = calcularDiasUteis(inicioSemestre, dataLimite);

        if (diasUteisNoSemestre === 0) return 0;
        return Math.round((totalPresencas / diasUteisNoSemestre) * 100);
    };

    // Calcular dias úteis (segunda a sábado)
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

    // Obter informações do semestre atual
    const getSemestreInfo = () => {
        const currentMonth = today.getMonth();
        const isPrimeiroSemestre = currentMonth >= 0 && currentMonth <= 5;

        return {
            isPrimeiroSemestre,
            nome: isPrimeiroSemestre ? '1º Semestre' : '2º Semestre',
            periodo: isPrimeiroSemestre ? 'Jan-Jun' : 'Jul-Dez'
        };
    };


    // Obter última data de check-in
    const lastCheckInDate = presencaRecords.length > 0
        ? presencaRecords[0].date.split('-').reverse().join('/')
        : '';

    // Função para gerar dias do calendário (apenas ano atual)
    const generateCalendarDays = (month: Date): CalendarDay[] => {
        const records = presencaRecords;
        const current = month;
        const year = current.getFullYear();
        const monthIndex = current.getMonth();

        // Só mostrar meses do ano atual
        if (year !== currentYear) {
            return [];
        }

        const firstDayOfMonth = new Date(year, monthIndex, 1);
        const startingDay = firstDayOfMonth.getDay();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

        const days: CalendarDay[] = [];
        const todayFormatted = todayString;

        // Dias vazios do mês anterior
        for (let i = 0; i < startingDay; i++) {
            days.push({
                day: null,
                isCurrentMonth: false,
                isAttended: false,
                isToday: false,
                date: null
            });
        }

        // Dias do mês atual
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, monthIndex, i);
            const formattedDate = formatDate(date);

            // Não mostrar 1º de janeiro
            if (monthIndex === 0 && i === 1) {
                days.push({
                    day: null,
                    isCurrentMonth: false,
                    isAttended: false,
                    isToday: false,
                    date: null
                });
                continue;
            }

            const isAttended = records.some(r => r.date === formattedDate);
            const isToday = formattedDate === todayFormatted;

            days.push({
                day: i,
                isCurrentMonth: true,
                isAttended: isAttended,
                isToday: isToday,
                date: date
            });
        }

        // Completar a grade
        const totalCells = days.length;
        const remainingCells = 42 - totalCells;
        for (let i = 0; i < remainingCells; i++) {
            days.push({
                day: null,
                isCurrentMonth: false,
                isAttended: false,
                isToday: false,
                date: null
            });
        }

        return days.slice(0, Math.ceil(totalCells / 7) * 7);
    };

    // Verificar se um mês está dentro do ano atual
    const isMonthWithinLimit = (month: Date): boolean => {
        return month.getFullYear() === currentYear;
    };

    // src/hooks/usePresenca.ts

    // src/hooks/usePresenca.ts

    const confirmarPresenca = async (presencaId: string): Promise<boolean> => {
        try {

            // Extrair informações do ID - CORREÇÃO CRÍTICA
            const partes = presencaId.split('-');

            // Verificar se é usuário ou filho baseado no padrão do ID
            const tipo = partes[0]; // 'usuario' ou 'filho'

            let usuarioId: string;
            let filhoId: string | null = null;
            let data: string;

            if (tipo === 'filho') {
                // Formato: filho-usuarioId-filhoId-data
                if (partes.length < 4) {
                    console.error('❌ ID de filho mal formatado:', presencaId);
                    return false;
                }
                usuarioId = partes[1];
                filhoId = partes[2];
                data = partes.slice(3).join('-'); // A data pode conter hífens
            } else if (tipo === 'usuario') {
                // Formato: usuario-usuarioId-data
                if (partes.length < 3) {
                    console.error('❌ ID de usuário mal formatado:', presencaId);
                    return false;
                }
                usuarioId = partes[1];
                data = partes.slice(2).join('-'); // A data pode conter hífens
            } else {
                console.error('❌ Tipo de presença desconhecido:', tipo);
                return false;
            }


            const userDocRef = doc(db, "usuarios", usuarioId);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                console.error('❌ Documento do usuário não encontrado:', usuarioId);
                return false;
            }

            const userData = userDoc.data();
            let atualizou = false;

            if (tipo === 'filho' && filhoId) {
                // Confirmar presença do filho
                const filhos = userData.filhos || [];
                const filhoIndex = filhos.findIndex((f: any) => f.id === filhoId);

                if (filhoIndex === -1) {
                    console.error('❌ Filho não encontrado:', filhoId);
                    return false;
                }

                const filhoAtual = filhos[filhoIndex];
                const presencasAtuais: any[] = filhoAtual.Presenca || [];


                // Atualizar a presença específica para confirmada - CORREÇÃO CRÍTICA
                const novasPresencas = presencasAtuais.map((presenca: any) => {
                    const presencaDate = typeof presenca === 'string' ? presenca : presenca.date;
                    if (presencaDate === data) {
                        atualizou = true;
                        // Retornar como objeto com date e confirmada
                        return {
                            date: data,
                            confirmada: true
                        };
                    }
                    // Manter o formato original
                    return presenca;
                });


                const novosFilhos = [...filhos];
                novosFilhos[filhoIndex] = {
                    ...filhoAtual,
                    Presenca: novasPresencas
                };

                await updateDoc(userDocRef, { filhos: novosFilhos });

            } else if (tipo === 'usuario') {
                // Confirmar presença do usuário principal
                const presencasAtuais: any[] = userData.Presenca || [];


                // Atualizar a presença específica para confirmada - CORREÇÃO CRÍTICA
                const novasPresencas = presencasAtuais.map((presenca: any) => {
                    const presencaDate = typeof presenca === 'string' ? presenca : presenca.date;
                    if (presencaDate === data) {
                        atualizou = true;
                        // Retornar como objeto com date e confirmada
                        return {
                            date: data,
                            confirmada: true
                        };
                    }
                    // Manter o formato original
                    return presenca;
                });


                await updateDoc(userDocRef, { Presenca: novasPresencas });
            }

            if (!atualizou) {
                console.error('❌ Presença não encontrada para confirmação');
                return false;
            }

            // ATUALIZAR A LISTA LOCAL APÓS CONFIRMAR
            setTimeout(() => {
                buscarPresencasDoDia(); // Usar a mesma data da presença confirmada
            }, 1000);

            return true;
        } catch (error) {
            console.error('❌ Erro ao confirmar presença:', error);
            return false;
        }
    };

    // src/hooks/usePresenca.ts

    // Função para confirmar TODAS as presenças de hoje
    const confirmarTodasPresencasHoje = async (): Promise<{ success: boolean; confirmed: number }> => {
        try {

            const querySnapshot = await getDocs(collection(db, "usuarios"));
            let totalConfirmadas = 0;
            const batchUpdates: Promise<void>[] = [];

            // Percorrer todos os usuários
            for (const userDoc of querySnapshot.docs) {
                const usuarioData = userDoc.data();
                const usuarioId = userDoc.id;
                let needsUpdate = false;

                // Atualizar presenças do usuário principal
                const presencasUsuario = usuarioData.Presenca || [];
                const novasPresencasUsuario = presencasUsuario.map((presenca: any) => {
                    const presencaDate = typeof presenca === 'string' ? presenca : presenca.date;

                    if (presencaDate === todayString) {
                        const isAlreadyConfirmed = typeof presenca === 'object' ? presenca.confirmada : false;

                        if (!isAlreadyConfirmed) {
                            totalConfirmadas++;
                            needsUpdate = true;
                            return {
                                date: todayString,
                                confirmada: true
                            };
                        }
                    }
                    return presenca;
                });

                // Atualizar presenças dos filhos
                const filhos = usuarioData.filhos || [];
                const novosFilhos = filhos.map((filho: any) => {
                    const presencasFilho = filho.Presenca || [];
                    const novasPresencasFilho = presencasFilho.map((presenca: any) => {
                        const presencaDate = typeof presenca === 'string' ? presenca : presenca.date;

                        if (presencaDate === todayString) {
                            const isAlreadyConfirmed = typeof presenca === 'object' ? presenca.confirmada : false;

                            if (!isAlreadyConfirmed) {
                                totalConfirmadas++;
                                needsUpdate = true;
                                return {
                                    date: todayString,
                                    confirmada: true
                                };
                            }
                        }
                        return presenca;
                    });

                    return {
                        ...filho,
                        Presenca: novasPresencasFilho
                    };
                });

                // Se houve alterações, adicionar à lista de atualizações
                if (needsUpdate) {
                    const userDocRef = doc(db, "usuarios", usuarioId);

                    if (novasPresencasUsuario !== presencasUsuario || JSON.stringify(novosFilhos) !== JSON.stringify(filhos)) {
                        const updateData: any = {};

                        if (novasPresencasUsuario !== presencasUsuario) {
                            updateData.Presenca = novasPresencasUsuario;
                        }

                        if (JSON.stringify(novosFilhos) !== JSON.stringify(filhos)) {
                            updateData.filhos = novosFilhos;
                        }

                        batchUpdates.push(updateDoc(userDocRef, updateData));
                    }
                }
            }

            // Executar todas as atualizações em paralelo
            if (batchUpdates.length > 0) {
                await Promise.all(batchUpdates);

                // Recarregar a lista após confirmar
                setTimeout(() => {
                    buscarPresencasDoDia();
                }, 1000);
            } else {
            }

            return {
                success: true,
                confirmed: totalConfirmadas
            };

        } catch (error) {
            console.error('❌ Erro ao confirmar todas as presenças de hoje:', error);
            return {
                success: false,
                confirmed: 0
            };
        }
    };



    const buscarPresencasDoDia = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "usuarios"));
            const todasPresencas: PresencaParaConfirmar[] = [];

            querySnapshot.forEach((doc) => {
                const usuarioData = doc.data();

                //  Presenças do usuário
                const presencasUsuario = usuarioData.Presenca || [];
                presencasUsuario.forEach((presenca: any) => {
                    const confirmada = presenca.confirmada || false;

                    // Mostrar todas as NÃO confirmadas (qualquer data)
                    // e apenas as confirmadas de HOJE
                    if (!confirmada || presenca.date === todayString) {
                        todasPresencas.push({
                            id: `usuario-${doc.id}-${presenca.date}`,
                            usuarioId: doc.id,
                            usuarioNome: usuarioData.nome,
                            data: presenca.date,
                            modalidades: usuarioData.modalidades?.map((m: any) => m.modalidade) || [],
                            confirmada,
                            tipo: 'usuario'
                        });
                    }
                });

                //  Presenças dos filhos
                const filhos = usuarioData.filhos || [];
                filhos.forEach((filho: any) => {
                    const presencasFilho = filho.Presenca || [];
                    presencasFilho.forEach((presenca: any) => {
                        const confirmada = presenca.confirmada || false;

                        if (!confirmada || presenca.date === todayString) {
                            todasPresencas.push({
                                id: `filho-${doc.id}-${filho.id}-${presenca.date}`,
                                usuarioId: doc.id,
                                usuarioNome: usuarioData.nome,
                                filhoId: filho.id,
                                filhoNome: filho.nome,
                                data: presenca.date,
                                modalidades: filho.modalidades?.map((m: any) => m.modalidade) || [],
                                confirmada,
                                tipo: 'filho'
                            });
                        }
                    });
                });
            });

            //  Atualiza o estado
            setPresencasParaConfirmar(todasPresencas);

        } catch (error) {
            console.error('Erro ao buscar presenças:', error);
            Alert.alert('Erro', 'Não foi possível carregar as presenças');
        } finally {
            setLoading(false);
        }
    };


    // Adicionar este useEffect no hook usePresenca
    useEffect(() => {
        // Carregar presenças do dia atual quando o hook for montado
        buscarPresencasDoDia();
    }, [todayString]); // Recarregar quando a data mudar

    const stats: PresencaStats = {
        totalParaConfirmar: presencasParaConfirmar.length,
        confirmadasHoje: presencasParaConfirmar.filter(p => p.confirmada).length,
        pendentesHoje: presencasParaConfirmar.filter(p => !p.confirmada).length
    };

    // Adicionar esta função no retorno do hook
    const recarregarPresencas = () => {
        buscarPresencasDoDia();
    };


    return {
        presencaRecords,
        loading,
        checkIn,
        isPresencaCheckedInToday,
        isPresencaConfirmadaToday,
        isNewDay,
        lastCheckInDate,
        todayString,
        currentYear,
        formatDate,
        generateCalendarDays,
        isMonthWithinLimit,
        isFirstJanuary: isFirstJanuary(),
        calcularPorcentagemPresenca,
        getSemestreInfo,
        confirmarPresenca,
        confirmarTodasPresencasHoje,
        buscarPresencasDoDia,
        recarregarPresencas,
        presencasParaConfirmar,
        stats,
    };
};