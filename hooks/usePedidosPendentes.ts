import { db } from "@/config/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

export function usePedidosPendentes() {
  const [pendentes, setPendentes] = useState(0);

  useEffect(() => {
    const carregar = async () => {
      const snapshot = await getDocs(collection(db, "pedidos"));

      const total = snapshot.docs.filter(
        (doc) => doc.data().pago === false,
      ).length;

      setPendentes(total);
    };

    carregar();
  }, []);

  return pendentes;
}
