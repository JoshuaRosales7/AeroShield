"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { useAppStore } from "@/lib/store"
import { auth, db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import type { UserRole, Theme } from "@/types"

export default function OnboardingPage() {
  const router = useRouter()
  const { setPreferences, setLocale, setTheme } = useAppStore()

  const [step, setStep] = useState(1)
  const totalSteps = 8
  const progress = (step / totalSteps) * 100

  // 🧠 Datos principales del usuario
  const [role, setRole] = useState<UserRole>("user")
  const [locale, setLocaleState] = useState<"es" | "en">("es")
  const [theme, setThemeState] = useState<Theme>("dark")

  // 🩺 Salud y perfil
  const [isMinor, setIsMinor] = useState(false)
  const [hasDisease, setHasDisease] = useState(false)
  const [isElderly, setIsElderly] = useState(false)
  const [isSensitive, setIsSensitive] = useState(false)

  // 🌍 Condiciones del entorno
  const [environment, setEnvironment] = useState({
    areaType: "urbana",
    nearIndustry: false,
    outdoorHours: 4,
    hasPlantsOrPets: false,
  })

  // 📍 Ubicación
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  // 🚨 Alertas
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [thresholds, setThresholds] = useState({
    NO2: 100,
    O3: 70,
    PM25: 35,
    HCHO: 50,
  })
  const [alertSchedule, setAlertSchedule] = useState<"daytime" | "24h">("24h")

  // ⚙️ Preferencias
  const [textSize, setTextSize] = useState<"small" | "normal" | "large">("normal")
  const [highContrast, setHighContrast] = useState(false)

  // 🎯 Objetivos personales
  const [receiveHealthTips, setReceiveHealthTips] = useState(true)
  const [weeklyPlan, setWeeklyPlan] = useState(true)
  const [outdoorReductionTarget, setOutdoorReductionTarget] = useState(2)

  // 🔐 Permisos
  const [permissions, setPermissions] = useState({
    notifications: true,
    useWeather: true,
    syncHealthApp: false,
  })

  // 👉 Guardar onboarding completo
  const handleFinish = async () => {
    setPreferences({
      locale,
      theme,
      alerts: {
        enabled: alertsEnabled,
        channels: ["push"],
        thresholds,
        schedule: alertSchedule,
      },
      notifications: {
        push: permissions.notifications,
      },
      health: {
        isMinor,
        hasDisease,
        isElderly,
        isSensitive,
      },
      environment,
      goals: {
        receiveHealthTips,
        weeklyPlan,
        outdoorReductionTarget,
      },
      permissions,
    })

    setLocale(locale)
    setTheme(theme)

    try {
      const currentUser = auth.currentUser
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid)
        await updateDoc(userRef, {
          hasOnboarded: true,
          role,
          health: { isMinor, hasDisease, isElderly, isSensitive },
          environment,
          alerts: { enabled: alertsEnabled, thresholds },
          preferences: { locale, theme, textSize, highContrast },
          goals: { receiveHealthTips, weeklyPlan, outdoorReductionTarget },
          permissions,
        })
        console.log("✅ Usuario actualizado con información completa de onboarding")
      }
    } catch (err) {
      console.error("❌ Error guardando progreso del onboarding:", err)
    }

    router.push("/dashboard")
  }

  const handleNext = () => (step < totalSteps ? setStep(step + 1) : handleFinish())
  const handleBack = () => step > 1 && setStep(step - 1)

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("Error obteniendo ubicación:", err)
      )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-6">
      <Card className="w-full max-w-2xl shadow-xl border border-border/50 backdrop-blur-md">
        <CardHeader>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-md">
                <span className="font-mono font-bold text-primary-foreground">AS</span>
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Bienvenido a AeroShield</CardTitle>
                <CardDescription className="text-sm">
                  Paso {step} de {totalSteps}
                </CardDescription>
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-2 rounded-full transition-all duration-500" />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Paso 1: Perfil */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-semibold">Tu Perfil</h3>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as UserRole)}>
                {[
                  { id: "user", label: "Ciudadano", desc: "Interesado en la calidad del aire" },
                  { id: "analyst", label: "Analista", desc: "Estudia datos ambientales o científicos" },
                  { id: "admin", label: "Autoridad", desc: "Gestor o responsable institucional" },
                ].map((opt) => (
                  <div key={opt.id} className="flex items-center space-x-2 rounded-lg border p-4">
                    <RadioGroupItem value={opt.id} id={opt.id} />
                    <Label htmlFor={opt.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{opt.label}</div>
                      <div className="text-sm text-muted-foreground">{opt.desc}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="space-y-4 pt-4">
                {[
                  { id: "isMinor", label: "¿Eres menor de edad?", state: isMinor, setter: setIsMinor },
                  { id: "hasDisease", label: "¿Tienes alguna enfermedad respiratoria/cardiaca?", state: hasDisease, setter: setHasDisease },
                  { id: "isElderly", label: "¿Eres adulto mayor?", state: isElderly, setter: setIsElderly },
                  { id: "isSensitive", label: "¿Tienes alta sensibilidad a contaminantes?", state: isSensitive, setter: setIsSensitive },
                ].map((q) => (
                  <div key={q.id} className="flex items-center justify-between">
                    <Label htmlFor={q.id}>{q.label}</Label>
                    <Switch id={q.id} checked={q.state} onCheckedChange={q.setter} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paso 2: Condiciones del entorno */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-semibold">Condiciones del Entorno</h3>
              <RadioGroup value={environment.areaType} onValueChange={(v) => setEnvironment({ ...environment, areaType: v })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="urbana" id="urbana" />
                  <Label htmlFor="urbana">Zona urbana</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rural" id="rural" />
                  <Label htmlFor="rural">Zona rural</Label>
                </div>
              </RadioGroup>

              <div className="flex items-center justify-between">
                <Label>¿Cerca de una zona industrial?</Label>
                <Switch
                  checked={environment.nearIndustry}
                  onCheckedChange={(v) => setEnvironment({ ...environment, nearIndustry: v })}
                />
              </div>

              <div className="space-y-2">
                <Label>Horas al aire libre por día: {environment.outdoorHours}</Label>
                <Slider
                  value={[environment.outdoorHours]}
                  onValueChange={([v]) => setEnvironment({ ...environment, outdoorHours: v })}
                  min={0}
                  max={12}
                  step={1}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>¿Tienes plantas o mascotas en casa?</Label>
                <Switch
                  checked={environment.hasPlantsOrPets}
                  onCheckedChange={(v) => setEnvironment({ ...environment, hasPlantsOrPets: v })}
                />
              </div>
            </div>
          )}

          {/* Paso 3: Ubicación */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-lg font-semibold">Ubicación</h3>
              <Button onClick={requestLocation} className="w-full" variant={location ? "secondary" : "default"}>
                {location ? "Ubicación detectada ✓" : "Permitir acceso a ubicación"}
              </Button>
              {location && (
                <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                  <p className="font-medium">Ubicación detectada:</p>
                  <p className="text-muted-foreground">
                    Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Paso 4: Alertas */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-semibold">Alertas</h3>
              <div className="flex items-center justify-between">
                <Label>Habilitar alertas</Label>
                <Switch checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
              </div>

              {alertsEnabled && (
                <>
                  {Object.entries(thresholds).map(([key, value]) => (
                    <div key={key}>
                      <Label>{key}: {value} µg/m³</Label>
                      <Slider
                        value={[value]}
                        onValueChange={([v]) => setThresholds({ ...thresholds, [key]: v })}
                        min={0}
                        max={200}
                        step={5}
                      />
                    </div>
                  ))}
                  <Label>Horario de alertas</Label>
                  <RadioGroup value={alertSchedule} onValueChange={(v) => setAlertSchedule(v as "daytime" | "24h")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daytime" id="daytime" />
                      <Label htmlFor="daytime">Solo durante el día</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="24h" id="24h" />
                      <Label htmlFor="24h">Todo el día</Label>
                    </div>
                  </RadioGroup>
                </>
              )}
            </div>
          )}

          {/* Paso 5: Preferencias */}
          {step === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-semibold">Preferencias</h3>
              <RadioGroup value={locale} onValueChange={(v) => setLocaleState(v as "es" | "en")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="es" id="es" />
                  <Label htmlFor="es">Español</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en" id="en" />
                  <Label htmlFor="en">English</Label>
                </div>
              </RadioGroup>

              <RadioGroup value={theme} onValueChange={(v) => setThemeState(v as Theme)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">Claro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark">Oscuro</Label>
                </div>
              </RadioGroup>

              <div className="space-y-2">
                <Label>Tamaño del texto</Label>
                <RadioGroup value={textSize} onValueChange={(v) => setTextSize(v as any)}>
                  <RadioGroupItem value="small" id="small" /> <Label htmlFor="small">Pequeño</Label>
                  <RadioGroupItem value="normal" id="normal" /> <Label htmlFor="normal">Normal</Label>
                  <RadioGroupItem value="large" id="large" /> <Label htmlFor="large">Grande</Label>
                </RadioGroup>
              </div>

              <div className="flex items-center justify-between">
                <Label>Alto contraste</Label>
                <Switch checked={highContrast} onCheckedChange={setHighContrast} />
              </div>
            </div>
          )}

          {/* Paso 6: Objetivos */}
          {step === 6 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-semibold">Objetivos personales</h3>
              <div className="flex items-center justify-between">
                <Label>Recibir consejos de salud</Label>
                <Switch checked={receiveHealthTips} onCheckedChange={setReceiveHealthTips} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Plan semanal “Aire limpio”</Label>
                <Switch checked={weeklyPlan} onCheckedChange={setWeeklyPlan} />
              </div>
              <div className="space-y-2">
                <Label>Reducir tiempo al aire libre (horas): {outdoorReductionTarget}</Label>
                <Slider
                  value={[outdoorReductionTarget]}
                  onValueChange={([v]) => setOutdoorReductionTarget(v)}
                  min={0}
                  max={8}
                  step={1}
                />
              </div>
            </div>
          )}

          {/* Paso 7: Permisos */}
          {step === 7 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-semibold">Permisos y sincronización</h3>
              {[
                { id: "notifications", label: "Notificaciones Push", key: "notifications" },
                { id: "useWeather", label: "Usar datos meteorológicos locales", key: "useWeather" },
                { id: "syncHealthApp", label: "Sincronizar con Google Fit / Apple Health", key: "syncHealthApp" },
              ].map((perm) => (
                <div key={perm.id} className="flex items-center justify-between">
                  <Label htmlFor={perm.id}>{perm.label}</Label>
                  <Switch
                    id={perm.id}
                    checked={permissions[perm.key as keyof typeof permissions]}
                    onCheckedChange={(v) => setPermissions({ ...permissions, [perm.key]: v })}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Paso 8: Resumen */}
          {step === 8 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-semibold">Resumen de configuración</h3>
              <div className="text-sm space-y-2">
                <p><strong>Rol:</strong> {role}</p>
                <p><strong>Idioma:</strong> {locale === "es" ? "Español" : "English"}</p>
                <p><strong>Tema:</strong> {theme}</p>
                <p><strong>Alertas:</strong> {alertsEnabled ? "Activas" : "Desactivadas"}</p>
                <p><strong>Permisos:</strong> Notificaciones {permissions.notifications ? "✓" : "✗"}, Meteorología {permissions.useWeather ? "✓" : "✗"}</p>
              </div>
            </div>
          )}

          {/* Navegación */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
              Anterior
            </Button>
            <Button onClick={handleNext}>{step === totalSteps ? "Finalizar" : "Siguiente"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
