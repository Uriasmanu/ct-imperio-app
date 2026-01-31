import { db } from "@/config/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export function usePedidosReservados() {
  const [reservados, setReservados] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "pedidos"),
      (snapshot) => {
        const total = snapshot.docs.filter(
          (doc) => doc.data().status === "reservado"
        ).length;

        setReservados(total);
      }
    );

    return () => unsubscribe();
  }, []);

  return reservados;
}
