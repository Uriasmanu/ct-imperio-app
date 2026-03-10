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

// --- Chaves de treino ---
const STORAGE_KEY_ENABLED = "@notification_enabled";
const STORAGE_KEY_HOUR = "@notification_hour";
const STORAGE_KEY_MINUTE = "@notification_minute";

// --- Chaves de pagamento ---
const STORAGE_KEY_PAG_ENABLED = "@notification_pagamento_enabled";
const STORAGE_KEY_PAG_HOUR = "@notification_pagamento_hour";
const STORAGE_KEY_PAG_MINUTE = "@notification_pagamento_minute";

const DEFAULT_HOUR = 21;
const DEFAULT_MINUTE = 0;
const DEFAULT_PAG_HOUR = 9;
const DEFAULT_PAG_MINUTE = 0;

// Identificador único para não misturar notificações
const NOTIF_IDENTIFIER_PAGAMENTO = "pagamento-vencimento";

// ─────────────────────────────────────────────
// Hook: notificação diária de treino
// ─────────────────────────────────────────────
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

        // Cancela apenas a notificação de treino (pelo identificador)
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const notif of scheduled) {
            if (notif.identifier !== NOTIF_IDENTIFIER_PAGAMENTO) {
                await Notifications.cancelScheduledNotificationAsync(notif.identifier);
            }
        }

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
        // Cancela apenas as notificações de treino
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const notif of scheduled) {
            if (notif.identifier !== NOTIF_IDENTIFIER_PAGAMENTO) {
                await Notifications.cancelScheduledNotificationAsync(notif.identifier);
            }
        }

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

    const changeTime = async (hour: number, minute: number) => {
        setNotificationHour(hour);
        setNotificationMinute(minute);

        if (notificationEnabled) {
            await enableNotification(hour, minute);
        } else {
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

// ─────────────────────────────────────────────
// Hook: notificação de pagamento com horário configurável
// ─────────────────────────────────────────────
export const usePagamentoNotifications = () => {
    const [pagamentoEnabled, setPagamentoEnabled] = useState(false);
    const [pagamentoHour, setPagamentoHour] = useState(DEFAULT_PAG_HOUR);
    const [pagamentoMinute, setPagamentoMinute] = useState(DEFAULT_PAG_MINUTE);

    useEffect(() => {
        const loadSettings = async () => {
            const [enabled, hour, minute] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEY_PAG_ENABLED),
                AsyncStorage.getItem(STORAGE_KEY_PAG_HOUR),
                AsyncStorage.getItem(STORAGE_KEY_PAG_MINUTE),
            ]);

            setPagamentoEnabled(enabled === "true");
            setPagamentoHour(hour !== null ? parseInt(hour) : DEFAULT_PAG_HOUR);
            setPagamentoMinute(minute !== null ? parseInt(minute) : DEFAULT_PAG_MINUTE);
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
                "Ative as notificações nas configurações do dispositivo para receber lembretes de pagamento."
            );
            return false;
        }
        return true;
    };

    /**
     * Agenda a notificação de vencimento para um usuário ou filho,
     * usando o horário configurado pela usuária.
     */
    const scheduleNotificacaoPagamento = async (
        item: Usuario | Filho,
        hour: number,
        minute: number
    ) => {
        if (!item.dataUltimoPagamento) return;

        const dataVencimento = new Date(item.dataUltimoPagamento);
        dataVencimento.setDate(dataVencimento.getDate() + 30);
        dataVencimento.setHours(hour, minute, 0, 0);

        if (dataVencimento <= new Date()) return;

        await Notifications.scheduleNotificationAsync({
            identifier: NOTIF_IDENTIFIER_PAGAMENTO,
            content: {
                title: "Dia de pagar!",
                body: "Sua mensalidade vence hoje. Regularize para continuar treinando!",
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: dataVencimento,
            },
        });
    };

    /**
     * Ativa as notificações de pagamento e agenda para o usuário e filhos.
     */
    const enablePagamentoNotifications = async (
        usuario: Usuario,
        hour = pagamentoHour,
        minute = pagamentoMinute
    ) => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        // Cancela apenas a notificação de pagamento anterior
        await Notifications.cancelScheduledNotificationAsync(NOTIF_IDENTIFIER_PAGAMENTO);

        await scheduleNotificacaoPagamento(usuario, hour, minute);

        if (usuario.filhos && usuario.filhos.length > 0) {
            for (const filho of usuario.filhos) {
                await scheduleNotificacaoPagamento(filho, hour, minute);
            }
        }

        await AsyncStorage.multiSet([
            [STORAGE_KEY_PAG_ENABLED, "true"],
            [STORAGE_KEY_PAG_HOUR, String(hour)],
            [STORAGE_KEY_PAG_MINUTE, String(minute)],
        ]);

        setPagamentoEnabled(true);
        setPagamentoHour(hour);
        setPagamentoMinute(minute);
    };

    /**
     * Desativa as notificações de pagamento.
     */
    const disablePagamentoNotifications = async () => {
        await Notifications.cancelScheduledNotificationAsync(NOTIF_IDENTIFIER_PAGAMENTO);
        await AsyncStorage.setItem(STORAGE_KEY_PAG_ENABLED, "false");
        setPagamentoEnabled(false);
    };

    const togglePagamentoNotification = async (usuario: Usuario) => {
        if (pagamentoEnabled) {
            await disablePagamentoNotifications();
        } else {
            await enablePagamentoNotifications(usuario);
        }
    };

    /**
     * Chamado quando a usuária muda o horário da notificação de pagamento.
     */
    const changePagamentoTime = async (usuario: Usuario, hour: number, minute: number) => {
        setPagamentoHour(hour);
        setPagamentoMinute(minute);

        if (pagamentoEnabled) {
            await enablePagamentoNotifications(usuario, hour, minute);
        } else {
            await AsyncStorage.multiSet([
                [STORAGE_KEY_PAG_HOUR, String(hour)],
                [STORAGE_KEY_PAG_MINUTE, String(minute)],
            ]);
        }
    };

    return {
        pagamentoEnabled,
        pagamentoHour,
        pagamentoMinute,
        togglePagamentoNotification,
        changePagamentoTime,
        enablePagamentoNotifications,
        disablePagamentoNotifications,
    };
};