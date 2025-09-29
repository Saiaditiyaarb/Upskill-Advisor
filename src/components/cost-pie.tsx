"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

type CostSlice = { model_name: string; cost_usd: number }

const COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground))", "hsl(var(--secondary))", "hsl(var(--accent))"]

export function CostPieChart({ data }: { data: CostSlice[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Cost Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="cost_usd" nameKey="model_name" outerRadius={100} paddingAngle={2}>
                {data.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
