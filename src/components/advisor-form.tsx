"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserProfile } from "@/lib/api"

interface AdvisorFormProps {
  onSubmit: (profile: UserProfile) => void
  isLoading: boolean
}

export function AdvisorForm({ onSubmit, isLoading }: AdvisorFormProps) {
  const [skills, setSkills] = useState("")
  const [years, setYears] = useState("")
  const [goalRole, setGoalRole] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Parse skills from comma-separated string
    const skillsArray = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0)

    const profile: UserProfile = {
      skills: skillsArray,
      years: Number.parseInt(years, 10) || 0,
      goal_role: goalRole.trim(),
    }

    onSubmit(profile)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upskill Advisor</CardTitle>
        <CardDescription>
          Get personalized learning recommendations based on your current skills and career goals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skills">Current Skills</Label>
            <Input
              id="skills"
              type="text"
              placeholder="e.g., Python, SQL, JavaScript"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">Enter your skills separated by commas</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="years">Years of Experience</Label>
            <Input
              id="years"
              type="number"
              min="0"
              max="50"
              placeholder="e.g., 2"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goalRole">Goal Role</Label>
            <Input
              id="goalRole"
              type="text"
              placeholder="e.g., Data Scientist"
              value={goalRole}
              onChange={(e) => setGoalRole(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Getting Advice..." : "Get Learning Plan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
