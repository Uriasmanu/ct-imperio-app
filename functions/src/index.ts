import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();
const db = admin.firestore();

/**
 * Roda TODO DIA 5 às 12h (meio-dia)
 * Fuso horário: América/São_Paulo
 */
export const resetarPagamentos = functions.pubsub
  .schedule("0 12 5 * *") // minuto 0, hora 12, dia 5, todos os meses
  .timeZone("America/Sao_Paulo")
  .onRun(async () => {
    console.log("⏰ Iniciando reset de pagamentos...");

    const usuariosSnapshot = await db.collection("usuarios").get();

    const batch = db.batch();

    usuariosSnapshot.forEach((doc: { id: any; }) => {
      const userRef = db.collection("usuarios").doc(doc.id);
      batch.update(userRef, { pagamento: false });
    });

    await batch.commit();

    console.log("✅ Todos os pagamentos foram resetados para false");
    return null;
  });
