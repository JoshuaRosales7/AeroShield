import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { KPIData } from "@/types"
import { getAQIBgColor } from "@/lib/aqi"

interface KpiCardProps {
  data: KPIData
}

export function KpiCard({ data }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
        {data.status && (
          <Badge
            variant="secondary"
            className={cn(
              data.status === "good" && getAQIBgColor("good"),
              data.status === "moderate" && getAQIBgColor("moderate"),
              data.status === "unhealthy-sensitive" && getAQIBgColor("unhealthy-sensitive"),
              data.status === "unhealthy" && getAQIBgColor("unhealthy"),
              data.status === "very-unhealthy" && getAQIBgColor("very-unhealthy"),
              data.status === "hazardous" && getAQIBgColor("hazardous"),
            )}
          >
            {data.status}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold">
            {data.value}
            {data.unit && <span className="ml-1 text-lg font-normal text-muted-foreground">{data.unit}</span>}
          </div>
          {data.trend && (
            <div
              className={cn(
                "flex items-center text-xs",
                data.trend.direction === "up" ? "text-red-500" : "text-green-500",
              )}
            >
              {data.trend.direction === "up" ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {Math.abs(data.trend.value)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
