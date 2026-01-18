export type SlideType = {
  key: string;
  title: string;
  subtitle: string;
  image: any;
  backgroundColor: string;
  titleColor?: string;
  subtitleColor?: string;
};

export const slides: SlideType[] = [
  {
    key: "slide1",
    title: "Bem-vindo(a)",
    subtitle: "Conheça o app",
    image: require("../../assets/images/android-icon-foreground.png"),
    backgroundColor: "#000",
    titleColor: "#FFFFFF",
    subtitleColor: "#CCCCCC",
  },
];
