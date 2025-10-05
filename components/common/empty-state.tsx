"use client"

import type { LucideIcon } from "lucide-react"

export default function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <Icon className="mb-2 h-8 w-8 text-muted-foreground" />
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}
