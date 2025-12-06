import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import type { ClientProject } from "@shared/schema";

const PROJECT_STAGES = [
  { id: "requirements_collected", label: "Requirements", icon: "clipboard" },
  { id: "planning", label: "Planning", icon: "map" },
  { id: "design", label: "Design", icon: "layout" },
  { id: "development", label: "Development", icon: "code" },
  { id: "review", label: "Review", icon: "eye" },
  { id: "completed", label: "Completed", icon: "check-circle" },
] as const;

function getStageIndex(stage: string): number {
  return PROJECT_STAGES.findIndex((s) => s.id === stage);
}

interface StageProgressProps {
  currentStage: string;
  progressPercent: number;
}

function StageProgress({ currentStage, progressPercent }: StageProgressProps) {
  const { theme } = useTheme();
  const currentIndex = getStageIndex(currentStage);

  return (
    <View style={styles.stageProgressContainer}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: Colors.primary,
              width: `${progressPercent}%`,
            },
          ]}
        />
      </View>
      <View style={styles.stagesRow}>
        {PROJECT_STAGES.map((stage, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <View key={stage.id} style={styles.stageItem}>
              <View
                style={[
                  styles.stageIcon,
                  {
                    backgroundColor: isComplete
                      ? Colors.primary
                      : isCurrent
                      ? Colors.primary + "30"
                      : theme.border,
                  },
                ]}
              >
                <Feather
                  name={stage.icon as any}
                  size={14}
                  color={
                    isComplete
                      ? "#FFFFFF"
                      : isCurrent
                      ? Colors.primary
                      : theme.tabIconDefault
                  }
                />
              </View>
              <ThemedText
                type="small"
                style={[
                  styles.stageLabel,
                  isCurrent && { color: Colors.primary, fontWeight: "600" },
                  isPending && { opacity: 0.5 },
                ]}
              >
                {stage.label}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface ProjectCardProps {
  project: ClientProject;
}

function ProjectCard({ project }: ProjectCardProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const rotation = useSharedValue(0);

  const toggleExpand = () => {
    setExpanded(!expanded);
    rotation.value = withSpring(expanded ? 0 : 180);
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const deadlineDate = project.deadline
    ? new Date(project.deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not set";

  return (
    <ThemedView style={[styles.projectCard, { borderColor: theme.border }]}>
      <Pressable onPress={toggleExpand} style={styles.projectHeader}>
        <View style={styles.projectInfo}>
          <ThemedText type="h4">{project.title}</ThemedText>
          <ThemedText type="small" style={{ opacity: 0.6 }}>
            {project.description}
          </ThemedText>
        </View>
        <Animated.View style={chevronStyle}>
          <Feather name="chevron-down" size={20} color={theme.tabIconDefault} />
        </Animated.View>
      </Pressable>

      <StageProgress
        currentStage={project.stage}
        progressPercent={project.progressPercent}
      />

      {expanded && (
        <View style={[styles.expandedContent, { borderTopColor: theme.border }]}>
          <View style={styles.detailRow}>
            <Feather name="calendar" size={16} color={theme.tabIconDefault} />
            <ThemedText type="body">Deadline: {deadlineDate}</ThemedText>
          </View>

          {project.milestones && project.milestones.length > 0 && (
            <View style={styles.milestonesSection}>
              <ThemedText type="body" style={[styles.sectionLabel, { fontWeight: "600" }]}>
                Milestones
              </ThemedText>
              {project.milestones.map((milestone, index) => {
                const isCompleted = project.completedMilestones?.includes(milestone);
                return (
                  <View key={index} style={styles.milestoneRow}>
                    <Feather
                      name={isCompleted ? "check-circle" : "circle"}
                      size={16}
                      color={isCompleted ? Colors.primary : theme.tabIconDefault}
                    />
                    <ThemedText
                      type="body"
                      style={[
                        styles.milestoneText,
                        isCompleted && styles.completedMilestone,
                      ]}
                    >
                      {milestone}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          )}

          {project.adminComments && (
            <View style={styles.commentsSection}>
              <ThemedText type="body" style={[styles.sectionLabel, { fontWeight: "600" }]}>
                Latest Update
              </ThemedText>
              <ThemedText type="body" style={{ opacity: 0.8 }}>
                {project.adminComments}
              </ThemedText>
            </View>
          )}

          {project.uploadedFiles && project.uploadedFiles.length > 0 && (
            <View style={styles.filesSection}>
              <ThemedText type="body" style={[styles.sectionLabel, { fontWeight: "600" }]}>
                Files
              </ThemedText>
              {project.uploadedFiles.map((file, index) => (
                <View key={index} style={styles.fileRow}>
                  <Feather name="file" size={16} color={theme.tabIconDefault} />
                  <ThemedText type="body" style={styles.fileName}>
                    {file}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ThemedView>
  );
}

export default function ProjectTrackerScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [searchedEmail, setSearchedEmail] = useState("");

  const {
    data: projects = [],
    isLoading,
    error,
    refetch,
  } = useQuery<ClientProject[]>({
    queryKey: ["/api/client-projects", searchedEmail],
    queryFn: async () => {
      if (!searchedEmail) return [];
      const response = await fetch(`/api/client-projects?email=${encodeURIComponent(searchedEmail)}`);
      if (!response.ok) throw new Error("Failed to fetch projects");
      return response.json();
    },
    enabled: !!searchedEmail,
  });

  const handleSearch = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    setSearchedEmail(email.trim());
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.md,
        paddingBottom: insets.bottom + Spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <ThemedText type="h2" style={styles.title}>
          Track Your Projects
        </ThemedText>
        <ThemedText type="body" style={styles.subtitle}>
          Enter your email to view all your active projects and their progress.
        </ThemedText>
      </View>

      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchInputContainer,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <Feather name="mail" size={20} color={theme.tabIconDefault} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Enter your email"
            placeholderTextColor={theme.tabIconDefault}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <Pressable
          style={[styles.searchButton, { backgroundColor: Colors.primary }]}
          onPress={handleSearch}
        >
          <Feather name="search" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {searchedEmail && (
        <View style={styles.projectsSection}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ThemedText type="body" style={{ opacity: 0.6 }}>
                Loading projects...
              </ThemedText>
            </View>
          ) : error ? (
            <View style={styles.emptyContainer}>
              <Feather name="alert-circle" size={48} color={theme.tabIconDefault} />
              <ThemedText type="body" style={styles.emptyText}>
                Failed to load projects. Please try again.
              </ThemedText>
            </View>
          ) : projects.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="folder" size={48} color={theme.tabIconDefault} />
              <ThemedText type="body" style={styles.emptyText}>
                No projects found for this email.
              </ThemedText>
            </View>
          ) : (
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </View>
      )}

      {!searchedEmail && (
        <View style={styles.infoSection}>
          <ThemedView style={[styles.infoCard, { borderColor: theme.border }]}>
            <Feather name="info" size={24} color={Colors.primary} />
            <ThemedText type="body" style={styles.infoText}>
              Once you submit an inquiry and we start working on your project, you'll be able to track its progress here.
            </ThemedText>
          </ThemedView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    opacity: 0.7,
  },
  searchSection: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: Spacing.buttonHeight,
    fontSize: 16,
  },
  searchButton: {
    width: Spacing.buttonHeight,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  projectsSection: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  projectCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  projectInfo: {
    flex: 1,
    gap: 4,
  },
  stageProgressContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  stagesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stageItem: {
    alignItems: "center",
    gap: 4,
  },
  stageIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stageLabel: {
    fontSize: 10,
    textAlign: "center",
  },
  expandedContent: {
    padding: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  milestonesSection: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    marginBottom: Spacing.xs,
  },
  milestoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  milestoneText: {
    flex: 1,
  },
  completedMilestone: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  commentsSection: {
    gap: Spacing.xs,
  },
  filesSection: {
    gap: Spacing.sm,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  fileName: {
    flex: 1,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: "center",
    gap: Spacing.md,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.6,
  },
  infoSection: {
    paddingHorizontal: Spacing.md,
  },
  infoCard: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    opacity: 0.8,
  },
});
