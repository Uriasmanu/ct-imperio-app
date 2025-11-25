import { Notice, NoticeFormData } from '@/types/Notice';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface NoticeFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (notice: NoticeFormData) => Promise<void>;
  editingNotice?: Notice | null;
  loading?: boolean;
}

const CATEGORIES = [
  { value: 'Evento', label: 'Evento', color: 'bg-fight-yellow' },
  { value: 'Comunicado', label: 'Comunicado', color: 'bg-gray-700' },
  { value: 'Urgente', label: 'Urgente', color: 'bg-punch-red' },
  { value: 'Novidade', label: 'Novidade', color: 'bg-green-500' },
];

export const NoticeForm: React.FC<NoticeFormProps> = ({
  visible,
  onClose,
  onSubmit,
  editingNotice,
  loading = false
}) => {
  const [formData, setFormData] = useState<NoticeFormData>({
    title: '',
    category: 'Evento',
    date: '',
    time: '',
    description: '',
    color: 'bg-fight-yellow'
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  useEffect(() => {
    if (editingNotice) {
      // Parse existing date and time
      let date = new Date();
      let time = new Date();
      
      if (editingNotice.date) {
        const [day, month, year] = editingNotice.date.split('/').map(Number);
        date = new Date(year, month - 1, day);
      }
      
      if (editingNotice.time) {
        const [hours, minutes] = editingNotice.time.split(':').map(Number);
        time = new Date();
        time.setHours(hours, minutes);
      }

      setSelectedDate(date);
      setSelectedTime(time);
      setFormData({
        title: editingNotice.title,
        category: editingNotice.category,
        date: editingNotice.date,
        time: editingNotice.time,
        description: editingNotice.description,
        color: editingNotice.color
      });
    } else {
      // Reset to current date/time for new notices
      const now = new Date();
      setSelectedDate(now);
      setSelectedTime(now);
      setFormData({
        title: '',
        category: 'Evento',
        date: formatDate(now),
        time: formatTime(now),
        description: '',
        color: 'bg-fight-yellow'
      });
    }
  }, [editingNotice, visible]);

  // Format date as DD/MM/AAAA
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format time as HH:MM
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({
        ...prev,
        date: formatDate(date)
      }));
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
      setFormData(prev => ({
        ...prev,
        time: formatTime(time)
      }));
    }
  };

  const handleCategorySelect = (category: Notice['category'], color: Notice['color']) => {
    setFormData(prev => ({
      ...prev,
      category,
      color
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Erro', 'Por favor, insira um título para o aviso.');
      return;
    }

    if (!formData.date.trim()) {
      Alert.alert('Erro', 'Por favor, selecione uma data para o aviso.');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma descrição para o aviso.');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o aviso. Tente novamente.');
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const showTimepicker = () => {
    setShowTimePicker(true);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {editingNotice ? 'Editar Aviso' : 'Novo Aviso'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          {/* Título */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Digite o título do aviso"
              placeholderTextColor="#999"
            />
          </View>

          {/* Categoria */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoria *</Text>
            <View style={styles.categoriesContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryButton,
                    formData.category === cat.value && styles.categoryButtonSelected,
                    { backgroundColor: formData.category === cat.value ? getColorValue(cat.color) : '#f0f0f0' }
                  ]}
                  onPress={() => handleCategorySelect(cat.value as Notice['category'], cat.color as Notice['color'])}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      { color: formData.category === cat.value ? '#000' : '#666' }
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Data e Hora */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data e Hora *</Text>
            
            {/* Data */}
            <View style={styles.datetimeRow}>
              <View style={styles.datetimeContainer}>
                <Text style={styles.datetimeLabel}>Data</Text>
                <TouchableOpacity style={styles.datetimeButton} onPress={showDatepicker}>
                  <Ionicons name="calendar" size={20} color="#666" />
                  <Text style={styles.datetimeButtonText}>
                    {formData.date || 'Selecionar data'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Hora */}
              <View style={styles.datetimeContainer}>
                <Text style={styles.datetimeLabel}>Hora</Text>
                <TouchableOpacity style={styles.datetimeButton} onPress={showTimepicker}>
                  <Ionicons name="time" size={20} color="#666" />
                  <Text style={styles.datetimeButtonText}>
                    {formData.time || 'Selecionar hora'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Picker */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                style={styles.datePicker}
                minimumDate={new Date()}
              />
            )}

            {/* Time Picker */}
            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                style={styles.datePicker}
                is24Hour={true}
              />
            )}
          </View>

          {/* Descrição */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Digite a descrição completa do aviso..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Preview */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pré-visualização</Text>
            <View style={[styles.previewCard, { backgroundColor: getColorValue(formData.color) }]}>
              <View style={styles.previewHeader}>
                <Text style={[
                  styles.previewCategory,
                  { color: formData.color === 'bg-fight-yellow' ? '#000' : '#FFF' }
                ]}>
                  {formData.category}
                </Text>
                <Text style={[
                  styles.previewDate,
                  { color: formData.color === 'bg-fight-yellow' ? '#000' : '#FFF', opacity: 0.8 }
                ]}>
                  {formData.date}
                </Text>
              </View>
              <Text style={[
                styles.previewTitle,
                { color: formData.color === 'bg-fight-yellow' ? '#000' : '#FFF' }
              ]}>
                {formData.title || 'Título do aviso'}
              </Text>
              {formData.time && (
                <View style={styles.previewTime}>
                  <Ionicons 
                    name="time" 
                    size={14} 
                    color={formData.color === 'bg-fight-yellow' ? '#000' : '#FFF'} 
                  />
                  <Text style={[
                    styles.previewTimeText,
                    { color: formData.color === 'bg-fight-yellow' ? '#000' : '#FFF', opacity: 0.8 }
                  ]}>
                    {formData.time}
                  </Text>
                </View>
              )}
              <Text style={[
                styles.previewDescription,
                { color: formData.color === 'bg-fight-yellow' ? '#000' : '#FFF', opacity: 0.9 }
              ]} numberOfLines={2}>
                {formData.description || 'Descrição do aviso...'}
              </Text>
            </View>
          </View>

          {/* Botões */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {editingNotice ? 'Atualizar' : 'Criar'} Aviso
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

// Função auxiliar para obter valor da cor
const getColorValue = (colorClass: string): string => {
  switch (colorClass) {
    case 'bg-fight-yellow': return '#FFD700';
    case 'bg-gray-700': return '#374151';
    case 'bg-punch-red': return '#E30000';
    case 'bg-green-500': return '#10B981';
    default: return '#374151';
  }
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  datetimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  datetimeContainer: {
    flex: 1,
  },
  datetimeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  datetimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFF',
  },
  datetimeButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  datePicker: {
    marginTop: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  categoryButtonSelected: {
    borderColor: '#333',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewCard: {
    padding: 16,
    borderRadius: 8,
    minHeight: 120,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewCategory: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  previewDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  previewTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  previewTimeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  previewDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  submitButton: {
    backgroundColor: '#B8860B',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});