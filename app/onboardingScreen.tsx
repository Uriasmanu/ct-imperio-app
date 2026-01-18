import { slides } from "@/components/onboarding/slides";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Onboarding from "react-native-onboarding-swiper";

const { width, height } = Dimensions.get("window");

type Props = {
  onFinish: () => void;
};

export default function OnboardingScreen({ onFinish }: Props) {
  const SkipButton = ({ skipLabel, onSkip }: any) => (
    <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
      <Text style={styles.buttonText}>Pular</Text>
    </TouchableOpacity>
  );

  const NextButton = ({ nextLabel, onNext }: any) => (
    <TouchableOpacity onPress={onNext} style={styles.nextButton}>
      <Text style={styles.buttonText}>Próximo</Text>
    </TouchableOpacity>
  );

  const DoneButton = ({ onDone }: any) => (
    <TouchableOpacity onPress={onDone} style={styles.doneButton}>
      <Text style={[styles.buttonText, styles.doneText]}>Começar</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Onboarding
        pages={slides.map((slide) => ({
          backgroundColor: slide.backgroundColor,
          image: (
            <View style={styles.imageContainer}>
              <Image
                source={slide.image}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          ),
          title: slide.title,
          subtitle: slide.subtitle,
          titleStyles: {
            color: slide.titleColor || "#FFFFFF",
            fontSize: 28,
            fontWeight: "800",
            textAlign: "center",
            marginBottom: 12,
            lineHeight: 34,
          },
          subTitleStyles: {
            color: slide.subtitleColor || "#CCCCCC",
            fontSize: 16,
            textAlign: "center",
            lineHeight: 22,
            fontWeight: "400",
            opacity: 0.9,
            paddingHorizontal: 40,
          },
        }))}
        onSkip={onFinish}
        onDone={onFinish}
        SkipButtonComponent={SkipButton}
        NextButtonComponent={NextButton}
        DoneButtonComponent={DoneButton}
        bottomBarHighlight={false}
        bottomBarHeight={80}
        showPagination={true}
        showSkip={true}
        showNext={true}
        showDone={true}
        containerStyles={styles.onboardingContainer}
        imageContainerStyles={styles.customImageContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  onboardingContainer: {
    paddingBottom: 30,
  },
  imageContainer: {
    width: width * 0.85,
    height: height * 0.4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  customImageContainer: {
    paddingBottom: 0,
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginLeft: 10,
  },
  nextButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
  },
  doneButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    opacity: 0.8,
  },
  doneText: {
    color: "#007AFF",
    fontWeight: "700",
    opacity: 1,
  },
});
