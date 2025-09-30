import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, Plus, X, Clock, Target } from "lucide-react";
import type { UserProfile } from "@/lib/api";

interface AdvisorFormProps {
    onSubmit: (profile: UserProfile) => void;
    isLoading: boolean;
}

interface SkillInput {
    name: string;
    expertise: "Beginner" | "Intermediate" | "Advanced";
}

export function AdvisorForm({ onSubmit, isLoading }: AdvisorFormProps) {
    const [skills, setSkills] = useState<SkillInput[]>([]);
    const [newSkill, setNewSkill] = useState("");
    const [newSkillExpertise, setNewSkillExpertise] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
    const [years, setYears] = useState("");
    const [goalRole, setGoalRole] = useState("");
    const [searchOnline, setSearchOnline] = useState(false) // Default to offline mode for better performance;
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [popularSkills, setPopularSkills] = useState<string[]>([]);
    const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

    const addSkill = () => {
        if (newSkill.trim() && !skills.find(s => s.name.toLowerCase() === newSkill.toLowerCase())) {
            setSkills([...skills, { name: newSkill.trim(), expertise: newSkillExpertise }]);
            setNewSkill("");
        }
    };

    const removeSkill = (index: number) => {
        setSkills(skills.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const profile: UserProfile = {
            skills: skills.map(skill => ({
                name: skill.name,
                expertise: skill.expertise,
            })),
            years: Number.parseInt(years, 10) || 0,
            goal_role: goalRole.trim(),
            search_online: searchOnline,
        };

        onSubmit(profile);
    };

    // Fetch popular skills on mount
    useEffect(() => {
        const fetchPopularSkills = async () => {
            try {
                const response = await fetch("/api/v1/courses/skills?limit=100");
                if (response.ok) {
                    const result = await response.json();
                    if (result.data && result.data.skills) {
                        const skillNames = result.data.skills.map((s: any) => s.skill);
                        setPopularSkills(skillNames);
                    }
                }
            } catch (error) {
                console.warn("Failed to fetch skill suggestions:", error);
            }
        };
        fetchPopularSkills();
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    // Handle skill input change with suggestions
    const handleSkillInputChange = (value: string) => {
        setNewSkill(value);
        if (value.length > 1 && popularSkills.length > 0) {
            const filtered = popularSkills.filter(skill => 
                skill.toLowerCase().includes(value.toLowerCase()) &&
                !skills.find(s => s.name.toLowerCase() === skill.toLowerCase())
            ).slice(0, 10);
            setFilteredSuggestions(filtered);
            setShowSkillSuggestions(filtered.length > 0);
        } else {
            setShowSkillSuggestions(false);
        }
    };

    // Add skill from suggestion
    const addSkillFromSuggestion = (skillName: string) => {
        if (!skills.find(s => s.name.toLowerCase() === skillName.toLowerCase())) {
            setSkills([...skills, { name: skillName, expertise: newSkillExpertise }]);
            setNewSkill("");
            setShowSkillSuggestions(false);
        }
    };

    const getExpertiseColor = (expertise: string) => {
        switch (expertise) {
            case "Beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "Intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            case "Advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
        }
    };

    return (
        <div className="fixed inset-0 w-full h-full flex overflow-hidden">
            {/* Left Side - Hero Section */}
            <div
                className={`w-1/2 flex items-center justify-center p-8 transition-colors duration-300 ${
                    isDarkMode ? 'bg-white text-black' : 'bg-black text-white'
                }`}
            >
                <div className="text-center max-w-md">
                    <div className="mb-8">
                        <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
                            isDarkMode ? 'bg-black text-white' : 'bg-white text-black'
                        }`}>
                            <Target className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">Upskill Advisor</h1>
                        <p className="text-xl opacity-90 leading-relaxed">
                            Get personalized learning recommendations to advance your career
                        </p>
                    </div>

                    <div className="space-y-4 opacity-75">
                        <div className="flex items-center justify-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-black' : 'bg-white'}`}></div>
                            <span className="text-sm">AI-powered recommendations</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-black' : 'bg-white'}`}></div>
                            <span className="text-sm">Personalized learning paths</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-black' : 'bg-white'}`}></div>
                            <span className="text-sm">Career-focused curriculum</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-black' : 'bg-white'}`}></div>
                            <span className="text-sm">Real-time performance metrics</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form Section */}
            <div
                className={`w-1/2 flex flex-col transition-colors duration-300 ${
                    isDarkMode ? 'bg-black text-white' : 'bg-white text-black'
                }`}
            >
                {/* Theme Toggle */}
                <div className="flex justify-end p-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleTheme}
                        className={`rounded-full p-2 transition-colors ${
                            isDarkMode
                                ? 'hover:bg-gray-800 text-white'
                                : 'hover:bg-gray-100 text-black'
                        }`}
                    >
                        {isDarkMode ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </Button>
                </div>

                {/* Form Container */}
                <div className="flex-1 flex items-center justify-center p-8 pt-0">
                    <Card className={`w-full max-w-md border transition-colors ${
                        isDarkMode
                            ? 'bg-black border-gray-800 text-white'
                            : 'bg-white border-gray-200 text-black'
                    }`}>
                        <CardHeader>
                            <CardTitle className={isDarkMode ? 'text-white' : 'text-black'}>
                                Get Started
                            </CardTitle>
                            <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                Tell us about your background and career goals to receive tailored recommendations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6" aria-busy={isLoading}>
                                {/* Skills Section */}
                                <div className="space-y-3">
                                    <Label
                                        htmlFor="skills"
                                        className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}
                                    >
                                        Current Skills
                                    </Label>
                                    
                                    {/* Add Skill Input */}
                                    <div className="flex gap-2 relative">
                                        <div className="flex-1 relative">
                                            <Input
                                                id="new-skill"
                                                type="text"
                                                placeholder="e.g., Python, SQL, JavaScript"
                                                value={newSkill}
                                                onChange={(e) => handleSkillInputChange(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addSkill();
                                                    }
                                                }}
                                                className="flex-1"
                                            />
                                            {/* Skill Suggestions Dropdown */}
                                            {showSkillSuggestions && filteredSuggestions.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                    {filteredSuggestions.map((skill, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => addSkillFromSuggestion(skill)}
                                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-black"
                                                        >
                                                            {skill}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <select
                                            value={newSkillExpertise}
                                            onChange={(e) => setNewSkillExpertise(e.target.value as "Beginner" | "Intermediate" | "Advanced")}
                                            className="px-3 py-2 border rounded-md text-sm bg-white text-black"
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                        <Button
                                            type="button"
                                            onClick={addSkill}
                                            size="sm"
                                            variant="outline"
                                            disabled={!newSkill.trim()}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Skills List */}
                                    {skills.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">Your Skills:</div>
                                            <div className="flex flex-wrap gap-2">
                                                {skills.map((skill, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="secondary"
                                                        className={`${getExpertiseColor(skill.expertise)} flex items-center gap-1`}
                                                    >
                                                        {skill.name}
                                                        <span className="text-xs">({skill.expertise})</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSkill(index)}
                                                            className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Years of Experience */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="years"
                                        className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}
                                    >
                                        Years of Experience
                                    </Label>
                                    <Input
                                        id="years"
                                        type="number"
                                        placeholder="e.g., 5"
                                        value={years}
                                        onChange={(e) => setYears(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Goal Role */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="goal_role"
                                        className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}
                                    >
                                        Goal Role
                                    </Label>
                                    <Input
                                        id="goal_role"
                                        type="text"
                                        placeholder="e.g., Senior Data Scientist"
                                        value={goalRole}
                                        onChange={(e) => setGoalRole(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Search Online Option */}
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="search_online"
                                            checked={searchOnline}
                                            onChange={(e) => setSearchOnline(e.target.checked)}
                                            className="rounded"
                                        />
                                        <Label htmlFor="search_online" className="text-sm">
                                            Include online course search for latest recommendations
                                        </Label>
                                    </div>
                                    <div className="text-xs text-muted-foreground pl-6">
                                        {searchOnline 
                                            ? "Online mode: Slower but includes latest courses from the web" 
                                            : "Offline mode: Faster response using local LLM and cached courses"
                                        }
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button 
                                    type="submit" 
                                    disabled={isLoading || skills.length === 0} 
                                    className="w-full"
                                >
                                    {isLoading ? (
                                        <>
                                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                                            Analyzing your profile...
                                        </>
                                    ) : (
                                        <>
                                            <Target className="h-4 w-4 mr-2" />
                                            Get Personalized Recommendations
                                        </>
                                    )}
                                </Button>

                                {/* Form Validation Messages */}
                                {skills.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center">
                                        Please add at least one skill to get recommendations
                                    </p>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}