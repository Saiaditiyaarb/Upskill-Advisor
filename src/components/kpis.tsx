"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
    Target, 
    Clock, 
    DollarSign, 
    CheckCircle, 
    TrendingUp,
    BarChart3,
    Activity,
    Info
} from "lucide-react"
import type { MetricsData } from "@/lib/api"

interface KPIsComponentProps {
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

export function KPIsComponent({ className }: KPIsComponentProps) {
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
                setError(err instanceof Error ? err.message : "Failed to load KPIs")
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
                        Key Performance Indicators
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
                        Key Performance Indicators
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-red-600">
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
                        Key Performance Indicators
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <div className="text-lg mb-2">No KPIs data available</div>
                        <div className="text-sm">KPIs will appear after processing requests</div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Calculate KPIs
    const calculateKPIs = () => {
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

        // Performance Target (2.5 seconds)
        const performanceTarget = 2500
        const performanceTargetMet = avgResponseTime <= performanceTarget

        // Cost per Request
        const costPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0

        // Accuracy Trend (last 10 vs previous 10)
        const recentAccuracy = accuracy.slice(-10)
        const previousAccuracy = accuracy.slice(-20, -10)
        const recentAvgAccuracy = recentAccuracy.length > 0 
            ? recentAccuracy.reduce((sum, entry) => sum + entry.accuracy_score, 0) / recentAccuracy.length 
            : 0
        const previousAvgAccuracy = previousAccuracy.length > 0 
            ? previousAccuracy.reduce((sum, entry) => sum + entry.accuracy_score, 0) / previousAccuracy.length 
            : 0
        const accuracyTrend = previousAvgAccuracy > 0 ? ((recentAvgAccuracy - previousAvgAccuracy) / previousAvgAccuracy) * 100 : 0

        // Response Time Trend
        const recentLatency = latency.slice(-10)
        const previousLatency = latency.slice(-20, -10)
        const recentAvgLatency = recentLatency.length > 0 
            ? recentLatency.reduce((sum, entry) => sum + entry.duration_ms, 0) / recentLatency.length 
            : 0
        const previousAvgLatency = previousLatency.length > 0 
            ? previousLatency.reduce((sum, entry) => sum + entry.duration_ms, 0) / previousLatency.length 
            : 0
        const latencyTrend = previousAvgLatency > 0 ? ((recentAvgLatency - previousAvgLatency) / previousAvgLatency) * 100 : 0

        return {
            totalCost,
            successRate,
            avgResponseTime,
            avgAccuracy,
            performanceTargetMet,
            costPerRequest,
            accuracyTrend,
            latencyTrend,
            totalRequests,
            successfulRequests
        }
    }

    const kpis = calculateKPIs()

    const getTrendIcon = (trend: number) => {
        if (trend > 5) return <TrendingUp className="h-4 w-4 text-green-600" />
        if (trend < -5) return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
        return <Activity className="h-4 w-4 text-gray-600" />
    }

    const getTrendColor = (trend: number) => {
        if (trend > 5) return "text-green-600"
        if (trend < -5) return "text-red-600"
        return "text-gray-600"
    }

  return (
        <Card className={className}>
          <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Key Performance Indicators
                    <InfoTooltip content="Real-time KPIs showing system performance, accuracy trends, and operational metrics">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </InfoTooltip>
                </CardTitle>
          </CardHeader>
          <CardContent>
                <div className="space-y-6">
                    {/* Primary KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Cost */}
                        <div className="text-center p-4 border rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium">Total Cost</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600 mb-1">
                                ${kpis.totalCost.toFixed(4)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                ${kpis.costPerRequest.toFixed(6)} per request
                            </div>
                        </div>

                        {/* Success Rate */}
                        <div className="text-center p-4 border rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium">Success Rate</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                                {kpis.successRate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {kpis.successfulRequests}/{kpis.totalRequests} requests
                            </div>
                        </div>

                        {/* Average Response Time */}
                        <div className="text-center p-4 border rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                                <span className="text-sm font-medium">Avg Response Time</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-600 mb-1">
                                {kpis.avgResponseTime.toFixed(0)}ms
                            </div>
                            <div className="flex items-center justify-center gap-1 text-xs">
                                {getTrendIcon(-kpis.latencyTrend)}
                                <span className={getTrendColor(-kpis.latencyTrend)}>
                                    {kpis.latencyTrend > 0 ? '+' : ''}{kpis.latencyTrend.toFixed(1)}%
                                </span>
                            </div>
                        </div>

                        {/* Accuracy Score */}
                        <div className="text-center p-4 border rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Target className="h-5 w-5 text-purple-600" />
                                <span className="text-sm font-medium">Accuracy Score</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-600 mb-1">
                                {(kpis.avgAccuracy * 100).toFixed(1)}%
                            </div>
                            <div className="flex items-center justify-center gap-1 text-xs">
                                {getTrendIcon(kpis.accuracyTrend)}
                                <span className={getTrendColor(kpis.accuracyTrend)}>
                                    {kpis.accuracyTrend > 0 ? '+' : ''}{kpis.accuracyTrend.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Performance Target Status */}
                    <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                <span className="font-medium">Performance Target Status</span>
                            </div>
                            <Badge variant={kpis.performanceTargetMet ? "default" : "destructive"}>
                                {kpis.performanceTargetMet ? "Target Met" : "Below Target"}
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Response Time Target: 2.5s</span>
                                <span className="font-semibold">
                                    {kpis.avgResponseTime > 1000 
                                        ? `${(kpis.avgResponseTime / 1000).toFixed(2)}s` 
                                        : `${kpis.avgResponseTime}ms`
                                    }
                                </span>
                            </div>
                            <Progress 
                                value={Math.min(100, (2500 / kpis.avgResponseTime) * 100)} 
                                className="h-2"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>0ms</span>
                                <span className="font-medium">Target: 2.5s</span>
                                <span>{kpis.avgResponseTime > 1000 ? `${(kpis.avgResponseTime / 1000).toFixed(1)}s` : `${kpis.avgResponseTime}ms`}</span>
                            </div>
                        </div>
                    </div>

                    {/* Trend Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="h-4 w-4" />
                                <span className="font-medium">Accuracy Trend</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {getTrendIcon(kpis.accuracyTrend)}
                                <span className={`font-semibold ${getTrendColor(kpis.accuracyTrend)}`}>
                                    {kpis.accuracyTrend > 0 ? '+' : ''}{kpis.accuracyTrend.toFixed(1)}%
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    vs previous period
                                </span>
                            </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">Response Time Trend</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {getTrendIcon(-kpis.latencyTrend)}
                                <span className={`font-semibold ${getTrendColor(-kpis.latencyTrend)}`}>
                                    {kpis.latencyTrend > 0 ? '+' : ''}{kpis.latencyTrend.toFixed(1)}%
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    vs previous period
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
          </CardContent>
        </Card>
  )
}