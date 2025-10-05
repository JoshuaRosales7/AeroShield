"use client"

import { Command, LogOut, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CommandPalette } from "./command-palette"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { useAppStore } from "@/lib/store"

export function Topbar() {
  const { user, setUser } = useAppStore()
  const [commandOpen, setCommandOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)

  // 🚪 Cerrar sesión
  const logout = () => {
    setUser(null)
    setShowToast(true)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 transition-all">
        <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6 md:px-8">

          {/* 🔍 Barra de búsqueda / Paleta de comandos */}
          <Button
            variant="outline"
            onClick={() => setCommandOpen(true)}
            className="relative w-full max-w-sm justify-start text-sm text-muted-foreground bg-transparent hover:bg-muted/40 transition rounded-lg h-9 sm:h-10"
          >
            <Search className="mr-2 h-4 w-4 shrink-0" />
            <span className="hidden sm:inline-flex">Buscar en AeroShield...</span>
            <span className="inline-flex sm:hidden">Buscar...</span>
            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden sm:flex h-6 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-xs font-medium opacity-70">
              <Command className="h-3 w-3" />K
            </kbd>
          </Button>

          {/* 👤 Perfil del usuario */}
          <Popover>
            <PopoverTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground font-bold overflow-hidden shadow-md sm:shadow-lg transition-transform"
              >
                {user?.photoURL ? (
                  <motion.img
                    key={user.photoURL}
                    src={user.photoURL}
                    alt={user.name || "Usuario"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.name || "Usuario"
                    )}&background=random`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                )}
              </motion.button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-64 sm:w-72 rounded-2xl border border-white/10 bg-white/10 dark:bg-neutral-900/80 backdrop-blur-md shadow-2xl p-4"
            >
              <Card className="p-4 space-y-3 border-0 shadow-none bg-transparent">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-lg overflow-hidden">
                    {user?.photoURL ? (
                      <motion.img
                        key={user.photoURL}
                        src={user.photoURL}
                        alt={user.name || "Usuario"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user?.name || "Usuario"
                        )}&background=random`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-base sm:text-lg">
                      {user?.name || "Usuario"}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[180px]">
                      {user?.email || "correo@ejemplo.com"}
                    </p>
                  </div>
                </div>

                {user?.organization && (
                  <p className="text-xs sm:text-sm text-muted-foreground pt-2 border-t mt-2">
                    Org: {user.organization}
                  </p>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 hover:bg-destructive hover:text-white transition text-sm"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar sesión
                </Button>
              </Card>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* 🔎 Paleta de comandos global */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      {/* ✅ Animación de feedback */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-4 right-4 bg-neutral-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg"
            onAnimationComplete={() => setTimeout(() => setShowToast(false), 2000)}
          >
            Sesión cerrada correctamente ✅
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
