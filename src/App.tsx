"use client"

import { useState } from "react"
import { AdvisorForm } from "@/components/advisor-form"
import { ResultsDisplay } from "@/components/results-display"
import { getAdvice, type UserProfile, type AdviceData } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function Home() {
    const [isLoading, setIsLoading] = useState(false)
    const [results, setResults] = useState<AdviceData | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleFormSubmit = async (profile: UserProfile) => {
        setIsLoading(true)
        setError(null)
        setResults(null)

        try {
            const adviceData = await getAdvice(profile)
            setResults(adviceData)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleReset = () => {
        setResults(null)
        setError(null)
    }

    return (
        <main className="min-h-screen bg-background p-4">
            <div className="container mx-auto py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">Upskill Advisor MVP</h1>
                    <p className="text-muted-foreground text-lg">
                        Get personalized learning recommendations to advance your career
                    </p>
                </div>

                {error && (
                    <div className="mb-6">
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </div>
                )}

                {!results ? (
                    <AdvisorForm onSubmit={handleFormSubmit} isLoading={isLoading} />
                ) : (
                    <div className="space-y-6">
                        <div className="text-center">
                            <Button onClick={handleReset} variant="outline">
                                Get New Recommendations
                            </Button>
                        </div>
                        <ResultsDisplay data={results} />
                    </div>
                )}
            </div>
        </main>
    )
}
