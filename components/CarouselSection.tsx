import { inicioTheme } from "@/styles/theme";
import { carouselImages } from "@/utils/constants";
import React, { useRef, useState } from "react";
import {
    Dimensions,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

interface CarouselSectionProps {
  images?: any[];
}

export const CarouselSection: React.FC<CarouselSectionProps> = ({
  images = carouselImages,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / (screenWidth - 40));
    setActiveIndex(currentIndex);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.carousel}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((image, index) => (
          <View key={index} style={styles.carouselItem}>
            <Image
              source={image}
              style={styles.carouselImage}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.indicators}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === activeIndex && styles.indicatorActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: inicioTheme.spacing.lg,
  },
  carousel: {
    marginBottom: inicioTheme.spacing.md,
  },
  carouselItem: {
    width: screenWidth - 40,
    marginHorizontal: 20,
    position: "relative" as const,
  },
  carouselImage: {
    width: "100%" as const,
    height: 250,
    borderRadius: 12,
  },
  indicators: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: inicioTheme.colors.text.muted,
  },
  indicatorActive: {
    backgroundColor: inicioTheme.colors.primary,
    width: 20,
  },
});
