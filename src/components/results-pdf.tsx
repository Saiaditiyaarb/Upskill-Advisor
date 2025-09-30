import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer"
import type { AdviceData } from "@/lib/api"

interface ResultsPDFProps {
    data: AdviceData
    sortedCourses: any[]
}

// Clean, professional PDF design - Essential Information Only
const styles = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        fontSize: 10,
        padding: 30,
        backgroundColor: "#ffffff",
        lineHeight: 1.4,
        color: "#000000",
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 8,
        textAlign: "center",
        color: "#000000",
    },
    subheader: {
        fontSize: 10,
        marginBottom: 20,
        textAlign: "center",
        color: "#666666",
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 15,
        marginBottom: 10,
        borderBottom: "2px solid #000000",
        paddingBottom: 5,
        color: "#000000",
    },
    planItem: {
        marginBottom: 12,
        padding: 10,
        backgroundColor: "#f9f9f9",
        border: "1px solid #e0e0e0",
    },
    planTitle: {
        fontSize: 11,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#000000",
    },
    planDescription: {
        fontSize: 9,
        color: "#333333",
        marginBottom: 4,
        lineHeight: 1.3,
    },
    badge: {
        backgroundColor: "#000000",
        color: "#ffffff",
        padding: "2px 8px",
        marginRight: 6,
        marginBottom: 4,
        fontSize: 8,
        fontWeight: "bold",
    },
    courseCard: {
        marginBottom: 12,
        padding: 10,
        border: "1px solid #000000",
        backgroundColor: "#ffffff",
    },
    courseTitle: {
        fontSize: 11,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#000000",
    },
    courseDetails: {
        fontSize: 9,
        color: "#333333",
        marginBottom: 3,
    },
    skillBadge: {
        backgroundColor: "#666666",
        color: "#ffffff",
        padding: "1px 5px",
        marginRight: 4,
        marginBottom: 3,
        fontSize: 7,
    },
    flexRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        marginBottom: 5,
    },
    gapSection: {
        marginBottom: 10,
        padding: 8,
        backgroundColor: "#f5f5f5",
        border: "1px solid #d0d0d0",
    },
    gapTitle: {
        fontSize: 10,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#000000",
    },
    gapItem: {
        fontSize: 9,
        color: "#333333",
        marginLeft: 10,
        marginBottom: 2,
    },
    footer: {
        position: "absolute",
        bottom: 20,
        left: 30,
        right: 30,
        textAlign: "center",
        fontSize: 8,
        color: "#666666",
        borderTop: "1px solid #cccccc",
        paddingTop: 8,
    },
    timeline: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 15,
        padding: 8,
        backgroundColor: "#f0f0f0",
        textAlign: "center",
    },
    noteBox: {
        padding: 10,
        backgroundColor: "#f9f9f9",
        border: "1px solid #e0e0e0",
        fontSize: 9,
        lineHeight: 1.4,
    },
})

export function ResultsPDF({ data, sortedCourses }: ResultsPDFProps) {
    const hasTimeline = !!(data as any)?.timeline?.total_weeks
    const gapEntries = Object.entries(data.gap_map || {})
    const timelineData = (data as any)?.timeline

    return (
        <Document>
            <Page style={styles.page}>
                <View>
                    {/* Header */}
                    <Text style={styles.header}>Your Personalized Learning Plan</Text>
                    <Text style={styles.subheader}>
                        Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Text>

                    {/* Timeline Overview */}
                    {hasTimeline && (
                        <Text style={styles.timeline}>
                            Estimated Duration: {timelineData.total_weeks} weeks
                        </Text>
                    )}

                    {/* Learning Path */}
                    <Text style={styles.sectionTitle}>📚 Your Learning Path</Text>
                    {data.plan && data.plan.length > 0 ? (
                        data.plan.map((step: any, index: number) => {
                            const course = sortedCourses.find(c => c.course_id === step.course_id)
                            return (
                                <View key={index} style={styles.planItem}>
                                    <View style={styles.flexRow}>
                                        <Text style={styles.badge}>STEP {index + 1}</Text>
                                        {step.estimated_weeks && (
                                            <Text style={styles.badge}>{step.estimated_weeks} WEEKS</Text>
                                        )}
                                    </View>
                                    <Text style={styles.planTitle}>
                                        {course?.title || step.resource || step.skill || "Learning Step"}
                                    </Text>
                                    {step.why && (
                                        <Text style={styles.planDescription}>{step.why}</Text>
                                    )}
                                    {course && (
                                        <>
                                            {course.provider && (
                                                <Text style={styles.courseDetails}>Provider: {course.provider}</Text>
                                            )}
                                            {course.difficulty && (
                                                <Text style={styles.courseDetails}>Difficulty: {course.difficulty}</Text>
                                            )}
                                            {course.url && (
                                                <Link src={course.url} style={styles.courseDetails}>
                                                    🔗 {course.url}
                                                </Link>
                                            )}
                                        </>
                                    )}
                                </View>
                            )
                        })
                    ) : (
                        <Text style={styles.planDescription}>No learning plan available</Text>
                    )}

                    {/* Skill Gaps */}
                    {gapEntries.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>🎯 Skills to Develop</Text>
                            {gapEntries.map(([category, skills]) => (
                                <View key={category} style={styles.gapSection}>
                                    <Text style={styles.gapTitle}>{category}</Text>
                                    {Array.isArray(skills) ? (
                                        skills.slice(0, 8).map((skill: string, i: number) => (
                                            <Text key={i} style={styles.gapItem}>• {skill}</Text>
                                        ))
                                    ) : (
                                        <Text style={styles.gapItem}>{String(skills)}</Text>
                                    )}
                                </View>
                            ))}
                        </>
                    )}

                    {/* Recommended Courses */}
                    {sortedCourses && sortedCourses.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>🌟 Top Recommended Courses</Text>
                            {sortedCourses.map((course: any, i: number) => (
                                <View key={i} style={styles.courseCard}>
                                    <Text style={styles.courseTitle}>{course.title}</Text>
                                    <View style={styles.flexRow}>
                                        {course.provider && <Text style={styles.badge}>{course.provider}</Text>}
                                        {course.difficulty && <Text style={styles.badge}>{course.difficulty.toUpperCase()}</Text>}
                                        {course.duration_weeks && <Text style={styles.badge}>{course.duration_weeks} WEEKS</Text>}
                                    </View>
                                    {course.skills && course.skills.length > 0 && (
                                        <View style={styles.flexRow}>
                                            <Text style={styles.courseDetails}>Skills: </Text>
                                            {course.skills.slice(0, 5).map((skill: string, idx: number) => (
                                                <Text key={idx} style={styles.skillBadge}>{skill}</Text>
                                            ))}
                                        </View>
                                    )}
                                    {course.metadata?.rating && (
                                        <Text style={styles.courseDetails}>⭐ Rating: {course.metadata.rating}</Text>
                                    )}
                                    {course.url && (
                                        <Link src={course.url} style={styles.courseDetails}>
                                            🔗 View Course
                                        </Link>
                                    )}
                                </View>
                            ))}
                        </>
                    )}

                    {/* Additional Notes */}
                    {data.notes && (
                        <>
                            <Text style={styles.sectionTitle}>💡 Additional Insights</Text>
                            <View style={styles.noteBox}>
                                <Text>{data.notes}</Text>
                            </View>
                        </>
                    )}

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text>Generated by Upskill Advisor • Your AI-Powered Learning Companion</Text>
                        <Text style={{ marginTop: 3 }}>Continue learning and growing your skills! 🚀</Text>
                    </View>
                </View>
            </Page>
        </Document>
    )
}
