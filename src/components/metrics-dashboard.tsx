"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Legend } from "recharts"
import { getMetrics, getCourseStats, type MetricsData, type CourseStats } from "@/lib/api"
import { TrendingUp, TrendingDown, Clock, DollarSign, Target, Users, BookOpen } from "lucide-react"

interface MetricsDashboardProps {
    className?: string
}

export function MetricsDashboard({ className }: MetricsDashboardProps) {
    const [metrics, setMetrics] = useState<MetricsData | null>(null)
    const [courseStats, setCourseStats] = useState<CourseStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [metricsData, statsData] = await Promise.all([
                    getMetrics(),
                    getCourseStats()
                ])
                setMetrics(metricsData)
                setCourseStats(statsData)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load metrics")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
        // Refresh every 30 seconds
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className={`space-y-6 ${className}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="pb-2">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 bg-muted rounded w-1/2"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <Card className={className}>
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                        <p>Failed to load metrics: {error}</p>
                        <Button 
                            variant="outline" 
                            onClick={() => window.location.reload()}
                            className="mt-2"
                        >
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Calculate key metrics
    const avgAccuracy = metrics?.accuracy?.length 
        ? metrics.accuracy.reduce((sum, m) => sum + m.accuracy_score, 0) / metrics.accuracy.length 
        : 0

    const avgLatency = metrics?.latency?.length 
        ? metrics.latency.reduce((sum, m) => sum + m.duration_ms, 0) / metrics.latency.length 
        : 0

    const totalCost = metrics?.cost?.length 
        ? metrics.cost.reduce((sum, m) => sum + m.cost_usd, 0) 
        : 0

    const successRate = metrics?.latency?.length 
        ? (metrics.latency.filter(m => m.success).length / metrics.latency.length) * 100 
        : 0

    // Prepare chart data
    const accuracyByComponent = metrics?.accuracy?.reduce((acc, m) => {
        if (!acc[m.component]) acc[m.component] = { total: 0, count: 0 }
        acc[m.component].total += m.accuracy_score
        acc[m.component].count += 1
        return acc
    }, {} as Record<string, { total: number; count: number }>) || {}

    const accuracyChartData = Object.entries(accuracyByComponent).map(([component, data]) => ({
        component: component.charAt(0).toUpperCase() + component.slice(1),
        accuracy: data.total / data.count
    }))

    const latencyChartData = metrics?.latency?.slice(-10).map(m => ({
        timestamp: new Date(m.timestamp).toLocaleTimeString(),
        duration_ms: m.duration_ms,
        success: m.success
    })) || []

    const providerData = courseStats?.providers ? Object.entries(courseStats.providers).map(([provider, count]) => ({
        provider,
        count
    })) : []

    const difficultyData = courseStats?.difficulties ? Object.entries(courseStats.difficulties).map(([difficulty, count]) => ({
        difficulty,
        count
    })) : []

    const COLORS = [
        "hsl(var(--primary))",
        "hsl(var(--secondary))",
        "hsl(var(--muted-foreground))",
        "hsl(var(--accent))",
        "hsl(var(--destructive))"
    ]

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Accuracy Score</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(avgAccuracy * 100).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Average recommendation accuracy
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {avgLatency.toFixed(0)}ms
                        </div>
                        <p className="text-xs text-muted-foreground">
                            System performance
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {successRate.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Request success rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${totalCost.toFixed(4)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            API usage cost
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Accuracy by Component */}
                <Card>
                    <CardHeader>
                        <CardTitle>Accuracy by Component</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={accuracyChartData}>
                                    <XAxis dataKey="component" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} domain={[0, 1]} />
                                    <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Accuracy']} />
                                    <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Latency Over Time */}
                <Card>
                    <CardHeader>
                        <CardTitle>Response Time Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={latencyChartData}>
                                    <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Line 
                                        type="monotone" 
                                        dataKey="duration_ms" 
                                        stroke="hsl(var(--primary))" 
                                        strokeWidth={2} 
                                        dot={{ fill: "hsl(var(--primary))" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Courses by Provider */}
                <Card>
                    <CardHeader>
                        <CardTitle>Courses by Provider</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={providerData} 
                                        dataKey="count" 
                                        nameKey="provider" 
                                        outerRadius={80} 
                                        paddingAngle={2}
                                    >
                                        {providerData.map((_, idx) => (
                                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Courses by Difficulty */}
                <Card>
                    <CardHeader>
                        <CardTitle>Courses by Difficulty</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={difficultyData}>
                                    <XAxis dataKey="difficulty" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Course Statistics Summary */}
            {courseStats && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Course Database Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{courseStats.total_courses}</div>
                                <div className="text-sm text-muted-foreground">Total Courses</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{Object.keys(courseStats.providers).length}</div>
                                <div className="text-sm text-muted-foreground">Providers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{Object.keys(courseStats.difficulties).length}</div>
                                <div className="text-sm text-muted-foreground">Difficulty Levels</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{Object.keys(courseStats.top_skills).length}</div>
                                <div className="text-sm text-muted-foreground">Unique Skills</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
