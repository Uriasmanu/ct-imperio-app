// src/hooks/usePresenca.ts
import { db } from '@/config/firebaseConfig';
import { CalendarDay, PresencaRecord } from '@/types/usuarios';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

export const usePresenca = (userId?: string) => {
    const [presencaRecords, setPresencaRecords] = useState<PresencaRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const { usuario } = useAuth();

    const currentUserId = userId || usuario?.id;
    const isChild = !!userId; // Se tem userId é um filho

    // Utilitário para formatar a data como YYYY-MM-DD
    const formatDate = (date: Date): string => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const todayString = formatDate(new Date());

    // Referência do documento (usuário ou filho)
    const getUserDocRef = () => {
        if (isChild && usuario?.id) {
            // Para filho, precisamos acessar via usuário pai
            return doc(db, "usuarios", usuario.id);
        } else if (currentUserId) {
            // Para usuário principal
            return doc(db, "usuarios", currentUserId);
        }
        return null;
    };

    // Carregar dados de presença em tempo real
    useEffect(() => {
        const userDocRef = getUserDocRef();
        if (!userDocRef) {
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(userDocRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.data();
                    
                    let presencaArray: string[] = [];
                    
                    if (isChild) {
                        // Buscar presenças do filho específico
                        const filhos = userData.filhos || [];
                        const filho = filhos.find((f: any) => f.id === userId);
                        presencaArray = filho?.Presenca || [];
                    } else {
                        // Buscar presenças do usuário
                        presencaArray = userData.Presenca || [];
                    }

                    // Converter array de strings para PresencaRecord[]
                    const records: PresencaRecord[] = presencaArray
                        .map((dateString: string) => ({
                            date: dateString,
                            timestamp: new Date(dateString + 'T00:00:00') // Criar Date a partir da string
                        }))
                        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Ordenar por data decrescente

                    setPresencaRecords(records);
                    setLoading(false);
                }
            },
            (error) => {
                console.error("Erro ao carregar dados de frequência:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUserId, userId, isChild]);

    // Marcar presença
    const checkIn = async (): Promise<boolean> => {
        const userDocRef = getUserDocRef();
        if (!userDocRef || !currentUserId) {
            console.error('Usuário não autenticado ou documento não encontrado');
            return false;
        }

        if (isPresencaCheckedInToday) {
            console.log('Presença já marcada hoje');
            return false;
        }

        const today = new Date();
        const dateString = formatDate(today);

        try {
            if (isChild) {
                // Atualizar presença do filho
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const filhos = userData.filhos || [];
                    const filhoIndex = filhos.findIndex((f: any) => f.id === userId);
                    
                    if (filhoIndex !== -1) {
                        const filho = filhos[filhoIndex];
                        const novasPresencas = [...(filho.Presenca || []), dateString];
                        
                        const novosFilhos = [...filhos];
                        novosFilhos[filhoIndex] = {
                            ...filho,
                            Presenca: novasPresencas
                        };

                        await updateDoc(userDocRef, {
                            filhos: novosFilhos
                        });
                    }
                }
            } else {
                // Atualizar presença do usuário principal
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const novasPresencas = [...(userData.Presenca || []), dateString];
                    
                    await updateDoc(userDocRef, {
                        Presenca: novasPresencas
                    });
                }
            }

            console.log('Presença marcada com sucesso para:', dateString);
            return true;
        } catch (error) {
            console.error('Erro ao marcar presença:', error);
            return false;
        }
    };

    // Verificar se a presença de hoje já foi marcada
    const isPresencaCheckedInToday = presencaRecords.some(
        record => record.date === todayString
    );

    // Obter última data de check-in
    const lastCheckInDate = presencaRecords.length > 0
        ? presencaRecords[0].date.split('-').reverse().join('/')
        : '';

    // Função para gerar dias do calendário
    const generateCalendarDays = (month: Date): CalendarDay[] => {
        const records = presencaRecords;
        const current = month;
        const year = current.getFullYear();
        const monthIndex = current.getMonth();
        
        // Encontrar o primeiro dia do mês e o dia da semana
        const firstDayOfMonth = new Date(year, monthIndex, 1);
        const startingDay = firstDayOfMonth.getDay();

        // Encontrar o número de dias no mês
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

        const days: CalendarDay[] = [];
        const todayFormatted = todayString;

        // Adicionar "espaços vazios" (dias do mês anterior)
        for (let i = 0; i < startingDay; i++) {
            days.push({ 
                day: null, 
                isCurrentMonth: false, 
                isAttended: false, 
                isToday: false,
                date: null
            });
        }

        // Adicionar os dias do mês
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, monthIndex, i);
            const formattedDate = formatDate(date);
            
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

        // Adicionar dias restantes para completar a grade (6 semanas)
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

    // Verificar se um mês está dentro do limite de 6 meses
    const isMonthWithinLimit = (month: Date): boolean => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        sixMonthsAgo.setDate(1);
        
        const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        
        return firstDayOfMonth >= sixMonthsAgo;
    };

    return {
        presencaRecords,
        loading,
        checkIn,
        isPresencaCheckedInToday,
        lastCheckInDate,
        todayString,
        formatDate,
        generateCalendarDays,
        isMonthWithinLimit
    };
};