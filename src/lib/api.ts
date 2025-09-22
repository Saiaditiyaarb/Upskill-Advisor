import axios from "axios"

// Initialize axios instance with base URL
const apiClient = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
})

// Types for the API request and response
export interface UserProfile {
  skills: string[]
  years: number
  goal_role: string
}

export interface UserContext {
  session_id: string
}

export interface AdviceRequest {
  profile: UserProfile
  user_context: UserContext
}

export interface CoursePlan {
  course_id: string
  why: string
}

export interface AdviceData {
  plan: CoursePlan[]
  gap_map: Record<string, number>
  timeline: {
    weeks: number
  }
  notes: string
}

export interface ApiResponse {
  request_id: string
  status: string
  data: AdviceData
}

/**
 * Centralized API service for getting advice from the backend
 * This function handles the wrapped response structure and provides
 * a clean interface for components to use
 */
export async function getAdvice(profile: UserProfile): Promise<AdviceData> {
  try {
    const requestPayload: AdviceRequest = {
      profile,
      user_context: {
        session_id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
    }

    const response = await apiClient.post<ApiResponse>("/advise", requestPayload)

    // Handle the wrapped response structure
    if (response.data.status === "success") {
      return response.data.data
    } else {
      throw new Error(`API returned status: ${response.data.status}`)
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`API Error: ${error.response?.data?.message || error.message}`)
    }
    throw error
  }
}
