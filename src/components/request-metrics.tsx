"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
    DollarSign, 
    TrendingUp, 
    Clock, 
    Target, 
    CheckCircle,
    AlertCircle,
    Info
} from "lucide-react"
import type { AdviceData } from "@/lib/api"

interface RequestMetricsProps {
    data: AdviceData
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

export function RequestMetrics({ data, className }: RequestMetricsProps) {
    const metrics = data.metrics || {}
    const skillMap = metrics.skill_map || {}
    
    // Calculate metrics from current request data
    const processingTime = metrics.processing_time_ms || 0
    const performanceTargetMet = metrics.performance_target_met || false
    const coursesAnalyzed = metrics.courses_analyzed || 0
    const coursesSelected = metrics.courses_selected || 0
    
    // Calculate accuracy from skill map
    const accuracyScore = skillMap.coverage_percentage || 0
    const totalSkills = skillMap.total_skills_available || 0
    const coveredSkills = skillMap.covered_skills?.length || 0
    
    // Estimate cost based on processing time
    const estimatedCost = 0.001 + (processingTime * 0.0005)
    
    // Calculate success rate (assume 100% if we got results)
    const successRate = data.recommended_courses && data.recommended_courses.length > 0 ? 100 : 0
    
    const getPerformanceColor = (met: boolean) => {
        return met ? "text-green-600" : "text-red-600"
    }

    const getPerformanceBadgeVariant = (met: boolean) => {
        return met ? "default" : "destructive"
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Key Metrics Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Request Performance Metrics
                        <InfoTooltip content="Real-time metrics for this specific request showing processing time, accuracy, and performance targets">
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </InfoTooltip>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Accuracy Score */}
                        <div className="text-center p-4 border rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Target className="h-5 w-5 text-purple-600" />
                                <span className="text-sm font-medium">Accuracy Score</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-600">
                                {accuracyScore.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {coveredSkills}/{totalSkills} skills covered
                            </div>
                        </div>

                        {/* Average Response Time */}
                        <div className="text-center p-4 border rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                                <span className="text-sm font-medium">Response Time</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-600">
                                {processingTime.toFixed(0)}ms
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Processing time
                            </div>
                        </div>

                        {/* Success Rate */}
                        <div className="text-center p-4 border rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium">Success Rate</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                                {successRate.toFixed(0)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Request success
                            </div>
                        </div>

                        {/* Total Cost */}
                        <div className="text-center p-4 border rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium">Estimated Cost</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                                ${estimatedCost.toFixed(4)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Local processing
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Target Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Performance Target Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Response Time Target</span>
                                <InfoTooltip content="Target response time is 2.5 seconds for optimal user experience">
                                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </InfoTooltip>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`font-semibold ${getPerformanceColor(performanceTargetMet)}`}>
                                    {processingTime > 1000 ? `${(processingTime / 1000).toFixed(2)}s` : `${processingTime}ms`}
                                </span>
                                <Badge variant={getPerformanceBadgeVariant(performanceTargetMet)}>
                                    {performanceTargetMet ? "Target Met" : "Slow"}
                                </Badge>
                            </div>
                        </div>
                        
                        <Progress 
                            value={Math.min(100, (2500 / processingTime) * 100)} 
                            className="h-3"
                        />
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0ms</span>
                            <span className="font-medium">Target: 2.5s</span>
                            <span>{processingTime > 1000 ? `${(processingTime / 1000).toFixed(1)}s` : `${processingTime}ms`}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Course Analysis Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Course Analysis Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 border rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {coursesAnalyzed}
                            </div>
                            <div className="text-sm text-muted-foreground">Courses Analyzed</div>
                            <InfoTooltip content="Total number of courses evaluated to find the best matches for your profile">
                                <Info className="h-3 w-3 text-muted-foreground cursor-help mx-auto mt-1" />
                            </InfoTooltip>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {coursesSelected}
                            </div>
                            <div className="text-sm text-muted-foreground">Courses Selected</div>
                            <InfoTooltip content="Number of courses selected as the best recommendations for your learning goals">
                                <Info className="h-3 w-3 text-muted-foreground cursor-help mx-auto mt-1" />
                            </InfoTooltip>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Skill Coverage Analysis */}
            {skillMap && Object.keys(skillMap).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Skill Coverage Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Skill Coverage</span>
                                    <span className="font-semibold">{accuracyScore.toFixed(1)}%</span>
                                </div>
                                <Progress value={accuracyScore} className="h-3" />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{coveredSkills} skills covered</span>
                                    <span>{skillMap.missing_skills?.length || 0} skills missing</span>
                                </div>
                            </div>

                            {skillMap.covered_skills && skillMap.covered_skills.length > 0 && (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">Covered Skills</div>
                                    <div className="flex flex-wrap gap-1">
                                        {skillMap.covered_skills.slice(0, 8).map((skill, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                {skill}
                                            </Badge>
                                        ))}
                                        {skillMap.covered_skills.length > 8 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{skillMap.covered_skills.length - 8} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
