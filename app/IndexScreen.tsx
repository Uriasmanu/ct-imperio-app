import React, { useRef, useState } from 'react';
import { Dimensions, Image, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function IndexScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
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
    </ScrollView>
  );
}

// Os styles são os mesmos do exemplo anterior
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
    marginBottom: 30,
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
    marginTop: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 24,
    textAlign: 'justify',
    marginBottom: 16,
  },
});