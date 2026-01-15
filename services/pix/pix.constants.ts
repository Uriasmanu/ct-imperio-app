export const ESTABELECIMENTO_PIX = {
  nome: "WILLIAN IZARIAS DE OLIVEIRA",
  chavePix: "37553172000100",
  cidade: "SAO PAULO",
  banco: "MERCADO PAGO IP LTDA",
  urlMercadoPago:
    "pix-qr.mercadopago.com/instore/ol/v2/3Z8a9gKGCN2yC43PXxcS3f",
};


export const gerarPayloadExato = (): string => {
    return "00020101021126810014BR.GOV.BCB.PIX2559pix-qr.mercadopago.com/instore/ol/v2/3Z8a9gKGCN2yC43PXxcS3f5204000053039865802BR5925WILLIAM IZARIAS DE OLIVEI6009SAO PAULO62080504mpis6304ACA4";
};
