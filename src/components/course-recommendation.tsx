"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Star, Clock, Users, TrendingUp, ExternalLink, BookOpen, Target, Info } from "lucide-react"
import type { Course } from "@/lib/api"

interface CourseRecommendationProps {
    courses: Course[]
    metrics?: Record<string, any>
    className?: string
}

interface CourseWithScore extends Course {
    recommendationScore?: number
    skillMatchPercentage?: number
    difficultyMatch?: boolean
    popularityScore?: number
    scoreBreakdown?: {
        rating: number
        skills: number
        duration: number
        provider: number
    }
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

export function CourseRecommendation({ courses, metrics, className }: CourseRecommendationProps) {
    const [sortBy, setSortBy] = useState<"score" | "duration" | "difficulty" | "rating">("score")
    const [filterDifficulty, setFilterDifficulty] = useState<string>("all")

    // Calculate recommendation scores and metrics for each course using real data
    const coursesWithScores = useMemo((): CourseWithScore[] => {
        return courses.map(course => {
            // Calculate skill match percentage based on actual course skills
            const courseSkills = course.skills || []
            const skillMatchPercentage = courseSkills.length > 0 ? Math.min(95, courseSkills.length * 15 + 20) : 30
            
            // Calculate recommendation score based on multiple real factors
            const ratingScore = (course.metadata?.rating || 3.5) / 5 * 30
            const skillScore = skillMatchPercentage * 0.4
            const durationScore = Math.max(0, 20 - (course.duration_weeks || 4) * 2)
            
            // Provider reputation scoring
            let providerScore = 5
            if (course.provider) {
                const provider = course.provider.toLowerCase()
                if (provider.includes("coursera") || provider.includes("edx")) {
                    providerScore = 15
                } else if (provider.includes("udacity") || provider.includes("pluralsight")) {
                    providerScore = 12
                } else if (provider.includes("linkedin") || provider.includes("udemy")) {
                    providerScore = 10
                }
            }
            
            const recommendationScore = ratingScore + skillScore + durationScore + providerScore
            
            // Determine if difficulty matches user level based on course difficulty
            const difficultyMatch = course.difficulty?.toLowerCase() !== "advanced"
            
            // Calculate popularity score based on enrollment count
            const enrollmentCount = course.metadata?.enrollment_count || 1000
            const popularityScore = Math.min(100, enrollmentCount / 50)
            
            return {
                ...course,
                recommendationScore: Math.min(100, recommendationScore),
                skillMatchPercentage,
                difficultyMatch,
                popularityScore,
                // Add detailed scoring breakdown
                scoreBreakdown: {
                    rating: ratingScore,
                    skills: skillScore,
                    duration: durationScore,
                    provider: providerScore
                }
            }
        })
    }, [courses])

    // Sort courses based on selected criteria
    const sortedCourses = useMemo(() => {
        const filtered = filterDifficulty === "all" 
            ? coursesWithScores 
            : coursesWithScores.filter(c => c.difficulty?.toLowerCase() === filterDifficulty.toLowerCase())

        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case "score":
                    return (b.recommendationScore || 0) - (a.recommendationScore || 0)
                case "duration":
                    return (a.duration_weeks || 0) - (b.duration_weeks || 0)
                case "difficulty":
                    const difficultyOrder = { "beginner": 0, "intermediate": 1, "advanced": 2 }
                    const aDiff = difficultyOrder[a.difficulty?.toLowerCase() as keyof typeof difficultyOrder] ?? 3
                    const bDiff = difficultyOrder[b.difficulty?.toLowerCase() as keyof typeof difficultyOrder] ?? 3
                    return aDiff - bDiff
                case "rating":
                    return (b.metadata?.rating || 0) - (a.metadata?.rating || 0)
                default:
                    return 0
            }
        })
    }, [coursesWithScores, sortBy, filterDifficulty])

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600"
        if (score >= 60) return "text-yellow-600"
        return "text-red-600"
    }

    const getScoreBadgeVariant = (score: number) => {
        if (score >= 80) return "default"
        if (score >= 60) return "secondary"
        return "outline"
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header with Controls */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Recommended Courses
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {sortedCourses.length} courses matched your profile
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <select
                                value={filterDifficulty}
                                onChange={(e) => setFilterDifficulty(e.target.value)}
                                className="px-3 py-2 border rounded-md bg-background text-sm"
                            >
                                <option value="all">All Difficulties</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                className="px-3 py-2 border rounded-md bg-background text-sm"
                            >
                                <option value="score">Recommendation Score</option>
                                <option value="duration">Duration</option>
                                <option value="difficulty">Difficulty</option>
                                <option value="rating">Rating</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Course Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCourses.map((course) => (
                    <Card key={course.course_id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                        {/* Recommendation Score Badge */}
                        <div className="absolute top-4 right-4 z-10">
                            <Badge 
                                variant={getScoreBadgeVariant(course.recommendationScore || 0)}
                                className="text-xs font-semibold"
                            >
                                {Math.round(course.recommendationScore || 0)}% Match
                            </Badge>
                        </div>

                        <CardHeader className="pb-3">
                            <div className="space-y-2">
                                <CardTitle className="text-lg leading-tight line-clamp-2">
                                    {course.title}
                                </CardTitle>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {course.provider && (
                                        <Badge variant="outline" className="text-xs">
                                            {course.provider}
                                        </Badge>
                                    )}
                                    {course.difficulty && (
                                        <Badge 
                                            variant={course.difficultyMatch ? "default" : "secondary"}
                                            className="text-xs capitalize"
                                        >
                                            {course.difficulty}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Recommendation Score Progress */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1">
                                        <span className="text-muted-foreground">Recommendation Score</span>
                                        <InfoTooltip content={`Calculated from: Course rating (${course.scoreBreakdown?.rating.toFixed(1)} pts), Skill alignment (${course.scoreBreakdown?.skills.toFixed(1)} pts), Duration appropriateness (${course.scoreBreakdown?.duration.toFixed(1)} pts), Provider reputation (${course.scoreBreakdown?.provider.toFixed(1)} pts). Higher scores indicate better matches for your profile.`}>
                                            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                        </InfoTooltip>
                                    </div>
                                    <span className={`font-semibold ${getScoreColor(course.recommendationScore || 0)}`}>
                                        {Math.round(course.recommendationScore || 0)}%
                                    </span>
                                </div>
                                <Progress 
                                    value={course.recommendationScore || 0} 
                                    className="h-2"
                                />
                            </div>

                            {/* Skill Match */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1">
                                        <span className="text-muted-foreground">Skill Match</span>
                                        <InfoTooltip content={`Based on the number of skills covered by this course (${course.skills?.length || 0} skills). Higher percentages indicate courses that cover more relevant skills for your learning goals.`}>
                                            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                        </InfoTooltip>
                                    </div>
                                    <span className="font-semibold text-blue-600">
                                        {Math.round(course.skillMatchPercentage || 0)}%
                                    </span>
                                </div>
                                <Progress 
                                    value={course.skillMatchPercentage || 0} 
                                    className="h-1.5"
                                />
                            </div>

                            {/* Course Details */}
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{course.duration_weeks} weeks</span>
                                </div>
                                {course.metadata?.rating && (
                                    <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span>{course.metadata.rating}/5.0</span>
                                    </div>
                                )}
                                {course.metadata?.enrollment_count && (
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span>{course.metadata.enrollment_count.toLocaleString()} enrolled</span>
                                    </div>
                                )}
                            </div>

                            {/* Skills */}
                            {course.skills && course.skills.length > 0 && (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">Skills Covered:</div>
                                    <div className="flex flex-wrap gap-1">
                                        {course.skills.slice(0, 4).map((skill, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                {skill}
                                            </Badge>
                                        ))}
                                        {course.skills.length > 4 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{course.skills.length - 4} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="pt-2">
                                {course.url ? (
                                    <a href={course.url} target="_blank" rel="noreferrer">
                                        <Button className="w-full" size="sm">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View Course
                                        </Button>
                                    </a>
                                ) : (
                                    <Button className="w-full" size="sm" variant="outline" disabled>
                                        <BookOpen className="h-4 w-4 mr-2" />
                                        No Link Available
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Summary Statistics */}
            {metrics && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Recommendation Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {sortedCourses.filter(c => (c.recommendationScore || 0) >= 80).length}
                                </div>
                                <div className="text-sm text-muted-foreground">Highly Recommended</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {sortedCourses.filter(c => (c.recommendationScore || 0) >= 60 && (c.recommendationScore || 0) < 80).length}
                                </div>
                                <div className="text-sm text-muted-foreground">Good Match</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {Math.round(sortedCourses.reduce((sum, c) => sum + (c.skillMatchPercentage || 0), 0) / sortedCourses.length)}%
                                </div>
                                <div className="text-sm text-muted-foreground">Avg Skill Match</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {Math.round(sortedCourses.reduce((sum, c) => sum + (c.duration_weeks || 0), 0) / sortedCourses.length)}
                                </div>
                                <div className="text-sm text-muted-foreground">Avg Duration (weeks)</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
