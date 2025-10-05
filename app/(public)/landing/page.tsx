import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Cloud,
  Flame,
  Globe,
  Mountain,
  Shield,
  Users,
  Wind,
  Zap,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-mono text-sm font-bold text-primary-foreground">AS</span>
            </div>
            <span className="font-semibold">AeroShield</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/sign-in">
              <Button>Comenzar</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-8 py-24 text-center lg:py-32">
        <Badge variant="secondary" className="mb-4">
          <Zap className="mr-1 h-3 w-3" />
          Monitoreo en Tiempo Real
        </Badge>
        <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Plataforma integral de monitoreo ambiental y gestión de riesgos
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
          Combina datos satelitales TEMPO, estaciones terrestres, clima, actividad sísmica y volcánica para proteger tu
          comunidad con información precisa y alertas oportunas.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/sign-in">
            <Button size="lg" className="w-full sm:w-auto">
              Entrar al Panel
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
            Ver Demo
          </Button>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="border-t border-border bg-muted/50 py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Capacidades de la Plataforma</h2>
            <p className="mt-4 text-lg text-muted-foreground">Monitoreo multi-fuente para decisiones informadas</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Wind className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Calidad del Aire</CardTitle>
                <CardDescription>
                  Datos satelitales TEMPO y estaciones terrestres para NO₂, O₃, PM2.5, HCHO y aerosoles
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Activity className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Monitoreo Sísmico</CardTitle>
                <CardDescription>
                  Datos en tiempo real de USGS con alertas de magnitud, profundidad y distancia
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Mountain className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Actividad Volcánica</CardTitle>
                <CardDescription>
                  Estado de volcanes, plumas de ceniza y análisis de gases con impacto en calidad del aire
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Cloud className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Datos Meteorológicos</CardTitle>
                <CardDescription>
                  Viento, temperatura, humedad y precipitación para contexto de dispersión de contaminantes
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <BarChart3 className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Predicción con IA</CardTitle>
                <CardDescription>
                  Modelos de machine learning para pronósticos de calidad del aire 24-72 horas
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <AlertTriangle className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Sistema de Alertas</CardTitle>
                <CardDescription>
                  Notificaciones personalizadas por umbrales, ubicación y perfil de riesgo
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Casos de Uso</h2>
            <p className="mt-4 text-lg text-muted-foreground">Diseñado para múltiples perfiles y necesidades</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Users className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Ciudadanos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Planifica actividades al aire libre con información de calidad del aire y alertas de riesgos
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Grupos Sensibles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Asmáticos, niños y adultos mayores reciben recomendaciones personalizadas de salud
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Globe className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Educadores</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Datos científicos para enseñanza de ciencias ambientales y conciencia ecológica
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Flame className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Autoridades</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Herramientas de análisis y reportes para toma de decisiones en protección civil
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="border-t border-border bg-muted/50 py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Lo que dicen nuestros usuarios</h2>
            <p className="mt-4 text-lg text-muted-foreground">Historias reales de personas que confían en AeroShield</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-semibold text-primary">MC</span>
                  </div>
                  <div>
                    <CardTitle className="text-base">María Contreras</CardTitle>
                    <CardDescription>Madre de familia, Ciudad de México</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  "Como madre de un niño con asma, AeroShield me ha dado tranquilidad. Las alertas me ayudan a decidir
                  cuándo es seguro que mi hijo juegue afuera. Es una herramienta invaluable para nuestra familia."
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-semibold text-primary">JR</span>
                  </div>
                  <div>
                    <CardTitle className="text-base">Dr. Jorge Ramírez</CardTitle>
                    <CardDescription>Director de Protección Civil, Puebla</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  "La integración de datos sísmicos y volcánicos con calidad del aire nos permite tomar decisiones más
                  informadas. El sistema de alertas ha mejorado significativamente nuestros tiempos de respuesta."
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-semibold text-primary">AL</span>
                  </div>
                  <div>
                    <CardTitle className="text-base">Ana López</CardTitle>
                    <CardDescription>Profesora de Ciencias, Guadalajara</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  "Uso AeroShield en mis clases para enseñar sobre medio ambiente y cambio climático. Los datos en
                  tiempo real hacen que las lecciones sean más relevantes y los estudiantes están más comprometidos."
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-semibold text-primary">CM</span>
                  </div>
                  <div>
                    <CardTitle className="text-base">Carlos Mendoza</CardTitle>
                    <CardDescription>Corredor amateur, Monterrey</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  "Entreno al aire libre todos los días. Con AeroShield puedo planificar mis rutas y horarios según la
                  calidad del aire. He notado una gran mejora en mi rendimiento y salud respiratoria."
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-semibold text-primary">LG</span>
                  </div>
                  <div>
                    <CardTitle className="text-base">Dra. Laura García</CardTitle>
                    <CardDescription>Investigadora Ambiental, UNAM</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  "La precisión de los datos satelitales TEMPO combinados con estaciones terrestres es impresionante.
                  Hemos usado AeroShield en varios estudios de investigación con excelentes resultados."
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-semibold text-primary">RS</span>
                  </div>
                  <div>
                    <CardTitle className="text-base">Roberto Sánchez</CardTitle>
                    <CardDescription>Gerente de Operaciones, Empresa Industrial</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  "Monitoreamos la calidad del aire alrededor de nuestras instalaciones con AeroShield. Nos ayuda a
                  cumplir con regulaciones ambientales y mantener informada a la comunidad local."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/50 py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight">Comienza a monitorear tu entorno</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Accede a datos en tiempo real y protege lo que más importa
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/sign-in">
              <Button size="lg">Entrar al Panel</Button>
            </Link>
            <Button size="lg" variant="outline">
              Contactar Ventas
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <span className="font-mono text-xs font-bold text-primary-foreground">AS</span>
            </div>
            <span className="text-sm text-muted-foreground">© 2025 AeroShield. Todos los derechos reservados.</span>
          </div>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/legal/privacy" className="hover:text-foreground">
              Privacidad
            </Link>
            <Link href="/legal/terms" className="hover:text-foreground">
              Términos
            </Link>
            <Link href="/about" className="hover:text-foreground">
              Acerca de
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contacto
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
