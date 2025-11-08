// src/hooks/usePresenca.ts
import { db } from '@/config/firebaseConfig';
import { CalendarDay, Filho, PresencaRecord } from '@/types/usuarios';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './useAuth';

export const usePresenca = (userId?: string) => {
    const [presencaRecords, setPresencaRecords] = useState<PresencaRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const { usuario } = useAuth();

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

    const isNewDay = (): boolean => {
        // Busca a última presença registrada
        if (presencaRecords.length === 0) return true;

        const lastRecord = presencaRecords[presencaRecords.length - 1];
        return lastRecord.date !== todayString;
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

    // 🔥 FUNÇÃO CRÍTICA: Remover presenças antigas do Firebase
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
                console.log(`🗑️ Removendo ${presencaArray.length - validPresencas.length} presenças de anos anteriores do Firebase...`);

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
                        console.log('✅ Presenças antigas removidas do filho no Firebase');
                    }
                } else {
                    await updateDoc(userDocRef, {
                        Presenca: validPresencas
                    });
                    console.log('✅ Presenças antigas removidas do usuário no Firebase');
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Erro ao remover presenças antigas do Firebase:', error);
            return false;
        }
    };

    // 🔥 FUNÇÃO CRÍTICA: Limpar TODAS as presenças no dia 1º de janeiro
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
                    console.log('🎉 Histórico de presenças do filho LIMPO no dia 1º de janeiro');
                }
            } else {
                await updateDoc(userDocRef, {
                    Presenca: [] // Limpa TODAS as presenças
                });
                console.log('🎉 Histórico de presenças do usuário LIMPO no dia 1º de janeiro');
            }
            return true;
        } catch (error) {
            console.error('❌ Erro ao limpar histórico no dia 1º de janeiro:', error);
            return false;
        }
    };

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
                let presencaArray: any[] = []; // Mudei para any[] para aceitar ambos os formatos

                if (isChild) {
                    const filhos = userData.filhos || [];
                    const filho = filhos.find((f: Filho) => f.id === userId);
                    presencaArray = filho?.Presenca || [];
                } else {
                    presencaArray = userData.Presenca || [];
                }

                // 🔥 CONVERSÃO CRÍTICA: Converter para PresencaRecord[]
                const records: PresencaRecord[] = presencaArray
                    .map((item: any) => {
                        // Se for string (formato antigo)
                        if (typeof item === 'string') {
                            return {
                                date: item,
                                confirmada: false
                            };
                        }
                        // Se for objeto (formato novo)
                        if (typeof item === 'object' && item !== null) {
                            return {
                                date: item.date,
                                timestamp: new Date(item.date + 'T00:00:00'),
                                confirmada: item.confirmada || false
                            };
                        }
                        return null;
                    })
                    .filter((item): item is PresencaRecord => item !== null)

                // Limpar presenças antigas ou 1º de janeiro
                if (isFirstJanuary()) {
                    setPresencaRecords([]);
                } else {
                    setPresencaRecords(records);
                }
                setLoading(false);
            },
            (error) => {
                console.error(error);
                setPresencaRecords([]);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUserId, userId, isChild]);

    const isPresencaCheckedInToday = presencaRecords.some(
        record => record.date === todayString
    ) && !isNewDay(); 

    const isPresencaConfirmadaToday = presencaRecords.some(
        record => record.date === todayString && record.confirmada === true
    ) && !isNewDay(); 

    // Marcar presença
    const checkIn = async (): Promise<boolean> => {
        const userDocRef = getUserDocRef();
        if (!userDocRef || !currentUserId) {
            console.error('Usuário não autenticado ou documento não encontrado');
            return false;
        }

        if (isFirstJanuary()) {
            console.log('❌ Não é permitido marcar presença no dia 1º de janeiro');
            Alert.alert('Aviso', 'Não é permitido marcar presença no dia 1º de janeiro');
            return false;
        }

        if (isPresencaCheckedInToday) {
            console.log('Presença já marcada hoje');
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
                if (filhoIndex === -1) return false;

                const filho = filhos[filhoIndex];
                const presencasAtuais: PresencaRecord[] = filho.Presenca || [];
                const novasPresencas = [...presencasAtuais, newRecord];

                const novosFilhos = [...filhos];
                novosFilhos[filhoIndex] = { ...filho, Presenca: novasPresencas };

                await updateDoc(userDocRef, { filhos: novosFilhos });
            } else {
                const presencasAtuais: PresencaRecord[] = userData.Presenca || [];
                const novasPresencas = [...presencasAtuais, newRecord];

                await updateDoc(userDocRef, { Presenca: novasPresencas });
            }

            console.log('✅ Presença marcada com sucesso para:', dateString);
            return true;
        } catch (error) {
            console.error('❌ Erro ao marcar presença:', error);
            return false;
        }
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
        isFirstJanuary: isFirstJanuary()
    };
};