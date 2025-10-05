"use client"

import { useState, useEffect } from "react"
import { Bell, Globe, Lock, Palette, User, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useAppStore } from "@/lib/store"
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore"
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"

export default function SettingsPageContent() {
  const { user } = useAppStore()
  const db = getFirestore()
  const storage = getStorage()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    organization: "",
    photoURL: "",
  })
  const [permissions, setPermissions] = useState({
    notifications: false,
    useWeather: false,
    syncHealthApp: false,
  })
  const [preferences, setPreferences] = useState({
    locale: "es",
    theme: "dark",
    highContrast: false,
  })
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  // 🔹 Cargar datos desde Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return
      setLoading(true)
      try {
        const userRef = doc(db, "users", user.id)
        const snapshot = await getDoc(userRef)
        if (snapshot.exists()) {
          const data = snapshot.data()
          setProfile({
            name: data.name || "",
            email: data.email || "",
            organization: data.organization || "",
            photoURL: data.photoURL || "",
          })
          setPermissions(data.permissions || {})
          setPreferences(data.preferences || {})
        } else {
          toast.warning("No se encontraron datos del usuario.")
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast.error("Error al cargar datos del usuario.")
      } finally {
        setLoading(false)
      }
    }
    loadUserData()
  }, [user?.id])

  // 🔸 Subir foto de perfil
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file || !user?.id) {
    toast.error("No se seleccionó una imagen válida.")
    return
  }

  setUploading(true)
  try {
    const storage = getStorage()
    const fileRef = storageRef(storage, `profilePhotos/${user.id}/${Date.now()}_${file.name}`)
    await uploadBytes(fileRef, file)
    const downloadURL = await getDownloadURL(fileRef)

    await updateDoc(doc(db, "users", user.id), { photoURL: downloadURL })
    setProfile((prev) => ({ ...prev, photoURL: downloadURL }))

    toast.success("Foto de perfil actualizada correctamente ✅")
  } catch (error) {
    console.error("Error al subir la imagen:", error)
    toast.error("Error al subir la foto de perfil.")
  } finally {
    setUploading(false)
  }
}


  // 🔸 Guardar perfil
  const handleSaveProfile = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      await updateDoc(doc(db, "users", user.id), {
        name: profile.name,
        email: profile.email,
        organization: profile.organization,
        photoURL: profile.photoURL,
      })
      toast.success("Perfil actualizado correctamente ✅")
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar perfil")
    } finally {
      setSaving(false)
    }
  }

  // 🔸 Guardar preferencias
  const handleSavePreferences = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      await updateDoc(doc(db, "users", user.id), {
        preferences,
      })
      toast.success("Preferencias actualizadas ✅")
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar preferencias")
    } finally {
      setSaving(false)
    }
  }

  // 🔸 Guardar notificaciones
  const handleSaveNotifications = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      await updateDoc(doc(db, "users", user.id), {
        permissions,
      })
      toast.success("Configuración de notificaciones actualizada ✅")
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar notificaciones")
    } finally {
      setSaving(false)
    }
  }

  // 🔒 Simulación de cambio de contraseña
  const handleUpdatePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("Las contraseñas no coinciden")
      return
    }
    toast.success("Contraseña actualizada (simulación)")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Cargando configuración...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Administra tus preferencias y ajustes de la aplicación</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Perfil</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notificaciones</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" />Apariencia</TabsTrigger>
          <TabsTrigger value="security"><Lock className="mr-2 h-4 w-4" />Seguridad</TabsTrigger>
        </TabsList>

        {/* 🧍 PERFIL */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Información de perfil</CardTitle>
              <CardDescription>Actualiza tu información personal y tu foto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative">
                  <img
                    src={profile.photoURL || "/default-avatar.png"}
                    alt="Foto de perfil"
                    className="w-24 h-24 rounded-full object-cover border shadow"
                  />
                  <label
                    htmlFor="photo"
                    className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/80 transition"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                {uploading && <p className="text-sm text-muted-foreground">Subiendo foto...</p>}
              </div>

              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Correo electrónico</Label>
                <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Organización</Label>
                <Input value={profile.organization} onChange={(e) => setProfile({ ...profile, organization: e.target.value })} />
              </div>

              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🔔 NOTIFICACIONES */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Controla cómo deseas recibir alertas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Notificaciones</Label>
                <Switch checked={permissions.notifications} onCheckedChange={(v) => setPermissions({ ...permissions, notifications: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Usar clima</Label>
                <Switch checked={permissions.useWeather} onCheckedChange={(v) => setPermissions({ ...permissions, useWeather: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Sincronizar app de salud</Label>
                <Switch checked={permissions.syncHealthApp} onCheckedChange={(v) => setPermissions({ ...permissions, syncHealthApp: v })} />
              </div>
              <Button onClick={handleSaveNotifications} disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🎨 APARIENCIA */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>Personaliza cómo se ve la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>Idioma</Label>
              <Select value={preferences.locale} onValueChange={(v) => setPreferences({ ...preferences, locale: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>

              <Label>Tema</Label>
              <Select value={preferences.theme} onValueChange={(v) => setPreferences({ ...preferences, theme: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center justify-between">
                <Label>Alto contraste</Label>
                <Switch checked={preferences.highContrast} onCheckedChange={(v) => setPreferences({ ...preferences, highContrast: v })} />
              </div>

              <Button onClick={handleSavePreferences} disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🔐 SEGURIDAD */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>Actualiza tu contraseña</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>Contraseña actual</Label>
              <Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
              <Label>Nueva contraseña</Label>
              <Input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
              <Label>Confirmar contraseña</Label>
              <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
              <Button onClick={handleUpdatePassword}>Actualizar contraseña</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
