export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="mb-8 text-4xl font-bold">Política de Privacidad</h1>
      <div className="prose prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold">1. Información que Recopilamos</h2>
          <p className="text-muted-foreground">
            AeroShield recopila información de ubicación, preferencias de usuario y datos de uso de la plataforma para
            proporcionar servicios personalizados de monitoreo ambiental.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">2. Uso de la Información</h2>
          <p className="text-muted-foreground">
            Utilizamos tu información para proporcionar alertas personalizadas, análisis de calidad del aire y
            recomendaciones de salud basadas en tu perfil y ubicación.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">3. Compartir Información</h2>
          <p className="text-muted-foreground">
            No compartimos tu información personal con terceros sin tu consentimiento explícito, excepto cuando sea
            requerido por ley.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">4. Seguridad</h2>
          <p className="text-muted-foreground">
            Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">5. Tus Derechos</h2>
          <p className="text-muted-foreground">
            Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento desde la
            configuración de tu cuenta.
          </p>
        </section>
      </div>
    </div>
  )
}
