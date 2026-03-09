import { Filho, Usuario } from "@/types/usuarios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

const STORAGE_KEY_ENABLED = "@notification_enabled";
const STORAGE_KEY_HOUR = "@notification_hour";
const STORAGE_KEY_MINUTE = "@notification_minute";
const DEFAULT_HOUR = 21;
const DEFAULT_MINUTE = 0;

export const useNotifications = () => {
    const [notificationEnabled, setNotificationEnabled] = useState(false);
    const [notificationHour, setNotificationHour] = useState(DEFAULT_HOUR);
    const [notificationMinute, setNotificationMinute] = useState(DEFAULT_MINUTE);

    useEffect(() => {
        const loadSettings = async () => {
            const [enabled, hour, minute] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEY_ENABLED),
                AsyncStorage.getItem(STORAGE_KEY_HOUR),
                AsyncStorage.getItem(STORAGE_KEY_MINUTE),
            ]);

            setNotificationEnabled(enabled === "true");
            setNotificationHour(hour !== null ? parseInt(hour) : DEFAULT_HOUR);
            setNotificationMinute(minute !== null ? parseInt(minute) : DEFAULT_MINUTE);
        };

        loadSettings();
    }, []);

    const requestPermissions = async (): Promise<boolean> => {
        const { status: existing } = await Notifications.getPermissionsAsync();
        if (existing === "granted") return true;

        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permissão necessária",
                "Ative as notificações nas configurações do dispositivo para receber lembretes diários."
            );
            return false;
        }
        return true;
    };

    const enableNotification = async (hour = notificationHour, minute = notificationMinute) => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        await Notifications.cancelAllScheduledNotificationsAsync();

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "CT Império",
                body: "Já marcou presença hoje? Abra o app e registre seu treino!",
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
            },
        });

        await AsyncStorage.multiSet([
            [STORAGE_KEY_ENABLED, "true"],
            [STORAGE_KEY_HOUR, String(hour)],
            [STORAGE_KEY_MINUTE, String(minute)],
        ]);

        setNotificationEnabled(true);
        setNotificationHour(hour);
        setNotificationMinute(minute);
    };

    const disableNotification = async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
        await AsyncStorage.setItem(STORAGE_KEY_ENABLED, "false");
        setNotificationEnabled(false);
    };

    const toggleNotification = async () => {
        if (notificationEnabled) {
            await disableNotification();
        } else {
            await enableNotification();
        }
    };

    // Chamado quando o usuário muda o horário no seletor
    const changeTime = async (hour: number, minute: number) => {
        setNotificationHour(hour);
        setNotificationMinute(minute);

        // Se já estava ativo, reagenda com o novo horário
        if (notificationEnabled) {
            await enableNotification(hour, minute);
        } else {
            // Salva o horário mesmo sem ativar
            await AsyncStorage.multiSet([
                [STORAGE_KEY_HOUR, String(hour)],
                [STORAGE_KEY_MINUTE, String(minute)],
            ]);
        }
    };

    return {
        notificationEnabled,
        notificationHour,
        notificationMinute,
        toggleNotification,
        changeTime,
    };
};

export const usePagamentoNotifications = () => {
  const scheduleNotificacaoPagamento = async (item: Usuario | Filho, nome?: string) => {
    if (!item.dataUltimoPagamento) return;

    const dataVencimento = new Date(item.dataUltimoPagamento);
    dataVencimento.setDate(dataVencimento.getDate() + 30);
    dataVencimento.setHours(12, 0, 0, 0);

    if (dataVencimento <= new Date()) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Dia de pagar!",
        body: `Sua mensalidade vence hoje. Regularize para continuar treinando!`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: dataVencimento,
      },
    });
  };

  const scheduleTodasNotificacoes = async (usuario: Usuario) => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await scheduleNotificacaoPagamento(usuario);

    if (usuario.filhos && usuario.filhos.length > 0) {
      for (const filho of usuario.filhos) {
        await scheduleNotificacaoPagamento(filho);
      }
    }
  };

  return { scheduleTodasNotificacoes };
};