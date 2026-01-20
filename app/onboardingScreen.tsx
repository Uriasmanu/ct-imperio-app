import { slides, SlideType } from "../components/onboarding/slides";

import { setOnboardingDone } from "@/storage/onboarding";
import { useRouter } from "expo-router";
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

export default function OnboardingScreen() {
  const router = useRouter();

  const handleFinish = async () => {
    await setOnboardingDone();
    router.replace("/");
  };

  const SkipButton = (props: any) => (
    <TouchableOpacity onPress={props.onPress} style={styles.skipButton}>
      <Text style={styles.buttonText}>Pular</Text>
    </TouchableOpacity>
  );

  const NextButton = (props: any) => (
    <TouchableOpacity onPress={props.onPress} style={styles.nextButton}>
      <Text style={styles.buttonText}>Próximo</Text>
    </TouchableOpacity>
  );

  const DoneButton = (props: any) => (
    <TouchableOpacity
      onPress={async () => {
        await setOnboardingDone();
        props.onPress();
      }}
      style={styles.doneButton}
    >
      <Text style={[styles.buttonText, styles.doneText]}>Começar</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Onboarding
        pages={slides.map((slide: SlideType) => ({
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
          titleStyles: [styles.title, { color: slide.titleColor || "#FFFFFF" }],
          subTitleStyles: [
            styles.subtitle,
            { color: slide.subtitleColor || "#CCCCCC" },
          ],
        }))}
        onSkip={handleFinish}
        onDone={handleFinish}
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
  },
  onboardingContainer: {
    paddingBottom: 30,
  },
  customImageContainer: {
    paddingBottom: 0,
    marginBottom: 10,
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 34,
    fontFamily: "System",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "400",
    opacity: 0.9,
    paddingHorizontal: 40,
    fontFamily: "System",
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
    fontFamily: "System",
  },
  doneText: {
    color: "#007AFF",
    fontWeight: "700",
    opacity: 1,
  },
});
