import { classSchedule, ClassSchedule } from '@/data/classSchedule';
import { globalStyles } from '@/styles/globalStyles';
import { aulasTheme } from '@/styles/theme';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export default function aulasScreen() {
  const todayIndex = new Date().getDay();
  const adjustedIndex = todayIndex === 0 ? 6 : todayIndex - 1;
  const [selectedDay, setSelectedDay] = useState(daysOfWeek[adjustedIndex]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredClasses = classSchedule.filter(c => c.days.includes(selectedDay));

  const sortByTime = (a: ClassSchedule, b: ClassSchedule) => {
    const [ah, am] = a.startTime.split(':').map(Number);
    const [bh, bm] = b.startTime.split(':').map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  };

  const handleDayPress = (day: string) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setSelectedDay(day);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const getClassStatus = (aula: ClassSchedule) => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    const [startHours, startMinutes] = aula.startTime.split(':').map(Number);
    const [endHours, endMinutes] = aula.endTime.split(':').map(Number);

    // Converte tudo para minutos totais para facilitar a comparação
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    // Se a aula já terminou
    if (currentTotalMinutes > endTotalMinutes) {
      return 'finished';
    }

    // Se a aula está acontecendo agora
    if (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes) {
      return 'current';
    }

    // Se a aula ainda vai acontecer
    return 'upcoming';
  };

  return (
    <View style={globalStyles.container}>
      {/* Header FIXO no topo */}
      <View style={styles.header}>
        <Text style={styles.title}>Quadro de Aulas</Text>
        <Text style={styles.subtitle}>
          {selectedDay} • {filteredClasses.length} aula{filteredClasses.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Tabs FIXAS abaixo do header */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
        style={styles.tabsScrollView}
      >
        {daysOfWeek.map(day => {
          const isToday = day === daysOfWeek[adjustedIndex];
          const isSelected = selectedDay === day;

          return (
            <TouchableOpacity
              key={day}
              onPress={() => handleDayPress(day)}
              style={[
                styles.tab,
                isSelected && styles.tabActive,
                isToday && !isSelected && styles.tabToday
              ]}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabText,
                isSelected && styles.tabTextActive,
                isToday && !isSelected && styles.tabTextToday
              ]}>
                {day.substring(0, 3)}
              </Text>
              {isToday && <View style={styles.todayDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* CONTEÚDO PRINCIPAL com altura flexível */}
      <View style={styles.contentContainer}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            flex: 1
          }}
        >
          <ScrollView
            contentContainerStyle={styles.scheduleList}
            showsVerticalScrollIndicator={false}
          >
            {filteredClasses.length === 0 ? (
              <View style={styles.noClassCard}>
                <Text style={styles.noClassEmoji}>😴</Text>
                <Text style={styles.noClassTitle}>Nenhuma aula hoje</Text>
                <Text style={styles.noClassText}>
                  Aproveite para descansar ou fazer um treino personalizado
                </Text>
              </View>
            ) : (
              filteredClasses.sort(sortByTime).map((aula) => {
                const status = getClassStatus(aula);

                return (
                  <TouchableOpacity
                    key={aula.id}
                    style={[
                      styles.classCard,
                      status === 'current' && styles.currentClassCard,
                      status === 'finished' && styles.finishedClassCard
                    ]}
                    activeOpacity={0.8}
                  >
                    <View style={[
                      styles.statusIndicator,
                      status === 'current' && styles.statusCurrent,
                      status === 'upcoming' && styles.statusUpcoming,
                      status === 'finished' && styles.statusFinished
                    ]} />

                    <View style={styles.classContent}>
                      <View style={styles.classHeader}>
                        <Text style={styles.classTime}>{aula.startTime}</Text>
                        <View style={styles.classBadge}>
                          <Text style={styles.classBadgeText}>
                            {status === 'current' ? 'AGORA' : status === 'upcoming' ? 'PRÓXIMA' : 'CONCLUÍDA'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.classTitle}>{aula.title}</Text>

                      <View style={styles.classDetails}>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Instrutor</Text>
                          <Text style={styles.detailValue}>{aula.instructor}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Término</Text>
                          <Text style={styles.detailValue}>{aula.endTime}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: aulasTheme.spacing.lg,
    paddingBottom: aulasTheme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: aulasTheme.colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: aulasTheme.colors.text.muted,
    marginBottom: 4,
  },
  tabsScrollView: {
    maxHeight: 50,
  },
  tabsContainer: {
    paddingHorizontal: aulasTheme.spacing.lg,
  },
  tab: {
    paddingVertical: aulasTheme.spacing.xs,
    paddingHorizontal: aulasTheme.spacing.md,
    borderRadius: 8,
    backgroundColor: aulasTheme.colors.card,
    marginRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
    justifyContent: 'center',
    height: 32,
  },
  tabActive: {
    backgroundColor: aulasTheme.colors.primary,
  },
  tabToday: {
    borderWidth: 1,
    borderColor: aulasTheme.colors.primary,
  },
  tabText: {
    color: aulasTheme.colors.text.muted,
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#000000',
    fontWeight: 'bold',
  },
  tabTextToday: {
    color: aulasTheme.colors.primary,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: aulasTheme.colors.primary,
    marginLeft: 4,
  },
  contentContainer: {
    flex: 1,
  },
  scheduleList: {
    padding: aulasTheme.spacing.lg,
    paddingTop: aulasTheme.spacing.md,
  },
  noClassCard: {
    padding: aulasTheme.spacing.lg,
    backgroundColor: aulasTheme.colors.card,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: aulasTheme.spacing.lg,
  },
  noClassEmoji: {
    fontSize: 36,
    marginBottom: aulasTheme.spacing.md,
  },
  noClassTitle: {
    color: aulasTheme.colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: aulasTheme.spacing.sm,
    textAlign: 'center',
  },
  noClassText: {
    color: aulasTheme.colors.text.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  classCard: {
    backgroundColor: aulasTheme.colors.card,
    borderRadius: 16,
    marginBottom: aulasTheme.spacing.md,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  currentClassCard: {
    backgroundColor: '#2A2A1A',
    borderLeftWidth: 4,
    borderLeftColor: aulasTheme.colors.status.current,
  },
  finishedClassCard: {
    opacity: 0.7,
  },
  statusIndicator: {
    width: 4,
    backgroundColor: aulasTheme.colors.status.finished,
  },
  statusCurrent: {
    backgroundColor: aulasTheme.colors.status.current,
  },
  statusUpcoming: {
    backgroundColor: aulasTheme.colors.status.upcoming,
  },
  statusFinished: {
    backgroundColor: aulasTheme.colors.status.finished,
  },
  classContent: {
    flex: 1,
    padding: aulasTheme.spacing.lg,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: aulasTheme.spacing.sm,
  },
  classTime: {
    fontSize: 14,
    fontWeight: '600',
    color: aulasTheme.colors.text.accent,
  },
  classBadge: {
    backgroundColor: aulasTheme.colors.cardActive,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  classBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: aulasTheme.colors.text.muted,
    textTransform: 'uppercase',
  },
  classTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: aulasTheme.colors.text.primary,
    marginBottom: aulasTheme.spacing.md,
  },
  classDetails: {
    flexDirection: 'row',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: aulasTheme.colors.text.muted,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: aulasTheme.colors.text.secondary,
  },
});