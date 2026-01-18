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
    image: require("../../assets/onbording/inicio.png"),
    backgroundColor: "#000",
    titleColor: "#FFFFFF",
    subtitleColor: "#CCCCCC",
  },
  {
    key: "slide2",
    title: "Conograma",
    subtitle: "Veja o cronograma das aulas",
    image: require("../../assets/onbording/cronograma.jpeg"),
    backgroundColor: "#000",
    titleColor: "#FFFFFF",
    subtitleColor: "#CCCCCC",
  },
];
