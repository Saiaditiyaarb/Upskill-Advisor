import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer"
import type { AdviceData } from "@/lib/api"

interface ResultsPDFProps {
    data: AdviceData
    sortedCourses: any[] // Using any[] to match the structure in ResultsDisplay
}

// Define styles for the PDF - Professional Black & White Design
const styles = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        fontSize: 10,
        padding: 20,
        backgroundColor: "#ffffff",
        lineHeight: 1.3,
        color: "#000000",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color: "#000000",
        borderBottom: "1px solid #000000",
        paddingBottom: 8,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 6,
        color: "#000000",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    section: {
        marginBottom: 15,
        border: "1px solid #000000",
        padding: 12,
        backgroundColor: "#ffffff",
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "bold",
        marginBottom: 8,
        borderBottom: "1px solid #000000",
        paddingBottom: 4,
        color: "#000000",
    },
    subsection: {
        marginBottom: 8,
        padding: 6,
        backgroundColor: "#ffffff",
        border: "1px solid #cccccc",
    },
    subsectionTitle: {
        fontSize: 11,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#000000",
    },
    text: {
        marginBottom: 4,
        color: "#000000",
        lineHeight: 1.2,
        fontSize: 9,
    },
    badge: {
        backgroundColor: "#000000",
        color: "#ffffff",
        padding: "2px 6px",
        marginRight: 4,
        marginBottom: 2,
        fontSize: 8,
        fontWeight: "bold",
    },
    skillBadge: {
        backgroundColor: "#666666",
        color: "#ffffff",
        padding: "1px 4px",
        marginRight: 3,
        marginBottom: 2,
        fontSize: 7,
    },
    flexRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        marginBottom: 4,
    },
    capitalize: {
        textTransform: "capitalize",
    },
    link: {
        color: "#000000",
        textDecoration: "underline",
        fontSize: 8,
    },
    courseGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    courseCard: {
        width: "48%",
        border: "1px solid #000000",
        padding: 8,
        marginBottom: 8,
        backgroundColor: "#ffffff",
    },
    timelineBox: {
        backgroundColor: "#ffffff",
        border: "1px solid #000000",
        padding: 8,
        marginBottom: 10,
    },
    metricsBox: {
        backgroundColor: "#ffffff",
        border: "1px solid #000000",
        padding: 8,
        marginBottom: 10,
    },
    footer: {
        position: "absolute",
        bottom: 15,
        left: 20,
        right: 20,
        textAlign: "center",
        fontSize: 8,
        color: "#000000",
        borderTop: "1px solid #000000",
        paddingTop: 8,
    },
})

export function ResultsPDF({ data, sortedCourses }: ResultsPDFProps) {
    const hasTimeline = !!(data as any)?.timeline?.weeks
    const gapEntries = Object.entries(data.gap_map || {})

    return (
        <Document>
            <Page style={styles.page}>
                <View>
                    <Text style={styles.title}>PERSONALIZED LEARNING PLAN</Text>
                    {hasTimeline && (
                        <View style={styles.timelineBox}>
                            <Text style={styles.subtitle}>Timeline: {(data as any).timeline.weeks} weeks</Text>
                        </View>
                    )}

                    {/* Learning Plan Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>LEARNING PLAN</Text>
                        {data.plan.map((step: any, index: number) => (
                            <View key={index} style={styles.subsection}>
                                <View style={styles.flexRow}>
                                    <Text style={styles.badge}>Step {index + 1}</Text>
                                    {step.skill && <Text style={[styles.badge, styles.capitalize]}>{step.skill}</Text>}
                                    {step.action && <Text style={styles.badge}>{String(step.action).toUpperCase()}</Text>}
                                    {step.estimated_weeks && (
                                        <Text style={styles.badge}>{step.estimated_weeks} weeks</Text>
                                    )}
                                </View>
                                <Text style={styles.subsectionTitle}>
                                    {step.resource || "Learning Step"}
                                </Text>
                                {step.why && <Text style={styles.text}>{step.why}</Text>}
                            </View>
                        ))}
                    </View>

                    {/* Skill Gap Analysis Section */}
                    {gapEntries.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>SKILL GAP ANALYSIS</Text>
                            {gapEntries.map(([skill, gap]) => (
                                <View key={skill} style={styles.subsection}>
                                    <Text style={[styles.subsectionTitle, styles.capitalize]}>{skill}</Text>
                                    <View style={styles.flexRow}>
                                        {Array.isArray(gap) ? (
                                            gap.map((g: string, i: number) => (
                                                <Text key={i} style={styles.skillBadge}>{g}</Text>
                                            ))
                                        ) : (
                                            <Text style={styles.text}>{String(gap)}</Text>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Recommended Courses Section */}
                    {sortedCourses.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>RECOMMENDED COURSES</Text>
                            <View style={styles.courseGrid}>
                                {sortedCourses.map((c: any, i: number) => (
                                    <View key={c.course_id ?? i} style={styles.courseCard}>
                                        <Text style={styles.subsectionTitle}>{c.title ?? c.course_id}</Text>
                                        <View style={styles.flexRow}>
                                            {c.provider && <Text style={styles.badge}>{c.provider}</Text>}
                                            {c.difficulty && <Text style={[styles.badge, styles.capitalize]}>{String(c.difficulty)}</Text>}
                                        </View>
                                        {Number.isFinite(c.duration_weeks) && (
                                            <Text style={styles.text}>Duration: {c.duration_weeks} weeks</Text>
                                        )}
                                        {c.metadata?.rating && (
                                            <Text style={styles.text}>Rating: ★ {c.metadata.rating}</Text>
                                        )}
                                        {c.skills && c.skills.length > 0 && (
                                            <View>
                                                <Text style={styles.text}>Skills:</Text>
                                                <View style={styles.flexRow}>
                                                    {c.skills.slice(0, 3).map((skill: string, idx: number) => (
                                                        <Text key={idx} style={styles.skillBadge}>{skill}</Text>
                                                    ))}
                                                    {c.skills.length > 3 && (
                                                        <Text style={styles.text}>+{c.skills.length - 3} more</Text>
                                                    )}
                                                </View>
                                            </View>
                                        )}
                                        {c.url && (
                                            <Link src={c.url} style={styles.link}>
                                                View Course →
                                            </Link>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Additional Notes Section */}
                    {data.notes && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>ADDITIONAL NOTES</Text>
                            <Text style={styles.text}>{data.notes}</Text>
                        </View>
                    )}

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text>Generated by Upskill Advisor • {new Date().toLocaleDateString()}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    )
}