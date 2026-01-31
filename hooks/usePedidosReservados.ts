import { db } from "@/config/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

export function usePedidosReservados() {
  const [reservados, setReservados] = useState(0);

  useEffect(() => {
    const carregar = async () => {
      const snapshot = await getDocs(collection(db, "pedidos"));

      const total = snapshot.docs.filter(
        (doc) => doc.data().status === "reservado"
      ).length;

      setReservados(total);
    };

    carregar();
  }, []);

  return reservados;
}
