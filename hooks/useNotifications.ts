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


// useNotifications.ts - adicionar ao arquivo existente

import { db } from "@/config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// --- Chaves de pagamento (já existem no seu arquivo) ---
// STORAGE_KEY_PAG_ENABLED, STORAGE_KEY_PAG_HOUR, STORAGE_KEY_PAG_MINUTE já declarados

// ─────────────────────────────────────────────
// Hook: notificação de pagamento pendente
// ─────────────────────────────────────────────
export const usePagamentoNotifications = (usuarioId: string | null) => {
  const [pagamentoNotifEnabled, setPagamentoNotifEnabled] = useState(false);
  const [pagamentoHour, setPagamentoHour] = useState(DEFAULT_PAG_HOUR);
  const [pagamentoMinute, setPagamentoMinute] = useState(DEFAULT_PAG_MINUTE);

  // Carrega configurações salvas
  useEffect(() => {
    const loadSettings = async () => {
      const [enabled, hour, minute] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_PAG_ENABLED),
        AsyncStorage.getItem(STORAGE_KEY_PAG_HOUR),
        AsyncStorage.getItem(STORAGE_KEY_PAG_MINUTE),
      ]);

      setPagamentoNotifEnabled(enabled === "true");
      setPagamentoHour(hour !== null ? parseInt(hour) : DEFAULT_PAG_HOUR);
      setPagamentoMinute(minute !== null ? parseInt(minute) : DEFAULT_PAG_MINUTE);
    };

    loadSettings();
  }, []);

  // Sincroniza notificação com status do Firestore automaticamente
  useEffect(() => {
    if (!usuarioId) return;

    const sincronizar = async () => {
      try {
        const userRef = doc(db, "usuarios", usuarioId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return;

        const usuario = userSnap.data();
        const isPago = usuario.pagamento === true;

        if (isPago) {
          await cancelarNotificacaoPagamento();
        } else {
          // Só agenda se o usuário tiver habilitado a notificação
          const enabled = await AsyncStorage.getItem(STORAGE_KEY_PAG_ENABLED);
          if (enabled === "true") {
            await agendarNotificacaoPagamento(pagamentoHour, pagamentoMinute);
          }
        }
      } catch (error) {
        console.error("Erro ao sincronizar notificação de pagamento:", error);
      }
    };

    sincronizar();
  }, [usuarioId]);

  const requestPermissions = async (): Promise<boolean> => {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Ative as notificações nas configurações do dispositivo."
      );
      return false;
    }
    return true;
  };

  const agendarNotificacaoPagamento = async (
    hour = pagamentoHour,
    minute = pagamentoMinute
  ) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    // Cancela versão anterior antes de reagendar
    await Notifications.cancelScheduledNotificationAsync(
      NOTIF_IDENTIFIER_PAGAMENTO
    );

    await Notifications.scheduleNotificationAsync({
      identifier: NOTIF_IDENTIFIER_PAGAMENTO,
      content: {
        title: "Pagamento pendente",
        body: "Seu pagamento ainda está em aberto. Regularize para continuar treinando!",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    await AsyncStorage.multiSet([
      [STORAGE_KEY_PAG_ENABLED, "true"],
      [STORAGE_KEY_PAG_HOUR, String(hour)],
      [STORAGE_KEY_PAG_MINUTE, String(minute)],
    ]);

    setPagamentoNotifEnabled(true);
    setPagamentoHour(hour);
    setPagamentoMinute(minute);
  };

  const cancelarNotificacaoPagamento = async () => {
    await Notifications.cancelScheduledNotificationAsync(
      NOTIF_IDENTIFIER_PAGAMENTO
    );
    await AsyncStorage.setItem(STORAGE_KEY_PAG_ENABLED, "false");
    setPagamentoNotifEnabled(false);
  };

  const toggleNotificacaoPagamento = async () => {
    if (pagamentoNotifEnabled) {
      await cancelarNotificacaoPagamento();
    } else {
      await agendarNotificacaoPagamento();
    }
  };

  const changeTimePagamento = async (hour: number, minute: number) => {
    setPagamentoHour(hour);
    setPagamentoMinute(minute);

    if (pagamentoNotifEnabled) {
      await agendarNotificacaoPagamento(hour, minute);
    } else {
      await AsyncStorage.multiSet([
        [STORAGE_KEY_PAG_HOUR, String(hour)],
        [STORAGE_KEY_PAG_MINUTE, String(minute)],
      ]);
    }
  };

  return {
    pagamentoNotifEnabled,
    pagamentoHour,
    pagamentoMinute,
    toggleNotificacaoPagamento,
    changeTimePagamento,
  };
};