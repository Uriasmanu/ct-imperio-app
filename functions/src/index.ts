/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";

admin.initializeApp();
const db = admin.firestore();

// Define opções globais (limite de instâncias)
setGlobalOptions({ maxInstances: 10 });

/**
 * Roda TODO DIA 5 às 12h (meio-dia)
 * Fuso horário: América/São_Paulo
 */
export const resetarPagamentos = onSchedule(
  {
    schedule: "0 12 5 * *", // minuto 0, hora 12, dia 5 de cada mês
    timeZone: "America/Sao_Paulo",
  },
  async () => {
    console.log("⏰ Iniciando reset de pagamentos...");

    const usuariosSnapshot = await db.collection("usuarios").get();
    const batch = db.batch();

    usuariosSnapshot.forEach((doc) => {
      batch.update(doc.ref, { pagamento: false });
    });

    await batch.commit();
    console.log("✅ Todos os pagamentos foram resetados para false");
  }
);
