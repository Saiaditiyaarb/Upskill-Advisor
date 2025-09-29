import axios from "axios"

// Determine base URL from environment or fall back to dev proxy path
const RAW_BASE = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined
const BASE_URL = (RAW_BASE ? RAW_BASE.replace(/\/$/, "") : "/api/v1")

// Initialize axios instance with base URL
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Types used by UI form (frontend-only)
export interface UserProfile {
  skills: string[]
  years: number
  goal_role: string
  // Whether to include online course search (mirrors backend AdviseRequest.search_online)
  search_online?: boolean
}

// Backend-aligned types
type Expertise = "Beginner" | "Intermediate" | "Advanced"
interface SkillDetail { name: string; expertise: Expertise }
interface BackendUserProfile {
  current_skills: SkillDetail[]
  goal_role: string
  years_experience?: number
}

export interface UserContext { session_id: string }

interface AdviceRequest {
  profile: BackendUserProfile
  user_context?: UserContext
  search_online?: boolean
}

export interface CoursePlanStep {
  // Backend returns a flexible dict; keep permissive typing
  course_id?: string
  why?: string
  [key: string]: any
}

export interface AdviceData {
  plan: CoursePlanStep[]
  gap_map: Record<string, any>
  recommended_courses?: any[]
  notes?: string
  // tolerate older/newer fields
  [key: string]: any
}

export interface ApiEnvelope<T = any> {
  request_id: string
  status: string
  data: T
}

function toBackendProfile(profile: UserProfile): BackendUserProfile {
  const current_skills: SkillDetail[] = (profile.skills || [])
    .filter(Boolean)
    .map((name) => ({ name, expertise: "Beginner" as Expertise }))
  return {
    current_skills,
    goal_role: profile.goal_role,
    years_experience: typeof profile.years === "number" ? profile.years : undefined,
  }
}

/**
 * Centralized API service for getting advice from the backend
 * Handles the wrapped response structure and maps UI profile to backend schema
 */
export async function getAdvice(profile: UserProfile): Promise<AdviceData> {
  try {
    const requestPayload: AdviceRequest = {
      profile: toBackendProfile(profile),
      user_context: {
        session_id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      },
      search_online: profile.search_online ?? true,
    }

    const response = await apiClient.post("/advise", requestPayload)

    const raw = response.data

    // Support both raw and wrapped API responses
    if (raw && typeof raw === "object") {
      if ("plan" in raw && "gap_map" in raw) {
        return raw as AdviceData
      }
      if ("data" in raw) {
        const env = raw as ApiEnvelope<AdviceData>
        if (env.status?.toLowerCase?.() === "ok" && env.data) return env.data
        if (env.data) return env.data
      }
    }

    throw new Error("Unexpected API response shape")
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const msg = (error.response?.data?.detail || error.response?.data?.message || error.message)
      throw new Error(`API Error: ${msg}`)
    }
    throw error
  }
}
