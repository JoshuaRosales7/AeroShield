export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="mb-8 text-4xl font-bold">Términos de Servicio</h1>
      <div className="prose prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold">1. Aceptación de Términos</h2>
          <p className="text-muted-foreground">
            Al acceder y usar AeroShield, aceptas estar sujeto a estos términos de servicio y todas las leyes y
            regulaciones aplicables.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">2. Uso de la Plataforma</h2>
          <p className="text-muted-foreground">
            AeroShield proporciona información ambiental con fines informativos. No sustituye alertas oficiales de
            protección civil o autoridades competentes.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">3. Limitación de Responsabilidad</h2>
          <p className="text-muted-foreground">
            Los datos sísmicos provienen de USGS. Los datos de SO₂ volcánico provienen de fuentes externas. TEMPO
            complementa con aerosoles y HCHO. La plataforma no garantiza la precisión absoluta de los datos.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">4. Propiedad Intelectual</h2>
          <p className="text-muted-foreground">
            Todo el contenido, diseño y funcionalidad de AeroShield son propiedad de sus creadores y están protegidos
            por leyes de propiedad intelectual.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">5. Modificaciones</h2>
          <p className="text-muted-foreground">
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor
            inmediatamente después de su publicación.
          </p>
        </section>
      </div>
    </div>
  )
}
