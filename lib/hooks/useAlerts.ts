import { useEffect, useState } from "react"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Alert } from "@/types"

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    try {
      // Referencia a la colección de Firestore
      const q = query(collection(db, "alerts"), orderBy("timestamp", "desc"))

      // Suscripción en tiempo real
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Alert[]

          setAlerts(data)
          setLoading(false)
        },
        (err) => {
          console.error("❌ Error al escuchar alertas:", err)
          setError(err)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      console.error("🔥 Error en useAlerts:", err)
      setError(err as Error)
      setLoading(false)
    }
  }, [])

  return { alerts, loading, error }
}
