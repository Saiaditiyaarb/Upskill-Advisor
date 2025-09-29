"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"

type ProviderCount = { provider: string; count: number }
type DifficultyCount = { difficulty: string; count: number }

const ACCENT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--accent))",
]

export function CourseStats({
  byProvider,
  byDifficulty,
}: {
  byProvider: ProviderCount[]
  byDifficulty: DifficultyCount[]
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Courses by Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byProvider}>
                <XAxis dataKey="provider" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="h-full">
        <CardHeader>
          <CardTitle>Courses by Difficulty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byDifficulty} dataKey="count" nameKey="difficulty" outerRadius={100} paddingAngle={2}>
                  {byDifficulty.map((_, idx) => (
                    <Cell key={idx} fill={ACCENT_COLORS[idx % ACCENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
