import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCQCayOGZxCo3COYxx5PmhRsIXhb0BiOXw",
  authDomain: "aeroshieldgt.firebaseapp.com",
  projectId: "aeroshieldgt",
  storageBucket: "aeroshieldgt.firebasestorage.app",
  messagingSenderId: "248654985571",
  appId: "1:248654985571:web:54fa1a5816bb7ed4303b56",
  measurementId: "G-T60RK5MG54",
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

export const auth = getAuth(app)
export const db = getFirestore(app) // ✅ Solo Firestore

setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("✅ Persistencia local habilitada (localStorage)."))
  .catch((error) => console.error("❌ Error configurando persistencia:", error))
