import { classSchedule, ClassSchedule } from '@/data/classSchedule';
import { useRouter } from 'expo-router';
import { Clock, User } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function IndexScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentClasses, setCurrentClasses] = useState<ClassSchedule[]>([]);
  const [nextClass, setNextClass] = useState<ClassSchedule | null>(null);
  const [progressMap, setProgressMap] = useState<{[key: string]: number}>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const carouselImages = [
    require('@/assets/imagens/Muay.jpeg'),
    require('@/assets/imagens/Muay.jpeg'),
    require('@/assets/imagens/Muay.jpeg'),
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / (screenWidth - 40));
    setActiveIndex(currentIndex);
  };

  // Função para converter hora string para minutos
  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Função para obter o dia atual em português
  const getTodayDay = (): string => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[new Date().getDay()];
  };

  // FUNÇÃO MODIFICADA: Encontrar TODAS as aulas em andamento
  const calculateClasses = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    const currentTimeInMinutes = currentHour * 60 + currentMinute + currentSecond / 60;

    const today = getTodayDay();

    // Encontrar aulas do dia atual e ordenar por horário
    const todayClasses = classSchedule
      .filter(classItem => classItem.days.includes(today))
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    const foundCurrentClasses: ClassSchedule[] = [];
    const newProgressMap: {[key: string]: number} = {};
    let foundNextClass: ClassSchedule | null = null;

    // Encontrar TODAS as aulas em andamento
    todayClasses.forEach(classItem => {
      const startTimeInMinutes = timeToMinutes(classItem.startTime);
      const endTimeInMinutes = timeToMinutes(classItem.endTime);

      // Se está dentro do horário da aula
      if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes) {
        foundCurrentClasses.push(classItem);

        // Calcular progresso para cada aula
        const totalDuration = endTimeInMinutes - startTimeInMinutes;
        const elapsedTime = currentTimeInMinutes - startTimeInMinutes;
        const progress = (elapsedTime / totalDuration) * 100;
        newProgressMap[classItem.title] = Math.min(Math.max(progress, 0), 100);
      }
    });

    // Encontrar próxima aula (apenas se não há aulas em andamento)
    if (foundCurrentClasses.length === 0) {
      foundNextClass = todayClasses.find(classItem => {
        const classStartTime = timeToMinutes(classItem.startTime);
        return currentTimeInMinutes < classStartTime;
      }) || null;
    }

    setCurrentClasses(foundCurrentClasses);
    setNextClass(foundNextClass);
    setProgressMap(newProgressMap);
  };

  // FUNÇÃO MODIFICADA: Azul Escuro com Gradiente Elegante
  const getGradientColor = (progress: number): string => {
    const baseBlue = 150;
    const additionalBlue = Math.floor((progress / 100) * 105);
    const blueValue = baseBlue + additionalBlue;

    return `rgb(30, 70, ${blueValue})`;
  };

  // Função para gerar ID único para cada aula
  const getClassId = (classItem: ClassSchedule): string => {
    return `${classItem.title}-${classItem.startTime}-${classItem.endTime}`;
  };

  useEffect(() => {
    // Calcular imediatamente ao montar o componente
    calculateClasses();

    // Atualizar a cada segundo para progresso suave
    const interval = setInterval(calculateClasses, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
      {/* Banner Principal */}
      <Image
        source={require('@/assets/imagens/banner.jpeg')}
        style={styles.banner}
        resizeMode="cover"
      />

      {/* Conteúdo de texto */}
      <View style={styles.content}>
        <Text style={styles.title}>Nossa História</Text>
        <Text style={styles.paragraph}>
          Desde 2015, ajudamos pessoas a saírem do sedentarismo, cuidarem da saúde e evoluírem no esporte, seja para competir ou simplesmente ter mais qualidade de vida.
        </Text>
        <Text style={styles.paragraph}>
          Hoje, somos referência no interior paulista, com um trabalho dedicado a crianças e adultos. Venha fazer parte de um dos CTs de lutas que mais se destacam na região!
        </Text>
      </View>

      {/* Carrossel com Indicadores Dinâmicos */}
      <View style={styles.carouselSection}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {carouselImages.map((image, index) => (
            <View key={index} style={styles.carouselItem}>
              <Image
                source={image}
                style={styles.carouselImage}
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>

        {/* Indicadores dinâmicos */}
        <View style={styles.indicators}>
          {carouselImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === activeIndex && styles.indicatorActive
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.professorContainer}>
        <Image
          source={require('@/assets/imagens/will.jpg')}
          style={styles.professorImage}
          resizeMode="cover"
        />
        <View>
          <Text style={styles.professorName}>Mestre William Izarias</Text>
          <Text style={styles.professorRole}>Proprietário e Mestre</Text>
        </View>
      </View>

      <View style={styles.scheduleSection}>
        <Text style={styles.title}>Horário das Aulas</Text>

        {currentClasses.length > 0 ? (
          <View style={styles.currentClassesContainer}>
            <Text style={styles.currentClassesTitle}>
              Aulas em andamento ({currentClasses.length})
            </Text>
            {currentClasses.map((classItem) => (
              <TouchableOpacity
                key={getClassId(classItem)}
                activeOpacity={0.8}
                onPress={() => router.push('/AulasScreen')}
                style={[
                  styles.currentClassContainer,
                  { backgroundColor: getGradientColor(progressMap[classItem.title] || 0) }
                ]}
              >
                {/* Barra de progresso estilizada */}
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${progressMap[classItem.title] || 0}%` }
                    ]}
                  />
                </View>

                {/* Informações da aula */}
                <View style={styles.classInfo}>
                  <Text style={styles.currentClassText}>
                    {classItem.title}
                  </Text>
                  <View style={styles.classDetails}>
                    <View style={styles.detailItem}>
                      <Clock size={16} color="#FFFFFF" />
                      <Text style={styles.detailText}>
                        {classItem.startTime} - {classItem.endTime}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <User size={16} color="#FFFFFF" />
                      <Text style={styles.detailText}>
                        {classItem.instructor}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.noClassContainer}>
            <View style={styles.noClassIcon}>
              <Text style={styles.noClassEmoji}>😴</Text>
            </View>
            <Text style={styles.noClassText}>
              Nenhuma aula em andamento
            </Text>
            <Text style={styles.noClassSubtext}>
              {nextClass
                ? `Próxima aula: ${nextClass.title} (${nextClass.startTime})`
                : 'Nenhuma aula programada para hoje'
              }
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  banner: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 30,
  },
  carouselSection: {
    marginBottom: 40,
  },
  carouselTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  carousel: {
    marginBottom: 15,
  },
  carouselItem: {
    width: screenWidth - 40,
  },
  carouselImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333333',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: '#FFFFFF',
    width: 12,
  },
  content: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 10,
  },
  paragraph: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 24,
    textAlign: 'justify',
    marginBottom: 16,
  },
  professorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    borderRadius: 16,
    borderLeftWidth: 4,
    gap: 15,
    marginBottom: 30,
  },
  professorImage: {
    width: 80,
    height: 80,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  professorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  professorRole: {
    fontSize: 12,
    color: '#CCCCCC',
    fontStyle: 'italic',
  },
  scheduleSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  // NOVO ESTILO: Container para múltiplas aulas
  currentClassesContainer: {
    marginTop: 10,
  },
  currentClassesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
    opacity: 0.8,
  },
  // ESTILOS MODIFICADOS: Azul Escuro Elegante
  currentClassContainer: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 15, // Espaço entre os cards
    minHeight: 140,
    justifyContent: 'space-between',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FBBF24',
    borderRadius: 4,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  classInfo: {
    // Espaço para as informações da aula
  },
  currentClassText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  classDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.9,
  },
  noClassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 30,
    borderRadius: 20,
    marginTop: 10,
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
  },
  noClassIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  noClassEmoji: {
    fontSize: 24,
  },
  noClassText: {
    fontSize: 18,
    color: '#CCCCCC',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 10,
  },
  noClassSubtext: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 18,
  },
});