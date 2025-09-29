import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type KPIs = {
  uptime_pct?: number
  avg_latency_ms?: number
  error_rate_pct?: number
}

export function KPICards({ data }: { data: KPIs | null }) {
  const items = [
    { label: "Uptime", value: data?.uptime_pct != null ? `${data.uptime_pct.toFixed(2)}%` : "—" },
    { label: "Avg Latency", value: data?.avg_latency_ms != null ? `${Math.round(data.avg_latency_ms)} ms` : "—" },
    { label: "Error Rate", value: data?.error_rate_pct != null ? `${data.error_rate_pct.toFixed(2)}%` : "—" },
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((kpi) => (
        <Card key={kpi.label}>
          <CardHeader>
            <CardTitle className="text-base">{kpi.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{kpi.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
