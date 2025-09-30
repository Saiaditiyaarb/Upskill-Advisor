"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
    BookOpen, 
    Users, 
    TrendingUp, 
    BarChart3,
    PieChart,
    Info
} from "lucide-react"
import type { CourseStats } from "@/lib/api"

interface CourseStatsComponentProps {
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

export function CourseStatsComponent({ className }: CourseStatsComponentProps) {
    const [courseStats, setCourseStats] = useState<CourseStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCourseStats = async () => {
            try {
                setLoading(true)
                const response = await fetch("/api/v1/courses/stats")
                if (!response.ok) {
                    throw new Error("Failed to fetch course statistics")
                }
                const result = await response.json()
                setCourseStats(result.data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load course statistics")
            } finally {
                setLoading(false)
            }
        }

        fetchCourseStats()
    }, [])

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Course Statistics
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
                        <BookOpen className="h-5 w-5" />
                        Course Statistics
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

    if (!courseStats) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Course Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <div className="text-lg mb-2">No course statistics available</div>
                        <div className="text-sm">Course statistics will appear after the database is populated</div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const getTopItems = (items: Record<string, number>, limit: number = 5) => {
        return Object.entries(items)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Overview Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Course Database Overview
                        <InfoTooltip content="Statistics about the course database including total courses, providers, difficulties, and skill categories">
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </InfoTooltip>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                {courseStats.total_courses}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Courses</div>
                        </div>
                        
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                                {Object.keys(courseStats.providers).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Providers</div>
                        </div>
                        
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-3xl font-bold text-purple-600 mb-2">
                                {Object.keys(courseStats.difficulties).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Difficulty Levels</div>
                        </div>
                        
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-3xl font-bold text-orange-600 mb-2">
                                {Object.keys(courseStats.categories).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Categories</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Providers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Top Providers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {getTopItems(courseStats.providers).map(([provider, count]) => {
                                const percentage = (count / courseStats.total_courses) * 100
                                return (
                                    <div key={provider} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{provider}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-green-600">{count}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {percentage.toFixed(1)}%
                                                </Badge>
                                            </div>
                                        </div>
                                        <Progress value={percentage} className="h-2" />
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Difficulty Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Difficulty Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {getTopItems(courseStats.difficulties).map(([difficulty, count]) => {
                                const percentage = (count / courseStats.total_courses) * 100
                                const getDifficultyColor = (diff: string) => {
                                    switch (diff.toLowerCase()) {
                                        case "beginner": return "text-green-600"
                                        case "intermediate": return "text-yellow-600"
                                        case "advanced": return "text-red-600"
                                        default: return "text-gray-600"
                                    }
                                }
                                
                                return (
                                    <div key={difficulty} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium capitalize">{difficulty}</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-semibold ${getDifficultyColor(difficulty)}`}>
                                                    {count}
                                                </span>
                                                <Badge variant="outline" className="text-xs">
                                                    {percentage.toFixed(1)}%
                                                </Badge>
                                            </div>
                                        </div>
                                        <Progress value={percentage} className="h-2" />
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Skills */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Most Popular Skills
                        <InfoTooltip content="Shows the most frequently taught skills across all courses in the database">
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </InfoTooltip>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getTopItems(courseStats.top_skills, 12).map(([skill, count]) => {
                            const percentage = (count / courseStats.total_courses) * 100
                            return (
                                <div key={skill} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span className="text-sm font-medium capitalize">{skill}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-blue-600">{count}</div>
                                        <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Category Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {getTopItems(courseStats.categories, 8).map(([category, count]) => {
                            const percentage = (count / courseStats.total_courses) * 100
                            return (
                                <div key={category} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium capitalize">{category}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-purple-600">{count}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {percentage.toFixed(1)}%
                                            </Badge>
                                        </div>
                                    </div>
                                    <Progress value={percentage} className="h-2" />
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}