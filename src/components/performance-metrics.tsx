"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
    Clock, 
    Zap, 
    Target, 
    TrendingUp, 
    CheckCircle, 
    AlertCircle,
    Info
} from "lucide-react"

interface PerformanceMetricsProps {
    processingTime?: number
    performanceTargetMet?: boolean
    coursesAnalyzed?: number
    coursesSelected?: number
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

export function PerformanceMetrics({ 
    processingTime, 
    performanceTargetMet, 
    coursesAnalyzed, 
    coursesSelected,
    className 
}: PerformanceMetricsProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Show performance metrics after a short delay
        const timer = setTimeout(() => setIsVisible(true), 500)
        return () => clearTimeout(timer)
    }, [])

    if (!isVisible || processingTime === undefined) {
        return null
    }

    const targetTime = 2500 // 2.5 seconds in milliseconds
    const performancePercentage = Math.min(100, (targetTime / processingTime) * 100)
    
    const getPerformanceColor = (met: boolean | undefined) => {
        if (met === true) return "text-green-600"
        if (met === false) return "text-red-600"
        return "text-yellow-600"
    }

    const getPerformanceBadgeVariant = (met: boolean | undefined) => {
        if (met === true) return "default"
        if (met === false) return "destructive"
        return "secondary"
    }

    return (
        <Card className={`${className} transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Performance Metrics
                    <InfoTooltip content="Real-time performance tracking ensures fast response times. Green indicates sub-2.5s target met, red indicates slower than target.">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </InfoTooltip>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Response Time */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">Response Time</span>
                                <InfoTooltip content={`Time taken to process your request and generate recommendations. Target is under 2.5 seconds for optimal user experience.`}>
                                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                </InfoTooltip>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`font-semibold ${getPerformanceColor(performanceTargetMet)}`}>
                                    {processingTime.toFixed(0)}ms
                                </span>
                                <Badge 
                                    variant={getPerformanceBadgeVariant(performanceTargetMet)}
                                    className="text-xs"
                                >
                                    {performanceTargetMet ? "Target Met" : performanceTargetMet === false ? "Slow" : "Unknown"}
                                </Badge>
                            </div>
                        </div>
                        <Progress 
                            value={performancePercentage} 
                            className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0ms</span>
                            <span className="font-medium">Target: 2.5s</span>
                            <span>{processingTime > 1000 ? `${(processingTime / 1000).toFixed(1)}s` : `${processingTime}ms`}</span>
                        </div>
                    </div>

                    {/* Performance Status */}
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                            {performanceTargetMet ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                                <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-medium">
                                {performanceTargetMet ? "Excellent Performance" : "Performance Below Target"}
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {performanceTargetMet ? "Sub-2.5s response" : "Consider optimizing"}
                        </div>
                    </div>

                    {/* Course Analysis Stats */}
                    {(coursesAnalyzed !== undefined || coursesSelected !== undefined) && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 border rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {coursesAnalyzed || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">Courses Analyzed</div>
                                <InfoTooltip content="Total number of courses evaluated to find the best matches for your profile">
                                    <Info className="h-3 w-3 text-muted-foreground cursor-help mx-auto mt-1" />
                                </InfoTooltip>
                            </div>
                            <div className="text-center p-3 border rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {coursesSelected || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">Courses Selected</div>
                                <InfoTooltip content="Number of courses selected as the best recommendations for your learning goals">
                                    <Info className="h-3 w-3 text-muted-foreground cursor-help mx-auto mt-1" />
                                </InfoTooltip>
                            </div>
                        </div>
                    )}

                    {/* Performance Tips */}
                    {performanceTargetMet === false && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                <div className="text-sm">
                                    <div className="font-medium text-yellow-800">Performance Optimization Tips:</div>
                                    <ul className="mt-1 text-yellow-700 space-y-1">
                                        <li>• Try reducing the number of skills in your profile</li>
                                        <li>• Use offline mode for faster local processing</li>
                                        <li>• Consider more specific goal roles</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
