import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isExpoGo, setIsExpoGo] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notificationType, setNotificationType] = useState('local');
  const [notificationTime, setNotificationTime] = useState({ hour: 19, minute: 0 }); // Padrão 19:00
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);


  // Detectar se está no Expo Go
  useEffect(() => {
    const checkEnvironment = async () => {
      // Método mais confiável para detectar Expo Go
      const isExpo = Constants.appOwnership === 'expo';
      setIsExpoGo(isExpo);

      if (isExpo) {
        console.log('📱 Ambiente: Expo Go - Usando notificações LOCAIS');
        setNotificationType('local');
      } else {
        console.log('🚀 Ambiente: Development Build - Tentando notificações REMOTAS');
        setNotificationType('remote');
      }
    };

    checkEnvironment();
  }, []);

  // Configurar o handler de notificações
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  useEffect(() => {
    initializeNotifications();
  }, [isExpoGo]);

  const initializeNotifications = async () => {
    try {
      // Solicitar permissões
      const permission = await registerForPushNotificationsAsync();
      setHasPermission(permission);

      if (permission && !isExpoGo) {
        // Tentar obter push token apenas se não for Expo Go
        try {
          const token = await getPushToken();
          setExpoPushToken(token);
          setNotificationType('remote');
          console.log('✅ Push token obtido com sucesso:', token);
        } catch (error) {
          console.log('⚠️  Push token não disponível, usando notificações locais');
          setNotificationType('local');
        }
      } else if (permission) {
        setNotificationType('local');
      }

      // Listener para quando o usuário interage com a notificação
      const notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('👆 Usuário interagiu com a notificação:', response.notification.request.content.data);
        // Você pode adicionar navegação aqui baseada nos dados da notificação
        handleNotificationNavigation(response.notification.request.content.data);
      });

      // Listener para notificações recebidas em foreground
      const notificationReceivedSubscription = Notifications.addNotificationReceivedListener(notification => {
        console.log('📲 Notificação recebida:', notification.request.content.title);
      });

      return () => {
        notificationResponseSubscription.remove();
        notificationReceivedSubscription.remove();
      };
    } catch (error) {
      console.error('❌ Erro ao inicializar notificações:', error);
      setNotificationType('local'); // Fallback para local
    }
  };

  // Navegação baseada na notificação
  const handleNotificationNavigation = (data) => {
    if (data.screen === 'flashcards') {
      // Exemplo: navegar para tela de flashcards
      // navigation.navigate('Flashcards');
      console.log('Navegar para flashcards');
    }
  };

  // Obter push token (apenas para development builds)
  // Obter push token (apenas para development builds)
  const getPushToken = async () => {
    if (isExpoGo) {
      throw new Error('Push tokens não estão disponíveis no Expo Go');
    }

    try {
      // Obter projectId do app.json - método correto para Expo SDK 49+
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      console.log('🔍 ProjectId encontrado:', projectId);
      console.log('📱 Tentando obter push token...');

      if (!projectId) {
        console.warn('⚠️  ProjectId não encontrado, tentando sem...');
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });

      console.log('✅ Push token obtido com sucesso!');
      return tokenData.data;
    } catch (error) {
      console.warn('❌ Erro ao obter push token:', error.message);

      // Fallback: tentar sem projectId
      try {
        console.log('🔄 Tentando fallback sem projectId...');
        const tokenData = await Notifications.getExpoPushTokenAsync();
        console.log('✅ Push token obtido no fallback!');
        return tokenData.data;
      } catch (fallbackError) {
        console.warn('❌ Fallback também falhou:', fallbackError.message);
        throw new Error('Não foi possível obter push token');
      }
    }
  };
  

  // Verificar notificações agendadas
  const getScheduledNotifications = async () => {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Erro ao obter notificações agendadas:', error);
      return [];
    }
  };

  // Cancelar todos os lembretes
  const cancelAllReminders = async () => {
    try {
      const canceledCount = await Notifications.cancelAllScheduledNotificationsAsync();
      console.log(`🗑️  ${canceledCount} notificações canceladas`);
      return true;
    } catch (error) {
      console.error('Erro ao cancelar notificações:', error);
      return false;
    }
  };

  // Cancelar notificação específica
  const cancelNotification = async (notificationId) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`🗑️  Notificação ${notificationId} cancelada`);
      return true;
    } catch (error) {
      console.error('Erro ao cancelar notificação:', error);
      return false;
    }
  };

  // Solicitar permissões
  const requestPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);

      if (granted && !isExpoGo) {
        // Tentar obter push token novamente
        try {
          const token = await getPushToken();
          setExpoPushToken(token);
          setNotificationType('remote');
        } catch (error) {
          console.log('⚠️  Continuando com notificações locais');
          setNotificationType('local');
        }
      }

      return granted;
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      return false;
    }
  };

  // Obter status atual
  const getNotificationStatus = () => {
    return {
      hasPermission,
      isExpoGo,
      notificationType,
      expoPushToken: expoPushToken ? 'Disponível' : 'Não disponível',
    };
  };

  // Agendar notificação de lembrete - agora usando o horário salvo
  const scheduleStudyReminder = async (customHour = null, customMinute = null) => {
    try {
      // Verificar permissões primeiro
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) {
          throw new Error('Permissão para notificações não concedida');
        }
      }

      // Usar horário personalizado ou o horário salvo
      const hour = customHour !== null ? customHour : notificationTime.hour;
      const minute = customMinute !== null ? customMinute : notificationTime.minute;

      // Cancelar notificações existentes
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Se notificações estão desativadas, não agendar
      if (!isNotificationEnabled) {
        console.log('🔕 Notificações desativadas - nenhum lembrete agendado');
        return {
          success: true,
          notificationId: null,
          type: notificationType,
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          enabled: false
        };
      }

      // Agendar nova notificação LOCAL
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Hora de estudar! 📚",
          body: "Não se esqueça de revisar suas palavras hoje!",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            type: 'study_reminder',
            screen: 'flashcards',
            hour: hour,
            minute: minute
          },
        },
        trigger: {
          hour: hour,
          minute: minute,
          repeats: true,
        },
      });

      console.log(`✅ Lembrete agendado para ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      console.log(`📋 Tipo: ${notificationType.toUpperCase()}`);
      console.log(`🆔 ID da notificação: ${notificationId}`);

      return {
        success: true,
        notificationId,
        type: notificationType,
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        enabled: true
      };
    } catch (error) {
      console.error('❌ Erro ao agendar notificação:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Atualizar horário da notificação
  const updateNotificationTime = async (hour, minute) => {
    setNotificationTime({ hour, minute });
    
    // Se as notificações estão habilitadas, reagendar com o novo horário
    if (isNotificationEnabled) {
      return await scheduleStudyReminder(hour, minute);
    }
    
    return { success: true, enabled: false };
  };

  // Alternar notificações (ligar/desligar)
  const toggleNotifications = async (enabled) => {
    setIsNotificationEnabled(enabled);
    
    if (enabled) {
      // Se está ativando, agendar com o horário atual
      return await scheduleStudyReminder();
    } else {
      // Se está desativando, cancelar todas as notificações
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🔕 Notificações desativadas');
      return { success: true, enabled: false };
    }
  };

  // Verificar status atual do agendamento
  const getNotificationScheduleStatus = async () => {
    const scheduled = await getScheduledNotifications();
    return {
      isEnabled: isNotificationEnabled,
      scheduledTime: notificationTime,
      hasScheduledNotifications: scheduled.length > 0,
      nextNotification: scheduled.length > 0 ? scheduled[0] : null
    };
  };


const value = {
    hasPermission,
    isExpoGo,
    expoPushToken,
    notificationType,
    notificationTime,
    isNotificationEnabled,
    scheduleStudyReminder,
    updateNotificationTime,
    toggleNotifications,
    cancelAllReminders,
    cancelNotification,
    getScheduledNotifications,
    getNotificationScheduleStatus,
    requestPermissions,
    getNotificationStatus,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Função para registrar para notificações
async function registerForPushNotificationsAsync() {
  try {
    // Verificar permissões atuais
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Se não tem permissão, solicitar
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Configurar canal para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('study-reminders', {
        name: 'Lembretes de Estudo',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Erro ao registrar notificações:', error);
    return false;
  }
}