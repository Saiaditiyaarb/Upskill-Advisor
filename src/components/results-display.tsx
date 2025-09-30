"use client"

import { useMemo, useState } from "react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AdviceData } from "@/lib/api"
import { ResultsPDF } from "./results-pdf"
import { SkillMap } from "./skill-map"
import { RequestMetrics } from "./request-metrics"

interface ResultsDisplayProps {
    data: AdviceData
}

export function ResultsDisplay({ data }: ResultsDisplayProps) {
    const hasTimeline = !!(data as any)?.timeline?.weeks
    const gapEntries = Object.entries(data.gap_map || {})

    // Build a quick lookup for course details by id
    const courseById = useMemo(() => {
        const map: Record<string, any> = {}
        for (const c of data.recommended_courses || []) {
            if (c?.course_id) map[c.course_id] = c
        }
        return map
    }, [data.recommended_courses])

    type SortKey = "rating" | "duration" | "beginner"
    const [sortBy, setSortBy] = useState<SortKey>("rating")

    // Limit to exactly 3 courses and sort them
    const sortedCourses = useMemo(() => {
        const arr = [...(data.recommended_courses || [])]
        const difficultyOrder: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 }

        const sorted = arr.sort((a, b) => {
            const ar = Number(a?.metadata?.rating ?? -Infinity)
            const br = Number(b?.metadata?.rating ?? -Infinity)
            const ad = Number.isFinite(a?.duration_weeks) ? Number(a.duration_weeks) : Infinity
            const bd = Number.isFinite(b?.duration_weeks) ? Number(b.duration_weeks) : Infinity
            const adif = difficultyOrder[String(a?.difficulty || "").toLowerCase()] ?? 99
            const bdif = difficultyOrder[String(b?.difficulty || "").toLowerCase()] ?? 99

            if (sortBy === "rating") return br - ar
            if (sortBy === "duration") return ad - bd
            if (sortBy === "beginner") return adif - bdif
            return 0
        })

        // Return only the first 3 courses
        return sorted.slice(0, 3)
    }, [data.recommended_courses, sortBy])

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            {/* Skill Map and Timeline */}
            <SkillMap 
                skillMap={data.metrics?.skill_map}
                timeline={data.timeline}
                courses={data.recommended_courses || []}
            />
            
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <CardTitle>Your Learning Plan</CardTitle>
                            {hasTimeline && (
                                <CardDescription>Estimated timeline: {(data as any).timeline.weeks} weeks</CardDescription>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <PDFDownloadLink
                                document={<ResultsPDF data={data} sortedCourses={sortedCourses} />}
                                fileName={`upskill-plan-${new Date().toISOString().slice(0, 10)}.pdf`}
                            >
                                {({ loading }) => (
                                    <Button variant="outline" disabled={loading}>
                                        {loading ? "Generating PDF..." : "Download PDF"}
                                    </Button>
                                )}
                            </PDFDownloadLink>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.plan.map((step: any, index: number) => {
                            const linkedCourse = step.course_id ? courseById[step.course_id] : undefined
                            const action = step.action ? String(step.action).toUpperCase() : undefined
                            return (
                                <div key={step.course_id ?? index} className="border rounded-lg p-5">
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline">Step {index + 1}</Badge>
                                            {step.skill && <Badge variant="secondary" className="capitalize">{step.skill}</Badge>}
                                            {action && <Badge>{action}</Badge>}
                                        </div>
                                        {linkedCourse?.provider && (
                                            <span className="text-sm text-muted-foreground">{linkedCourse.provider}</span>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="font-medium">
                                            {linkedCourse?.title || step.resource || step.course_id || "Learning step"}
                                        </div>
                                        {step.resource && !linkedCourse?.title && (
                                            <div className="text-sm text-muted-foreground">Resource: {step.resource}</div>
                                        )}
                                        {step.why && (
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">{step.why}</p>
                                        )}
                                        {linkedCourse && (
                                            <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                                                {linkedCourse.difficulty && (
                                                    <Badge variant="outline" className="capitalize">{linkedCourse.difficulty}</Badge>
                                                )}
                                                {Number.isFinite(linkedCourse.duration_weeks) && (
                                                    <span>{linkedCourse.duration_weeks} weeks</span>
                                                )}
                                                {linkedCourse.metadata?.rating && (
                                                    <span>Rating: {linkedCourse.metadata.rating}</span>
                                                )}
                                                {linkedCourse.metadata?.price && (
                                                    <span>Price: {linkedCourse.metadata.price}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-3">
                                        {linkedCourse?.url ? (
                                            <a href={linkedCourse.url} target="_blank" rel="noreferrer">
                                                <Button size="sm">Open course</Button>
                                            </a>
                                        ) : (
                                            <Button size="sm" variant="outline" disabled title="No direct link provided">No direct link</Button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Skill Gap Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle>Skill Gap Analysis</CardTitle>
                    <CardDescription>Missing sub-skills for your target role</CardDescription>
                </CardHeader>
                <CardContent>
                    {gapEntries.length > 0 ? (
                        <div className="space-y-4">
                            {gapEntries.map(([skill, gap]) => (
                                <div key={skill} className="border rounded-lg p-4">
                                    <div className="font-medium capitalize mb-2">{skill}</div>
                                    {Array.isArray(gap) ? (
                                        <div className="flex flex-wrap gap-2">
                                            {gap.map((g: string, i: number) => (
                                                <Badge key={i} variant="secondary">{g}</Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground break-words">{String(gap)}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <div className="text-lg mb-2">No specific skill gaps identified</div>
                            <div className="text-sm">The recommended courses should cover all necessary skills for your target role.</div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {sortedCourses && sortedCourses.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div>
                                <CardTitle>Top 3 Recommended Courses</CardTitle>
                                <CardDescription>Best matches for your profile</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <label htmlFor="sortBy" className="text-muted-foreground">Sort by</label>
                                <select
                                    id="sortBy"
                                    className="border rounded px-2 py-1 bg-background"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortKey)}
                                >
                                    <option value="rating">Top rated</option>
                                    <option value="duration">Shortest duration</option>
                                    <option value="beginner">Beginner friendly</option>
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortedCourses.map((c: any, i: number) => (
                                <div key={c.course_id ?? i} className="border rounded-lg p-5 flex flex-col gap-3">
                                    <div>
                                        <div className="font-semibold leading-tight">{c.title ?? c.course_id}</div>
                                        <div className="flex items-center gap-2 mt-1 text-sm">
                                            {c.provider && <Badge variant="outline">{c.provider}</Badge>}
                                            {c.difficulty && <Badge className="capitalize">{String(c.difficulty)}</Badge>}
                                            {Number.isFinite(c.duration_weeks) && <span className="text-muted-foreground">{c.duration_weeks} weeks</span>}
                                        </div>
                                    </div>

                                    {(c.skills && Array.isArray(c.skills) && c.skills.length > 0) && (
                                        <div className="flex flex-wrap gap-2">
                                            {c.skills.slice(0, 4).map((s: string, idx: number) => (
                                                <Badge key={idx} variant="secondary" className="capitalize text-xs">{s}</Badge>
                                            ))}
                                        </div>
                                    )}

                                    {(c.metadata?.description || c.metadata?.rating || c.metadata?.price) && (
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            {c.metadata?.description && <p className="line-clamp-2">{c.metadata.description}</p>}
                                            <div className="flex items-center gap-3 flex-wrap">
                                                {c.metadata?.rating && <span>★ {c.metadata.rating}</span>}
                                                {c.metadata?.price && <span>{c.metadata.price}</span>}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-auto">
                                        {c.url ? (
                                            <a href={c.url} target="_blank" rel="noreferrer">
                                                <Button size="sm" className="w-full">View course</Button>
                                            </a>
                                        ) : (
                                            <Button size="sm" variant="outline" disabled className="w-full" title="No direct link provided">No direct link</Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Additional Notes */}
            <Card>
                <CardHeader>
                    <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    {data.notes ? (
                        <p className="text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">{data.notes}</p>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <div className="text-lg mb-2">No additional notes available</div>
                            <div className="text-sm">The learning plan has been generated based on your profile and available courses.</div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Request Metrics - Shows metrics from current request */}
            <RequestMetrics data={data} />
        </div>
    )
}