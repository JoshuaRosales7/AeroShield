import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserProfile, UserPreferences, Theme, Locale } from "@/types"

interface AppState {
  // User
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void

  // Preferences
  preferences: UserPreferences
  setPreferences: (preferences: Partial<UserPreferences>) => void
  setTheme: (theme: Theme) => void
  setLocale: (locale: Locale) => void

  // UI State
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void

  // Map State
  mapCenter: [number, number]
  mapZoom: number
  setMapCenter: (center: [number, number]) => void
  setMapZoom: (zoom: number) => void

  // Selected Items
  selectedPollutants: string[]
  setSelectedPollutants: (pollutants: string[]) => void
}

const defaultPreferences: UserPreferences = {
  locale: "es",
  theme: "dark",
  alerts: {
    enabled: true,
    channels: ["push"],
    thresholds: {
      NO2: 100,
      O3: 70,
      PM25: 35,
      HCHO: 50,
    },
  },
  notifications: {
    push: true,
    email: false,
    sms: false,
  },
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),

      // Preferences
      preferences: defaultPreferences,
      setPreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),
      setTheme: (theme) =>
        set((state) => ({
          preferences: { ...state.preferences, theme },
        })),
      setLocale: (locale) =>
        set((state) => ({
          preferences: { ...state.preferences, locale },
        })),

      // UI State
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Map State
mapCenter: [15.7835, -90.2308], // Centro de Guatemala
mapZoom: 10,
setMapCenter: (center) => set({ mapCenter: center }),
setMapZoom: (zoom) => set({ mapZoom: zoom }),

// Selected Items
selectedPollutants: ["NO2", "O3", "PM25"],
setSelectedPollutants: (pollutants) => set({ selectedPollutants: pollutants }),

    }),
    {
      name: "aeroshield-storage",
      // ✅ incluir user en la persistencia
      partialize: (state) => ({
        user: state.user,
        preferences: state.preferences,
        sidebarCollapsed: state.sidebarCollapsed,
        mapCenter: state.mapCenter,
        mapZoom: state.mapZoom,
      }),
    },
  ),
)
