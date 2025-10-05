"use client"

import { useEffect, useState } from "react"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FbUser,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useAppStore } from "@/lib/store"
import type { UserProfile, UserPreferences, UserRole } from "@/types"

// ===============================
// Preferencias por defecto (🔥 evita "Unsupported field value: undefined")
// ===============================
const defaultPreferences: UserPreferences = {
  locale: "es",
  theme: "dark",
  alerts: {
    enabled: true,
    channels: ["push"],
    thresholds: { NO2: 100, O3: 70, PM25: 35, HCHO: 50 },
  },
  notifications: { push: true, email: false, sms: false },
}

// ===============================
// Adaptador: Firebase User → UserProfile
// ===============================
function mapFirebaseUserToProfile(fbUser: FbUser): UserProfile {
  return {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split("@")[0] || "Usuario",
    email: fbUser.email || "",
    role: "user" as UserRole,
    createdAt: new Date().toISOString(),
    organization: null,
    photoURL: fbUser.photoURL || null,
    hasOnboarded: false,
    preferences: defaultPreferences,
  }
}

// ===============================
// Traductor de errores de Firebase a mensajes claros en español
// ===============================
function toFriendlyError(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Credenciales inválidas. Verifica tu correo y contraseña."
    case "auth/user-not-found":
      return "No existe una cuenta con ese correo."
    case "auth/too-many-requests":
      return "Demasiados intentos. Intenta de nuevo más tarde."
    case "auth/invalid-email":
      return "El formato de correo no es válido."
    case "auth/weak-password":
      return "La contraseña es muy débil (mínimo 6 caracteres)."
    case "auth/network-request-failed":
      return "Problema de red. Revisa tu conexión."
    default:
      return "Ocurrió un error al procesar tu solicitud."
  }
}

// ===============================
// Hook principal
// ===============================
export function useAuth() {
  const { user, setUser } = useAppStore()
  const [loading, setLoading] = useState(true)

  // Observa y restaura la sesión desde Firebase (y sincroniza con Zustand)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          const ref = doc(db, "users", fbUser.uid)
          const snap = await getDoc(ref)

          if (snap.exists()) {
            // Mezcla con defaults por si faltara algún campo
            const data = snap.data() as Partial<UserProfile>
            const profile: UserProfile = {
              id: fbUser.uid,
              name: data.name ?? fbUser.displayName ?? "Usuario",
              email: data.email ?? fbUser.email ?? "",
              role: (data.role as UserRole) ?? "user",
              createdAt: data.createdAt ?? new Date().toISOString(),
              organization: data.organization ?? null,
              photoURL: data.photoURL ?? fbUser.photoURL ?? null,
              hasOnboarded: data.hasOnboarded ?? false,
              preferences: data.preferences ?? defaultPreferences,
            }
            setUser(profile)
          } else {
            // Crea el documento inicial con defaults
            const profile = mapFirebaseUserToProfile(fbUser)
            await setDoc(ref, profile)
            setUser(profile)
          }
        } else {
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [setUser])

  // Iniciar sesión
  const login = async (email: string, password: string) => {
    try {
      const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password)
      const ref = doc(db, "users", fbUser.uid)
      const snap = await getDoc(ref)

      let profile: UserProfile
      if (snap.exists()) {
        const data = snap.data() as Partial<UserProfile>
        profile = {
          id: fbUser.uid,
          name: data.name ?? fbUser.displayName ?? "Usuario",
          email: data.email ?? fbUser.email ?? "",
          role: (data.role as UserRole) ?? "user",
          createdAt: data.createdAt ?? new Date().toISOString(),
          organization: data.organization ?? null,
          photoURL: data.photoURL ?? fbUser.photoURL ?? null,
          hasOnboarded: data.hasOnboarded ?? false,
          preferences: data.preferences ?? defaultPreferences,
        }
      } else {
        profile = mapFirebaseUserToProfile(fbUser)
        await setDoc(ref, profile)
      }

      setUser(profile)
      return { success: true, user: profile }
    } catch (e: any) {
      return { success: false, error: toFriendlyError(e.code) }
    }
  }

  // Registrar usuario
  const register = async (email: string, password: string, name: string, organization?: string) => {
    try {
      const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password)
      // Opcional: reflejar el nombre en Auth
      try {
        await updateProfile(fbUser, { displayName: name })
      } catch {
        /* no-op */
      }

      const ref = doc(db, "users", fbUser.uid)
      const profile: UserProfile = {
        id: fbUser.uid,
        name,
        email,
        role: "user",
        createdAt: new Date().toISOString(),
        organization: organization ?? null,
        photoURL: fbUser.photoURL || null,
        hasOnboarded: false,
        preferences: defaultPreferences, // 🔥 siempre definido
      }

      await setDoc(ref, profile)
      setUser(profile)
      return { success: true, user: profile }
    } catch (e: any) {
      return { success: false, error: toFriendlyError(e.code) }
    }
  }

  // Recuperar contraseña
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (e: any) {
      return { success: false, error: toFriendlyError(e.code) }
    }
  }

  // Cerrar sesión
  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  return {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    resetPassword,
    logout,
  }
}
