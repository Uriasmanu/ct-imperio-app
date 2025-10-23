import { classSchedule, ClassSchedule } from '@/data/classSchedule';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export default function AulasScreen() {
  const [selectedDay, setSelectedDay] = useState(daysOfWeek[0]);

  // Filtra as aulas do dia selecionado
  const filteredClasses = classSchedule.filter(c => c.days.includes(selectedDay));

  // Função para ordenar corretamente horários do formato "HH:MM"
  const sortByTime = (a: ClassSchedule, b: ClassSchedule) => {
    const [ah, am] = a.startTime.split(':').map(Number);
    const [bh, bm] = b.startTime.split(':').map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Quadro Completo de Aulas</Text>
      <Text style={styles.subtitle}>Consulte todos os horários e instrutores disponíveis.</Text>

      {/* Tabs dos dias */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {daysOfWeek.map(day => (
          <TouchableOpacity
            key={day}
            onPress={() => setSelectedDay(day)}
            style={[styles.tab, selectedDay === day && styles.tabActive]}
          >
            <Text style={[styles.tabText, selectedDay === day && styles.tabTextActive]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de aulas */}
      <View style={styles.scheduleList}>
        {filteredClasses.length === 0 ? (
          <View style={styles.noClassCard}>
            <Text style={styles.noClassText}>Nenhuma aula programada para hoje 😴</Text>
          </View>
        ) : (
          filteredClasses.sort(sortByTime).map(aula => (
            <View
              key={aula.id}
              style={[styles.classCard, aula.current && styles.currentClassCard]}
            >
              <View style={styles.classTimeContainer}>
                <Text style={styles.classTime}>{aula.startTime}</Text>
                <Text style={styles.classTitle}>{aula.title}</Text>
              </View>

              <View style={styles.classInstructorContainer}>
                <Text style={styles.classInstructorLabel}>Instrutor(a)</Text>
                <Text style={styles.classInstructor}>{aula.instructor}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#333333',
    marginRight: 10,
  },
  tabActive: {
    backgroundColor: '#818cf8', // Indigo 400
  },
  tabText: {
    color: '#CCCCCC',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scheduleList: {
    flex: 1,
  },
  noClassCard: {
    padding: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#444444',
    alignItems: 'center',
  },
  noClassText: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  classCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4444FF33',
  },
  currentClassCard: {
    borderColor: '#818cf8',
    borderWidth: 2,
    backgroundColor: '#1a1a40',
  },
  classTimeContainer: {
    flex: 1,
  },
  classTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#818cf8',
    marginBottom: 4,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  classInstructorContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  classInstructorLabel: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  classInstructor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  }
});
