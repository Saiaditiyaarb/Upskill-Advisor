"use client"

import { useEffect, useState } from "react"
import { AdvisorForm } from "@/components/advisor-form"
import { ResultsDisplay } from "@/components/results-display"
import { MetricsDashboard } from "@/components/metrics-dashboard"
import { CourseRecommendation } from "@/components/course-recommendation"
import { getAdvice, getAdviceCompare, getMetrics, type UserProfile, type AdviseResult, type MetricsData } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {BarChart3, BookOpen, Target, TrendingUp} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";

export default function Home() {
    const [isLoading, setIsLoading] = useState(false)
    const [results, setResults] = useState<AdviseResult | null>(null)
    const [compareResults, setCompareResults] = useState<AdviseResult[] | null>(null)
    const [metrics, setMetrics] = useState<MetricsData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isDark, setIsDark] = useState<boolean>(false)
    const [activeTab, setActiveTab] = useState("recommendations")

    useEffect(() => {
        // Initialize theme from localStorage or prefers-color-scheme
        const stored = localStorage.getItem("theme")
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        const dark = stored ? stored === 'dark' : prefersDark
        document.documentElement.classList.toggle('dark', dark)
        setIsDark(dark)
    }, [])

    const toggleTheme = () => {
        const next = !isDark
        setIsDark(next)
        document.documentElement.classList.toggle('dark', next)
        localStorage.setItem('theme', next ? 'dark' : 'light')
    }

    const handleFormSubmit = async (profile: UserProfile) => {
        setIsLoading(true)
        setError(null)
        setResults(null)
        setCompareResults(null)

        try {
            // Fetch both regular advice and comparison data in parallel
            const [adviceData, comparisonData] = await Promise.all([
                getAdvice(profile),
                getAdviceCompare(profile)
            ])
            
            setResults(adviceData)
            setCompareResults(comparisonData)
            
            // Also fetch metrics for the dashboard
            try {
                const metricsData = await getMetrics()
                setMetrics(metricsData)
            } catch (metricsError) {
                console.warn("Failed to fetch metrics:", metricsError)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleReset = () => {
        setResults(null)
        setCompareResults(null)
        setMetrics(null)
        setError(null)
        setActiveTab("recommendations")
    }

    // Form view - full screen split layout
    if (!results) {
        return (
            <>
                {error && (
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </div>
                )}
                <AdvisorForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </>
        )
    }

    // Results view - enhanced layout with tabs and metrics
    return (
        <main className="min-h-screen bg-background">
            {/* Header with theme toggle and navigation */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={handleReset}
                                variant="outline"
                                size="sm"
                                className="font-medium"
                            >
                                ← New Recommendations
                            </Button>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                    {results.recommended_courses?.length || 0} courses
                                </Badge>
                                {results.metrics && (
                                    <Badge variant="outline" className="text-xs">
                                        {results.metrics.retrieval_mode || 'hybrid'} mode
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            className="font-medium"
                        >
                            {isDark ? "Light Mode" : "Dark Mode"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Error display */}
            {error && (
                <div className="container mx-auto px-6 pt-6">
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Results content with tabs */}
            <div className="container mx-auto px-6 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="recommendations" className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Recommendations
                        </TabsTrigger>
                        <TabsTrigger value="courses" className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Courses
                        </TabsTrigger>
                        <TabsTrigger value="comparison" className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Comparison
                        </TabsTrigger>
                        <TabsTrigger value="metrics" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Metrics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="recommendations" className="space-y-6">
                        <ResultsDisplay data={results} />
                    </TabsContent>

                    <TabsContent value="courses" className="space-y-6">
                        <CourseRecommendation 
                            courses={results.recommended_courses || []} 
                            metrics={results.metrics}
                        />
                    </TabsContent>

                    <TabsContent value="comparison" className="space-y-6">
                        {compareResults && compareResults.length > 0 ? (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold mb-2">Retrieval Method Comparison</h2>
                                    <p className="text-muted-foreground">
                                        Compare different AI retrieval methods and their performance
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {compareResults.map((result, index) => (
                                        <Card key={index} className="relative">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg capitalize">
                                                        {result.metrics?.retrieval_mode || 'Unknown'} Mode
                                                    </CardTitle>
                                                    {result.metrics && (
                                                        <Badge variant="outline">
                                                            {Math.round((result.metrics.coverage || 0) * 100)}% Coverage
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {result.metrics && (
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <div className="text-muted-foreground">Duration</div>
                                                            <div className="font-semibold">{result.metrics.duration_ms}ms</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-muted-foreground">Diversity</div>
                                                            <div className="font-semibold">{Math.round((result.metrics.diversity || 0) * 100)}%</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-muted-foreground">Courses</div>
                                                            <div className="font-semibold">{result.metrics.selected_count}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-muted-foreground">Skills Covered</div>
                                                            <div className="font-semibold">{result.metrics.covered_target_skills}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="space-y-2">
                                                    <div className="text-sm font-medium">Top Courses:</div>
                                                    <div className="space-y-1">
                                                        {result.recommended_courses?.slice(0, 3).map((course, idx) => (
                                                            <div key={idx} className="text-sm text-muted-foreground truncate">
                                                                {idx + 1}. {course.title}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center text-muted-foreground">
                                        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No comparison data available</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="metrics" className="space-y-6">
                        <MetricsDashboard />
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    )
}