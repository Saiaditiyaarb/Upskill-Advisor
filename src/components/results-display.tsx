import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AdviceData } from "@/lib/api"

interface ResultsDisplayProps {
  data: AdviceData
}

export function ResultsDisplay({ data }: ResultsDisplayProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Learning Plan</CardTitle>
          <CardDescription>Estimated timeline: {data.timeline.weeks} weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.plan.map((course, index) => (
              <div key={course.course_id} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Course {index + 1}</Badge>
                  <h3 className="font-semibold">{course.course_id}</h3>
                </div>
                <p className="text-muted-foreground">{course.why}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skill Gap Analysis</CardTitle>
          <CardDescription>Areas where you need improvement (negative values indicate skill gaps)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(data.gap_map).map(([skill, gap]) => (
              <div key={skill} className="flex justify-between items-center">
                <span className="capitalize">{skill}</span>
                <Badge variant={gap < 0 ? "destructive" : "default"}>
                  {gap > 0 ? "+" : ""}
                  {gap}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {data.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{data.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Raw data for debugging (can be removed in production) */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Response Data</CardTitle>
          <CardDescription>For debugging purposes - this can be removed in production</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">{JSON.stringify(data, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  )
}
