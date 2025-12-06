import React, { useState } from "react";
import { View, FlatList, StyleSheet, Pressable, ActivityIndicator, Alert, TextInput, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import type { PortfolioProject, InsertPortfolioProject } from "@shared/schema";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CATEGORIES = ["Web Development", "App Development", "Graphic Design", "SEO", "Social Media", "AI Automation"];

interface ProjectCardProps {
  project: PortfolioProject;
  onEdit: () => void;
  onDelete: () => void;
}

function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.projectCard,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
      ]}
    >
      <View style={[styles.projectThumbnail, { backgroundColor: Colors.primary + "15" }]}>
        <Feather name="folder" size={32} color={Colors.primary} />
      </View>
      <View style={styles.projectInfo}>
        <ThemedText type="h4" numberOfLines={1}>
          {project.title}
        </ThemedText>
        <ThemedText type="caption" secondary>
          {project.category}
        </ThemedText>
      </View>
      <View style={styles.projectActions}>
        <Pressable onPress={onEdit} hitSlop={8}>
          <Feather name="edit-2" size={18} color={Colors.primary} />
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={8}>
          <Feather name="trash-2" size={18} color={Colors.error} />
        </Pressable>
      </View>
    </View>
  );
}

export default function AdminPortfolioScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const scale = useSharedValue(1);

  const { data: projects = [], isLoading, refetch } = useQuery<PortfolioProject[]>({
    queryKey: ["/api/portfolio"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertPortfolioProject) => {
      const response = await apiRequest("POST", "/api/portfolio", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      closeModal();
      Alert.alert("Success", "Project created successfully");
    },
    onError: () => {
      Alert.alert("Error", "Failed to create project");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPortfolioProject> }) => {
      const response = await apiRequest("PUT", `/api/portfolio/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      closeModal();
      Alert.alert("Success", "Project updated successfully");
    },
    onError: () => {
      Alert.alert("Error", "Failed to update project");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/portfolio/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
    },
  });

  const animatedFabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const openModal = (project?: PortfolioProject) => {
    if (project) {
      setEditingProject(project);
      setTitle(project.title);
      setDescription(project.description);
      setCategory(project.category);
      setProjectUrl(project.projectUrl || "");
    } else {
      setEditingProject(null);
      setTitle("");
      setDescription("");
      setCategory("");
      setProjectUrl("");
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingProject(null);
    setTitle("");
    setDescription("");
    setCategory("");
    setProjectUrl("");
  };

  const handleSave = () => {
    if (!title || !description || !category) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    const data: InsertPortfolioProject = {
      title,
      description,
      category,
      projectUrl: projectUrl || null,
      imageUrl: null,
      deliverables: [],
      isActive: true,
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (project: PortfolioProject) => {
    Alert.alert(
      "Delete Project",
      `Are you sure you want to delete "${project.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(project.id),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: Spacing.md,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            onEdit={() => openModal(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="folder" size={48} color={theme.textSecondary} />
            <ThemedText type="h4" style={styles.emptyTitle}>
              No Projects Yet
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptyText}>
              Add your first project to showcase your work
            </ThemedText>
          </View>
        }
      />

      <AnimatedPressable
        onPressIn={() => {
          scale.value = withSpring(0.9);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={() => openModal()}
        style={[styles.fab, Shadows.fab, animatedFabStyle]}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </AnimatedPressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={closeModal}>
              <ThemedText type="body" style={{ color: Colors.primary }}>
                Cancel
              </ThemedText>
            </Pressable>
            <ThemedText type="h4">
              {editingProject ? "Edit Project" : "Add Project"}
            </ThemedText>
            <Pressable onPress={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <ThemedText type="body" style={{ color: Colors.primary, fontWeight: "600" }}>
                  Save
                </ThemedText>
              )}
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.field}>
              <ThemedText type="small" style={styles.label}>
                Title *
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Project title"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="small" style={styles.label}>
                Category *
              </ThemedText>
              <Pressable
                style={[styles.picker, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <ThemedText type="body" secondary={!category}>
                  {category || "Select category"}
                </ThemedText>
                <Feather name="chevron-down" size={20} color={theme.textSecondary} />
              </Pressable>
              {showCategoryPicker ? (
                <View style={[styles.pickerOptions, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      style={[
                        styles.pickerOption,
                        category === cat && { backgroundColor: Colors.primary + "15" },
                      ]}
                      onPress={() => {
                        setCategory(cat);
                        setShowCategoryPicker(false);
                      }}
                    >
                      <ThemedText type="body">{cat}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={styles.field}>
              <ThemedText type="small" style={styles.label}>
                Description *
              </ThemedText>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the project..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="small" style={styles.label}>
                Project URL (Optional)
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={projectUrl}
                onChangeText={setProjectUrl}
                placeholder="https://example.com"
                placeholderTextColor={theme.textSecondary}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </KeyboardAwareScrollViewCompat>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  projectCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  projectThumbnail: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  projectInfo: {
    flex: 1,
  },
  projectActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    maxWidth: 250,
  },
  fab: {
    position: "absolute",
    right: Spacing.md,
    bottom: 88,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  modalContent: {
    padding: Spacing.md,
  },
  field: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
  },
  picker: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerOptions: {
    marginTop: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  pickerOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
