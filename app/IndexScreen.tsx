import { classSchedule, ClassSchedule } from '@/data/classSchedule';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function IndexScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentClass, setCurrentClass] = useState<ClassSchedule | null>(null);
  const [progress, setProgress] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

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

  // Função para calcular o progresso da aula atual
  const calculateClassProgress = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const today = getTodayDay();
    
    // Encontrar aulas do dia atual
    const todayClasses = classSchedule.filter(classItem => 
      classItem.days.includes(today)
    );

    let foundCurrentClass: ClassSchedule | null = null;
    let currentProgress = 0;

    // Verificar cada aula do dia para encontrar a que está em andamento
    todayClasses.forEach(classItem => {
      const startTimeInMinutes = timeToMinutes(classItem.startTime);
      const endTimeInMinutes = timeToMinutes(classItem.endTime);
      
      // Se está dentro do horário da aula
      if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes) {
        foundCurrentClass = classItem;
        
        // Calcular progresso (0 a 100)
        const totalDuration = endTimeInMinutes - startTimeInMinutes;
        const elapsedTime = currentTimeInMinutes - startTimeInMinutes;
        currentProgress = (elapsedTime / totalDuration) * 100;
      }
    });

    setCurrentClass(foundCurrentClass);
    setProgress(Math.min(Math.max(currentProgress, 0), 100));
  };

  // Função para obter a cor do gradiente baseada no progresso
  const getGradientColor = (progress: number): string => {
    // Verde começa mais escuro e vai clareando conforme o progresso
    const baseGreen = 100; // Verde base (escuro)
    const additionalGreen = Math.floor((progress / 100) * 155); // Adiciona até 155
    const greenValue = baseGreen + additionalGreen;
    
    return `rgb(0, ${greenValue}, 0)`;
  };

  useEffect(() => {
    calculateClassProgress();
    
    // Atualizar a cada minuto
    const interval = setInterval(calculateClassProgress, 60000);
    
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
        
        {currentClass ? (
          <View style={[
            styles.currentClassContainer,
            { backgroundColor: getGradientColor(progress) }
          ]}>
            {/* Barra de progresso visual */}
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill,
                  { width: `${progress}%` }
                ]} 
              />
            </View>
            
            <Text style={styles.currentClassText}>
              Agora: {currentClass.title}
            </Text>
            <Text style={styles.classTime}>
              {currentClass.startTime} - {currentClass.endTime}
            </Text>
            <Text style={styles.classInstructor}>
              Com {currentClass.instructor}
            </Text>
          </View>
        ) : (
          <View style={styles.noClassContainer}>
            <Text style={styles.noClassText}>
              Nenhuma aula em andamento no momento
            </Text>
            <Text style={styles.noClassSubtext}>
              Próximas aulas hoje: {classSchedule
                .filter(classItem => classItem.days.includes(getTodayDay()))
                .map(classItem => `${classItem.title} (${classItem.startTime})`)
                .join(', ') || 'Nenhuma aula programada'}
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
    marginBottom: 20,
  },
  currentClassContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    minHeight: 100,
    justifyContent: 'center',
    shadowColor: '#00FF00',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  currentClassText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  classTime: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
    opacity: 0.9,
  },
  classInstructor: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
  },
  noClassContainer: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
    minHeight: 80,
    justifyContent: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#666666',
  },
  noClassText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  noClassSubtext: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
  },
});