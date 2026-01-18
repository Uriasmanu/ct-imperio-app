import { inicioTheme } from "@/styles/theme";
import { carouselImages } from "@/utils/constants";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface CarouselSectionProps {
  images?: any[];
}

export const CarouselSection: React.FC<CarouselSectionProps> = ({
  images = carouselImages,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / (screenWidth - 40));
    setActiveIndex(currentIndex);
  };

  const openImageFullscreen = (image: any) => {
    setSelectedImage(image);
    setShowImageModal(true);
    resetZoom();
  };

  const closeImageFullscreen = () => {
    setShowImageModal(false);
    setSelectedImage(null);
    resetZoom();
  };

  const resetZoom = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };

  const handleZoomIn = () => {
    setScale(Math.min(3, scale + 0.5));
  };

  const handleZoomOut = () => {
    setScale(Math.max(1, scale - 0.5));
  };

  // Criar PanResponder para arrastar a imagem
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => scale > 1,
    onMoveShouldSetPanResponder: () => scale > 1,
    onPanResponderMove: (_, gestureState) => {
      if (scale > 1) {
        setTranslateX(gestureState.dx);
        setTranslateY(gestureState.dy);
      }
    },
    onPanResponderRelease: () => {
      if (scale === 1) {
        setTranslateX(0);
        setTranslateY(0);
      }
    },
  });

  let lastTap: number | null = null;
  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap && now - lastTap < 300) {
      if (scale === 1) {
        setScale(2);
      } else {
        resetZoom();
      }
    }
    lastTap = now;
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
          <TouchableOpacity
            key={index}
            style={styles.carouselItem}
            activeOpacity={0.9}
            onPress={() => openImageFullscreen(image)}
          >
            <Image
              source={image}
              style={styles.carouselImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
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

      {/* Modal para imagem em tela cheia */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageFullscreen}
        statusBarTranslucent={true}
      >
        <View style={styles.fullscreenOverlay}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeImageFullscreen}
            activeOpacity={0.8}
          >
            <View style={styles.closeIconContainer}>
              <View style={[styles.closeIconLine, styles.closeIconLine1]} />
              <View style={[styles.closeIconLine, styles.closeIconLine2]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backgroundOverlay}
            activeOpacity={1}
            onPress={closeImageFullscreen}
          />

          <View
            style={styles.imageContainer}
            {...panResponder.panHandlers} // Adiciona os handlers de pan aqui
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleDoubleTap}
              style={[
                styles.imageWrapper,
                {
                  transform: [
                    { scale: scale },
                    { translateX: translateX },
                    { translateY: translateY },
                  ],
                },
              ]}
            >
              {selectedImage && (
                <Image
                  source={selectedImage}
                  style={styles.fullscreenImage}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Controles de zoom */}
          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
              <Text style={styles.zoomButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={resetZoom}>
              <Text style={styles.zoomButtonText}>⟲</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
              <Text style={styles.zoomButtonText}>-</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  imageContainer: {
    zIndex: 2,
    width: "100%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    width: screenWidth,
    height: "100%",
  },
  fullscreenImage: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 3,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
  },
  closeIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIconLine: {
    position: "absolute",
    width: 20,
    height: 2,
    backgroundColor: "white",
  },
  closeIconLine1: {
    transform: [{ rotate: "45deg" }],
  },
  closeIconLine2: {
    transform: [{ rotate: "-45deg" }],
  },
  zoomControls: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
    padding: 10,
    zIndex: 3,
  },
  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  zoomButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
