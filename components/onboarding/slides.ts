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
    title: "Bem-vindo à CT Império",
    subtitle: "A sua academia agora está na palma da sua mão",
    image: require("../../assets/onboarding/inicio.png"),
    backgroundColor: "#000",
    titleColor: "#FFFFFF",
    subtitleColor: "#CCCCCC",
  },
  {
    key: "slide2",
    title: "Quadro de Aulas",
    subtitle:
      "Confira horários, professores e o status das aulas em tempo real",
    image: require("../../assets/onboarding/cronograma.png"),
    backgroundColor: "#000",
    titleColor: "#FFFFFF",
    subtitleColor: "#CCCCCC",
  },
  {
    key: "slide3",
    title: "Acesse sua Conta",
    subtitle:
      "Faça login em Configurações para liberar todas as funcionalidades",
    image: require("../../assets/onboarding/registrese.png"),
    backgroundColor: "#000",
    titleColor: "#FFFFFF",
    subtitleColor: "#CCCCCC",
  },
  {
    key: "slide4",
    title: "Perfil e Modalidades",
    subtitle:
      "⚠️ Cadastre uma modalidade para você ou seus filhos para habilitar o financeiro e a presença",
    image: require("../../assets/onboarding/registreFilhos.png"),
    backgroundColor: "#000",
    titleColor: "#FFFFFF",
    subtitleColor: "#CCCCCC",
  },
  {
    key: "slide5",
    title: "Controle de Frequência",
    subtitle:
      "Marque sua presença nas aulas e acompanhe seu histórico de participação",
    image: require("../../assets/onboarding/AvisePresenca.png"),
    backgroundColor: "#000",
    titleColor: "#FFFFFF",
    subtitleColor: "#CCCCCC",
  },
  {
    key: "slide6",
    title: "Status de Pagamento",
    subtitle: "Acompanhe suas mensalidades e use o botão 'Avisar que pagou'",
    image: require("../../assets/onboarding/avisePagamento.png"),
    backgroundColor: "#000",
    titleColor: "#FFFFFF",
    subtitleColor: "#CCCCCC",
  },
  {
    key: "slide7",
    title: "Pagamento via PIX",
    subtitle:
      "Utilize o QR Code ou a chave CNPJ para pagamentos rápidos e seguros",
    image: require("../../assets/onboarding/informacaoPagamento.png"),
    backgroundColor: "#000",
    titleColor: "#FFFFFF",
    subtitleColor: "#CCCCCC",
  },
  {
    key: "slide8",
    title: "Produtos e Uniformes",
    subtitle:
      "Conheça nossos produtos oficiais e demonstre interesse direto pelo app",
    image: require("../../assets/onboarding/nossosProdutos.png"),
    backgroundColor: "#000",
    titleColor: "#FFFFFF",
    subtitleColor: "#CCCCCC",
  },
];
