export interface SkillDetail {
    name: string;
    expertise: "Beginner" | "Intermediate" | "Advanced";
}

export interface UserProfile {
    skills: SkillDetail[];
    years: number;
    goal_role: string;
    search_online: boolean;
}

export interface AdviseResult {
    plan: Array<{
        course_id?: string;
        skill?: string;
        action?: string;
        resource?: string;
        why?: string;
        order?: number;
        estimated_weeks?: number;
    }>;
    gap_map: Record<string, string[]>;
    recommended_courses: Course[];
    notes?: string;
    metrics?: {
        processing_time_ms?: number;
        skill_map?: {
            covered_skills: string[];
            missing_skills: string[];
            coverage_percentage: number;
            skill_courses: Record<string, Array<{id: string, title: string, difficulty: string}>>;
            total_skills_available: number;
        };
        recommendation_scores?: Array<{
            course: Course;
            total_score: number;
            skill_match_score: number;
            difficulty_score: number;
            duration_score: number;
            provider_score: number;
            rating_score: number;
            explanations: string[];
            skill_match_percentage: number;
        }>;
        timeline?: {
            total_weeks: number;
            phases: Array<{
                phase: string;
                weeks: string;
                focus: string;
                course_id?: string;
                difficulty?: string;
            }>;
            milestones: Array<{
                week: number;
                description: string;
                phase: string;
            }>;
            estimated_completion_date: string;
        };
        performance_target_met?: boolean;
        courses_analyzed?: number;
        courses_selected?: number;
    };
    alternative_plan?: AdviseResult;
    timeline?: {
        total_weeks: number;
        phases?: Array<{
            phase: string;
            weeks: string;
            focus: string;
            course_id?: string;
            difficulty?: string;
        }>;
        milestones?: Array<{
            week: number;
            description: string;
            phase: string;
        }>;
        estimated_completion_date?: string;
    };
}

// Alias for backward compatibility
export type AdviceData = AdviseResult;

export interface Course {
    course_id: string;
    title: string;
    skills: string[];
    difficulty: string;
    duration_weeks: number;
    provider?: string;
    url?: string;
    metadata: Record<string, any>;
}

export interface ApiResponse<T> {
    request_id: string;
    status: string;
    data: T;
}

export interface MetricsData {
    accuracy: Array<{
        timestamp: string;
        component: string;
        operation: string;
        accuracy_score: number;
        total_items: number;
        correct_items: number;
        metadata: Record<string, any>;
    }>;
    latency: Array<{
        timestamp: string;
        component: string;
        operation: string;
        duration_ms: number;
        success: boolean;
        metadata: Record<string, any>;
    }>;
    cost: Array<{
        timestamp: string;
        component: string;
        operation: string;
        cost_usd: number;
        tokens_used?: number;
        model_name?: string;
        metadata: Record<string, any>;
    }>;
}

// Updated interface to match backend response format
export interface MetricsReportsResponse {
    accuracy?: Array<{
        timestamp: string;
        request_id: string;
        component: string;
        operation: string;
        accuracy_score: number;
        total_items: number;
        correct_items: number;
        metadata: Record<string, any>;
    }>;
    latency?: Array<{
        timestamp: string;
        request_id: string;
        component: string;
        operation: string;
        duration_ms: number;
        success: boolean;
        metadata: Record<string, any>;
    }>;
    cost?: Array<{
        timestamp: string;
        request_id: string;
        component: string;
        operation: string;
        cost_usd: number;
        tokens_used?: number;
        model_name?: string;
        metadata: Record<string, any>;
    }>;
}

export interface CourseStats {
    total_courses: number;
    providers: Record<string, number>;
    difficulties: Record<string, number>;
    categories: Record<string, number>;
    top_skills: Record<string, number>;
}

// Enhanced API functions
export async function getAdvice(profile: UserProfile): Promise<AdviseResult> {
    const response = await fetch("/api/v1/advise", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            profile: {
                current_skills: profile.skills,
                goal_role: profile.goal_role,
                years_experience: profile.years,
            },
            user_context: {},
            search_online: profile.search_online,
            retrieval_mode: "hybrid",
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch advice");
    }

    const result: ApiResponse<AdviseResult> = await response.json();
    return result.data;
}

export async function getAdviceCompare(profile: UserProfile): Promise<AdviseResult[]> {
    const response = await fetch("/api/v1/advise/compare", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            profile: {
                current_skills: profile.skills,
                goal_role: profile.goal_role,
                years_experience: profile.years,
            },
            user_context: {},
            search_online: profile.search_online,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch advice comparison");
    }

    const result: ApiResponse<AdviseResult[]> = await response.json();
    return result.data;
}

export async function getMetrics(): Promise<MetricsData> {
    const response = await fetch("/api/v1/metrics/reports");
    
    if (!response.ok) {
        throw new Error("Failed to fetch metrics");
    }

    const result: ApiResponse<MetricsReportsResponse> = await response.json();
    
    // Transform the response to match our expected format
    const metricsData: MetricsData = {
        accuracy: result.data.accuracy || [],
        latency: result.data.latency || [],
        cost: result.data.cost || []
    };
    
    return metricsData;
}

export async function getCourseStats(): Promise<CourseStats> {
    const response = await fetch("/api/v1/courses/stats");
    
    if (!response.ok) {
        throw new Error("Failed to fetch course statistics");
    }

    const result: ApiResponse<CourseStats> = await response.json();
    return result.data;
}

export async function searchCourses(query: string, filters?: {
    providers?: string[];
    difficulties?: string[];
    skills?: string[];
    categories?: string[];
    is_free?: boolean;
}): Promise<{ courses: Course[]; pagination: any }> {
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (filters?.providers) filters.providers.forEach(p => params.append("providers", p));
    if (filters?.difficulties) filters.difficulties.forEach(d => params.append("difficulties", d));
    if (filters?.skills) filters.skills.forEach(s => params.append("skills", s));
    if (filters?.categories) filters.categories.forEach(c => params.append("categories", c));
    if (filters?.is_free !== undefined) params.append("is_free", filters.is_free.toString());

    const response = await fetch(`/api/v1/courses/search?${params.toString()}`);
    
    if (!response.ok) {
        throw new Error("Failed to search courses");
    }

    const result: ApiResponse<{ courses: Course[]; pagination: any }> = await response.json();
    return result.data;
}