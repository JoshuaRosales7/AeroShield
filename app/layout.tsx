import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/lib/providers"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "AeroShield - Monitoreo Ambiental Integral",
  description: "Plataforma de monitoreo de calidad del aire, clima, actividad sísmica y volcánica en tiempo real",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AeroShield",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0f1a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <Providers>{children}</Providers>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
