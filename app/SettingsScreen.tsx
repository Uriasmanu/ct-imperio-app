import { useNotification } from '@/context/NotificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

import { appConfig } from './../utils/constants';

const SettingsScreen = () => {
  const [showVersionInfo, setShowVersionInfo] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [language, setLanguage] = useState('pt');
  const [tempTime, setTempTime] = useState(new Date());

  const {
    hasPermission,
    isNotificationEnabled,
    notificationTime,
    updateNotificationTime,
    toggleNotifications,
    getNotificationScheduleStatus,
    requestPermissions,
  } = useNotification();

  const [scheduleStatus, setScheduleStatus] = useState({
    isEnabled: false,
    scheduledTime: { hour: 19, minute: 0 },
    hasScheduledNotifications: false
  });

  useEffect(() => {
    loadNotificationStatus();
    loadLanguage();
  }, []);

  const loadNotificationStatus = async () => {
    const status = await getNotificationScheduleStatus();
    setScheduleStatus(status);
  };

  const loadLanguage = async () => {
    const storedLang = await AsyncStorage.getItem('appLanguage');
    if (storedLang) setLanguage(storedLang);
  };

  const handlePrivacyPolicy = async () => {
    const url = 'https://uriasmanu.github.io/flash-cards/';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o link.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um problema ao abrir a política de privacidade.');
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled && !hasPermission) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          'Permissão necessária',
          'É preciso conceder permissão para notificações.'
        );
        return;
      }
    }

    const result = await toggleNotifications(enabled);
    if (result.success) {
      await loadNotificationStatus();
      Alert.alert(
        'Sucesso',
        enabled
          ? 'Notificações ativadas com sucesso.'
          : 'Notificações desativadas com sucesso.'
      );
    } else {
      Alert.alert('Erro', 'Não foi possível alterar as notificações.');
    }
  };

  const handleTimeChange = async (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);

    if (selectedTime) {
      const hour = selectedTime.getHours();
      const minute = selectedTime.getMinutes();

      setTempTime(selectedTime);

      const result = await updateNotificationTime(hour, minute);
      if (result.success) {
        await loadNotificationStatus();
        Alert.alert(
          'Sucesso',
          `Lembrete definido para ${hour.toString().padStart(2, '0')}:${minute
            .toString()
            .padStart(2, '0')}`
        );
      } else {
        Alert.alert('Erro', 'Não foi possível definir o horário do lembrete.');
      }
    }
  };

  const showTimePickerModal = () => {
    const currentTime = new Date();
    currentTime.setHours(notificationTime.hour);
    currentTime.setMinutes(notificationTime.minute);
    setTempTime(currentTime);
    setShowTimePicker(true);
  };

  const toggleVersionInfo = () => {
    setShowVersionInfo(!showVersionInfo);
  };

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        {/* Configurações de Notificação */}
        <View style={styles.notificationSection}>
          <Text style={styles.subsectionTitle}>Notificações</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Lembrete diário</Text>
              <Text style={styles.settingDescription}>
                Receba lembretes para revisar seus flashcards diariamente.
              </Text>
            </View>
            <Switch
              value={isNotificationEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isNotificationEnabled ? '#2196F3' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.settingItem,
              !isNotificationEnabled && styles.settingItemDisabled
            ]}
            onPress={showTimePickerModal}
            disabled={!isNotificationEnabled}
          >
            <View style={styles.settingInfo}>
              <Text
                style={[
                  styles.settingTitle,
                  !isNotificationEnabled && styles.settingTextDisabled
                ]}
              >
                Horário do lembrete
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  !isNotificationEnabled && styles.settingTextDisabled
                ]}
              >
                {formatTime(notificationTime.hour, notificationTime.minute)}
              </Text>
            </View>
            <Text
              style={[
                styles.menuArrow,
                !isNotificationEnabled && styles.settingTextDisabled
              ]}
            >
              ›
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPolicy}>
          <Text style={styles.menuText}>Política de Privacidade</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {/* Accordion para Atualizações */}
        <View style={styles.accordionContainer}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={toggleVersionInfo}
          >
            <Text style={styles.menuText}>Atualizações</Text>
            <View style={styles.headerRight}>
              <Text style={styles.versionText}>v {appConfig.version}</Text>
              <Text
                style={[
                  styles.accordionArrow,
                  showVersionInfo && styles.accordionArrowOpen
                ]}
              >
                ›
              </Text>
            </View>
          </TouchableOpacity>

          {showVersionInfo && (
            <View style={styles.accordionContent}>
              <View style={styles.versionInfo}>
                <Text style={styles.versionTitle}>Informações da versão</Text>

                <View style={styles.versionDetail}>
                  <Text style={styles.versionLabel}>Versão</Text>
                  <Text style={styles.versionValue}>{appConfig.version}</Text>
                </View>

                <View style={styles.versionDetail}>
                  <Text style={styles.versionLabel}>Última atualização</Text>
                  <Text style={styles.versionValue}>{appConfig.lastUpload}</Text>
                </View>

                <View style={styles.versionDetailFeature}>
                  <Text style={styles.versionLabel}>Novidades</Text>
                  <View style={styles.featuresList}>
                    {appConfig.features.map((feature: string, index: number) => (
                      <Text key={index} style={styles.featureItem}>
                        • {feature}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Modal do Time Picker */}
      <Modal visible={showTimePicker} transparent={true} animationType="slide">
        <TouchableWithoutFeedback onPress={() => setShowTimePicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.timePickerContainer}>
                <Text style={styles.timePickerTitle}>Escolha o horário</Text>
                <DateTimePicker
                  value={tempTime}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  style={styles.timePicker}
                />
                <View style={styles.timePickerButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowTimePicker(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => handleTimeChange(null, tempTime)}
                  >
                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
};

// Os estilos permanecem os mesmos...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginVertical: 12,
    textTransform: 'uppercase',
  },
  notificationSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginTop: 8,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  settingTextDisabled: {
    color: '#999',
  },
  testButton: {
    fontSize: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  menuArrow: {
    fontSize: 18,
    color: '#999',
  },
  // Estilos do Accordion
  accordionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  accordionArrow: {
    fontSize: 18,
    color: '#999',
    transform: [{ rotate: '0deg' }],
  },
  accordionArrowOpen: {
    transform: [{ rotate: '90deg' }],
  },
  accordionContent: {
    backgroundColor: '#f9f9f9',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  versionInfo: {
    paddingVertical: 16,
    gap: 12,
  },
  versionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  versionDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  versionLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  versionValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  versionDetailFeature: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10
  },
  featuresList: {
    flex: 2,
  },
  featureItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  // Estilos do Modal e Time Picker
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    alignItems: 'center',
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  timePicker: {
    width: '100%',
    height: 160,
  },
  timePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2196F3',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default SettingsScreen;