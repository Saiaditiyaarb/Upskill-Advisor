"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Target, 
    Clock,
    BookOpen, 
    CheckCircle, 
    Circle, 
    Info,
    MapPin,
    Calendar,
    Award
} from "lucide-react"
import type { Course } from "@/lib/api"

interface SkillMapProps {
    skillMap?: {
        covered_skills: string[]
        missing_skills: string[]
        coverage_percentage: number
        skill_courses: Record<string, Array<{id: string, title: string, difficulty: string}>>
        total_skills_available: number
    }
    timeline?: {
        total_weeks: number
        phases: Array<{
            phase: string
            weeks: string
            focus: string
            course_id?: string
            difficulty?: string
        }>
        milestones: Array<{
            week: number
            description: string
            phase: string
        }>
        estimated_completion_date: string
    }
    courses: Course[]
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

export function SkillMap({ skillMap, timeline, courses, className }: SkillMapProps) {
    const skillProgress = useMemo(() => {
        if (!skillMap) return null
        
        const totalSkills = skillMap.covered_skills.length + skillMap.missing_skills.length
        return {
            covered: skillMap.covered_skills.length,
            missing: skillMap.missing_skills.length,
            total: totalSkills,
            percentage: skillMap.coverage_percentage
        }
    }, [skillMap])

    const timelineData = useMemo(() => {
        if (!timeline) return null
        
        return {
            phases: timeline.phases || [],
            milestones: timeline.milestones || [],
            totalWeeks: timeline.total_weeks || 0,
            completionDate: timeline.estimated_completion_date || "TBD"
        }
    }, [timeline])

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty?.toLowerCase()) {
            case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            case "advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
        }
    }

    const getPhaseColor = (index: number) => {
        const colors = [
            "bg-blue-500",
            "bg-green-500", 
            "bg-purple-500",
            "bg-orange-500",
            "bg-pink-500"
        ]
        return colors[index % colors.length]
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Skill Coverage Overview */}
            {skillProgress && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Skill Coverage Analysis
                            <InfoTooltip content="Shows how many target skills are covered by the recommended courses. Higher coverage means better alignment with your career goals.">
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </InfoTooltip>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Skill Coverage</span>
                                    <span className="font-semibold">{skillProgress.percentage.toFixed(1)}%</span>
                                </div>
                                <Progress value={skillProgress.percentage} className="h-3" />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{skillProgress.covered} skills covered</span>
                                    <span>{skillProgress.missing} skills missing</span>
                                </div>
                            </div>

                            {/* Skills Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Covered Skills */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium">Covered Skills</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {skillMap?.covered_skills.slice(0, 8).map((skill, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                {skill}
                                            </Badge>
                                        ))}
                                        {skillMap && skillMap.covered_skills.length > 8 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{skillMap.covered_skills.length - 8} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Missing Skills */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Circle className="h-4 w-4 text-orange-600" />
                                        <span className="text-sm font-medium">Missing Skills</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {skillMap?.missing_skills.slice(0, 8).map((skill, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs">
                                                {skill}
                                            </Badge>
                                        ))}
                                        {skillMap && skillMap.missing_skills.length > 8 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{skillMap.missing_skills.length - 8} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Learning Timeline */}
            {timelineData && timelineData.phases.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Learning Timeline
                            <InfoTooltip content="Shows your personalized learning journey with phases, milestones, and estimated completion time. Each phase builds upon the previous one.">
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </InfoTooltip>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Timeline Overview */}
                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium">Total Duration</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">{timelineData.totalWeeks} weeks</div>
                                    <div className="text-sm text-muted-foreground">{timelineData.completionDate}</div>
                                </div>
                            </div>

                            {/* Phase Timeline */}
                            <div className="relative">
                                {/* Timeline Line */}
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
                                
                                {timelineData.phases.map((phase, index) => (
                                    <div key={index} className="relative flex items-start gap-4 pb-6">
                                        {/* Phase Circle */}
                                        <div className={`relative z-10 w-8 h-8 rounded-full ${getPhaseColor(index)} flex items-center justify-center text-white text-xs font-bold`}>
                                            {index + 1}
                                        </div>
                                        
                                        {/* Phase Content */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold">{phase.phase}</h3>
                                                <Badge variant="outline" className="text-xs">
                                                    {phase.weeks}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{phase.focus}</p>
                                            
                                            {/* Course Details */}
                                            {phase.course_id && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <BookOpen className="h-3 w-3" />
                                                    <span>Course: {courses.find(c => c.course_id === phase.course_id)?.title || phase.course_id}</span>
                                                    {phase.difficulty && (
                                                        <Badge className={`text-xs ${getDifficultyColor(phase.difficulty)}`}>
                                                            {phase.difficulty}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Milestones */}
                            {timelineData.milestones.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Award className="h-4 w-4" />
                                        Key Milestones
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {timelineData.milestones.map((milestone, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                                    {milestone.week}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm">Week {milestone.week}</div>
                                                    <div className="text-xs text-muted-foreground">{milestone.description}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Skill-Course Mapping */}
            {skillMap && Object.keys(skillMap.skill_courses).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Skill-Course Mapping
                            <InfoTooltip content="Shows which courses cover specific skills. This helps you understand how each course contributes to your skill development.">
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </InfoTooltip>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(skillMap.skill_courses).slice(0, 10).map(([skill, courseList]) => (
                                <div key={skill} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium capitalize">{skill}</h4>
                                        <Badge variant="secondary" className="text-xs">
                                            {courseList.length} course{courseList.length !== 1 ? 's' : ''}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {courseList.slice(0, 3).map((course, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                <BookOpen className="h-3 w-3 text-muted-foreground" />
                                                <span className="flex-1">{course.title}</span>
                                                <Badge className={`text-xs ${getDifficultyColor(course.difficulty)}`}>
                                                    {course.difficulty}
                                                </Badge>
                                            </div>
                                        ))}
                                        {courseList.length > 3 && (
                                            <div className="text-xs text-muted-foreground">
                                                +{courseList.length - 3} more courses
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
