import React, { useRef } from "react";
import { View, ScrollView, StyleSheet, FlatList, Dimensions, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import type { Testimonial } from "@shared/schema";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TESTIMONIAL_WIDTH = SCREEN_WIDTH - Spacing.md * 4;

const SKILLS = [
  { name: "SEO", level: 95 },
  { name: "Web Development", level: 90 },
  { name: "App Development", level: 85 },
  { name: "Graphic Design", level: 88 },
  { name: "Social Media", level: 92 },
  { name: "AI/Automation", level: 80 },
];

const EXPERIENCE = [
  { year: "2024", title: "AI Automation Specialist", company: "Freelance" },
  { year: "2022", title: "Full Stack Developer", company: "Tech Agency" },
  { year: "2020", title: "Digital Marketing Manager", company: "Marketing Co." },
  { year: "2018", title: "SEO Specialist", company: "Startup Inc." },
];

const ACHIEVEMENTS = [
  { icon: "award", title: "50+", subtitle: "Projects Completed" },
  { icon: "users", title: "100+", subtitle: "Happy Clients" },
  { icon: "trending-up", title: "500%", subtitle: "Avg. Traffic Increase" },
  { icon: "star", title: "5.0", subtitle: "Client Rating" },
];

interface SkillBarProps {
  name: string;
  level: number;
}

function SkillBar({ name, level }: SkillBarProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.skillItem}>
      <View style={styles.skillHeader}>
        <ThemedText type="small">{name}</ThemedText>
        <ThemedText type="caption" secondary>
          {level}%
        </ThemedText>
      </View>
      <View style={[styles.skillBarBg, { backgroundColor: theme.backgroundSecondary }]}>
        <View
          style={[
            styles.skillBarFill,
            { width: `${level}%`, backgroundColor: Colors.primary },
          ]}
        />
      </View>
    </View>
  );
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.testimonialCard,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
      ]}
    >
      <Feather name="message-circle" size={24} color={Colors.primary} style={styles.quoteIcon} />
      <ThemedText type="body" style={styles.testimonialQuote}>
        "{testimonial.quote}"
      </ThemedText>
      <View style={styles.testimonialAuthor}>
        <View style={[styles.testimonialAvatar, { backgroundColor: Colors.secondary + "30" }]}>
          <ThemedText type="h4" style={{ color: Colors.secondary }}>
            {testimonial.clientName.charAt(0)}
          </ThemedText>
        </View>
        <View>
          <ThemedText type="h4">{testimonial.clientName}</ThemedText>
          {testimonial.company ? (
            <ThemedText type="small" secondary>
              {testimonial.company}
            </ThemedText>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.md,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileSection}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileGradient}
        >
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.profileImage}
            resizeMode="cover"
          />
        </LinearGradient>
        <ThemedText type="h2" style={styles.profileName}>
          Muhammad Sammer
        </ThemedText>
        <ThemedText type="body" secondary style={styles.profileTitle}>
          Digital Marketing Specialist
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          About Me
        </ThemedText>
        <ThemedText type="body" secondary>
          I am a passionate digital marketing specialist with expertise in SEO, web development, app development, and AI automation. With years of experience helping businesses grow their online presence, I deliver results that exceed expectations.
        </ThemedText>
        <ThemedText type="body" secondary style={{ marginTop: Spacing.sm }}>
          My mission is to help businesses leverage the power of digital marketing and cutting-edge technology to achieve their goals and stay ahead of the competition.
        </ThemedText>
      </View>

      <View style={styles.achievementsRow}>
        {ACHIEVEMENTS.map((achievement, index) => (
          <View
            key={index}
            style={[styles.achievementCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          >
            <View style={[styles.achievementIcon, { backgroundColor: Colors.primary + "15" }]}>
              <Feather name={achievement.icon as any} size={20} color={Colors.primary} />
            </View>
            <ThemedText type="h3" style={{ color: Colors.primary }}>
              {achievement.title}
            </ThemedText>
            <ThemedText type="caption" secondary>
              {achievement.subtitle}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Skills
        </ThemedText>
        {SKILLS.map((skill) => (
          <SkillBar key={skill.name} name={skill.name} level={skill.level} />
        ))}
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Experience
        </ThemedText>
        {EXPERIENCE.map((exp, index) => (
          <View
            key={index}
            style={[styles.experienceItem, { borderColor: theme.border }]}
          >
            <View style={[styles.experienceYear, { backgroundColor: Colors.primary + "15" }]}>
              <ThemedText type="small" style={{ color: Colors.primary, fontWeight: "600" }}>
                {exp.year}
              </ThemedText>
            </View>
            <View style={styles.experienceContent}>
              <ThemedText type="h4">{exp.title}</ThemedText>
              <ThemedText type="small" secondary>
                {exp.company}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {testimonials.length > 0 ? (
        <View style={styles.section}>
          <ThemedText type="h3" style={[styles.sectionTitle, { paddingHorizontal: Spacing.md }]}>
            What Clients Say
          </ThemedText>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={testimonials}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.testimonialsContainer}
            snapToInterval={TESTIMONIAL_WIDTH + Spacing.md}
            decelerationRate="fast"
            renderItem={({ item }) => <TestimonialCard testimonial={item} />}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  profileGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    marginBottom: Spacing.md,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 58,
  },
  profileName: {
    textAlign: "center",
  },
  profileTitle: {
    textAlign: "center",
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  achievementsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  achievementCard: {
    flex: 1,
    minWidth: "45%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.xs,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  skillItem: {
    marginBottom: Spacing.sm,
  },
  skillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  skillBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  skillBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  experienceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  experienceYear: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  experienceContent: {
    flex: 1,
  },
  testimonialsContainer: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  testimonialCard: {
    width: TESTIMONIAL_WIDTH,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  quoteIcon: {
    marginBottom: Spacing.sm,
  },
  testimonialQuote: {
    fontStyle: "italic",
    marginBottom: Spacing.md,
  },
  testimonialAuthor: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
