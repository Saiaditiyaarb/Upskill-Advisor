"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
    DollarSign, 
    TrendingUp, 
    Clock, 
    Target, 
    BarChart3,
    Activity,
    CheckCircle,
    AlertCircle,
    Info
} from "lucide-react"
import type { MetricsData } from "@/lib/api"

interface MetricsDashboardProps {
    className?: string
}

interface InfoTooltipProps {
    content: string
    children: React.ReactNode
}

function InfoTooltip({ content, children }: InfoTooltipProps) {
    return (
        <div className="group relative inline-flex items-center">
            {children}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs">
                {content}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
        </div>
    )
}

export function MetricsDashboard({ className }: MetricsDashboardProps) {
    const [metricsData, setMetricsData] = useState<MetricsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                setLoading(true)
                const response = await fetch("/api/v1/metrics/reports")
                if (!response.ok) {
                    throw new Error("Failed to fetch metrics")
                }
                const result = await response.json()
                setMetricsData(result.data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load metrics")
            } finally {
                setLoading(false)
            }
        }

        fetchMetrics()
    }, [])

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        System Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        System Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!metricsData) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        System Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <div className="text-lg mb-2">No metrics data available</div>
                        <div className="text-sm">Metrics will appear after processing requests</div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Calculate aggregated metrics
    const calculateMetrics = () => {
        const accuracy = metricsData.accuracy || []
        const latency = metricsData.latency || []
        const cost = metricsData.cost || []

        // Total Cost
        const totalCost = cost.reduce((sum, entry) => sum + (entry.cost_usd || 0), 0)

        // Success Rate
        const totalRequests = latency.length
        const successfulRequests = latency.filter(entry => entry.success).length
        const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0

        // Average Response Time
        const avgResponseTime = latency.length > 0 
            ? latency.reduce((sum, entry) => sum + entry.duration_ms, 0) / latency.length 
            : 0

        // Accuracy Score
        const avgAccuracy = accuracy.length > 0 
            ? accuracy.reduce((sum, entry) => sum + entry.accuracy_score, 0) / accuracy.length 
            : 0

        // Accuracy by Component
        const accuracyByComponent = accuracy.reduce((acc, entry) => {
            if (!acc[entry.component]) {
                acc[entry.component] = { total: 0, count: 0 }
            }
            acc[entry.component].total += entry.accuracy_score
            acc[entry.component].count += 1
            return acc
        }, {} as Record<string, { total: number; count: number }>)

        // Response Time Trend (last 10 entries)
        const responseTimeTrend = latency.slice(-10).map(entry => ({
            timestamp: entry.timestamp,
            duration: entry.duration_ms,
            success: entry.success
        }))

        return {
            totalCost,
            successRate,
            avgResponseTime,
            avgAccuracy,
            accuracyByComponent,
            responseTimeTrend,
            totalRequests,
            successfulRequests
        }
    }

    const metrics = calculateMetrics()

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Key Metrics Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        System Performance Overview
                        <InfoTooltip content="Real-time system performance metrics showing cost, success rate, response times, and accuracy across all components">
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </InfoTooltip>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Cost */}
                        <div className="text-center p-4 border rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium">Total Cost</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                                ${metrics.totalCost.toFixed(4)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                All operations
                            </div>
                        </div>

                        {/* Success Rate */}
                        <div className="text-center p-4 border rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium">Success Rate</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                                {metrics.successRate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {metrics.successfulRequests}/{metrics.totalRequests} requests
                            </div>
                        </div>

                        {/* Average Response Time */}
                        <div className="text-center p-4 border rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                                <span className="text-sm font-medium">Avg Response Time</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-600">
                                {metrics.avgResponseTime.toFixed(0)}ms
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Across all operations
                            </div>
                        </div>

                        {/* Accuracy Score */}
                        <div className="text-center p-4 border rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Target className="h-5 w-5 text-purple-600" />
                                <span className="text-sm font-medium">Accuracy Score</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-600">
                                {(metrics.avgAccuracy * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Average accuracy
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Accuracy by Component */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Accuracy by Component
                        <InfoTooltip content="Shows accuracy scores for different system components (advisor, retriever, llm, cross_encoder, crawler)">
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </InfoTooltip>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(metrics.accuracyByComponent).map(([component, data]) => {
                            const avgAccuracy = data.count > 0 ? data.total / data.count : 0
                            const accuracyPercentage = avgAccuracy * 100
                            
                            return (
                                <div key={component} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium capitalize">{component}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {data.count} operations
                                            </Badge>
                                        </div>
                                        <span className="font-semibold text-purple-600">
                                            {accuracyPercentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <Progress value={accuracyPercentage} className="h-2" />
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Response Time Trend */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Response Time Trend
                        <InfoTooltip content="Shows the last 10 operations with their response times and success status">
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </InfoTooltip>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {metrics.responseTimeTrend.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${
                                        entry.success ? 'bg-green-500' : 'bg-red-500'
                                    }`}></div>
                                    <div>
                                        <div className="text-sm font-medium">
                                            {new Date(entry.timestamp).toLocaleTimeString()}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {entry.success ? 'Success' : 'Failed'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-semibold text-orange-600">
                                        {entry.duration}ms
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cost Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Cost Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {metricsData.cost?.slice(-5).map((entry, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded">
                                    <div>
                                        <div className="text-sm font-medium">{entry.component}</div>
                                        <div className="text-xs text-muted-foreground">{entry.operation}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-green-600">
                                            ${entry.cost_usd.toFixed(4)}
                                        </div>
                                        {entry.tokens_used && (
                                            <div className="text-xs text-muted-foreground">
                                                {entry.tokens_used} tokens
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Operations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Recent Operations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {metricsData.latency?.slice(-5).map((entry, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded">
                                    <div>
                                        <div className="text-sm font-medium">{entry.component}</div>
                                        <div className="text-xs text-muted-foreground">{entry.operation}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-semibold ${
                                            entry.success ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {entry.duration_ms}ms
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {entry.success ? 'Success' : 'Failed'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}