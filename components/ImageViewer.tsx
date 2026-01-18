// components/ImageViewer.tsx - Versão simplificada (corrigida)
import { Image } from "expo-image";
import React, { useState } from "react";
import {
    Dimensions,
    Modal,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface ImageViewerProps {
  visible: boolean;
  imageUri: any;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  visible,
  imageUri,
  onClose,
}) => {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

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

  // PanResponder para arrastar
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
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            {/* Mude View para Text ou ajuste os estilos */}
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backgroundOverlay}
            activeOpacity={1}
            onPress={onClose}
          />

          <View style={styles.imageContainer} {...panResponder.panHandlers}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleDoubleTap}
              style={[
                styles.imageWrapper,
                {
                  transform: [{ scale }, { translateX }, { translateY }],
                },
              ]}
            >
              <Image
                source={imageUri}
                style={styles.image}
                contentFit="contain"
                transition={100}
              />
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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
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
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
  },
  closeIcon: {
    color: "white",
    fontSize: 24,
    fontWeight: "200" as const,
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
  image: {
    width: "100%",
    height: "100%",
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
    fontWeight: "bold" as const,
  },
});
