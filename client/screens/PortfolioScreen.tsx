import React, { useState } from "react";
import { View, FlatList, StyleSheet, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import type { PortfolioStackParamList } from "@/navigation/PortfolioStackNavigator";
import type { PortfolioProject } from "@shared/schema";

type NavigationProp = NativeStackNavigationProp<PortfolioStackParamList>;

const CATEGORIES = ["All", "Web Development", "App Development", "Graphic Design", "SEO", "Social Media", "AI Automation"];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

function FilterChip({ label, isSelected, onPress }: FilterChipProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterChip,
        {
          backgroundColor: isSelected ? Colors.primary : theme.backgroundDefault,
          borderColor: isSelected ? Colors.primary : theme.border,
        },
      ]}
    >
      <ThemedText
        type="small"
        style={{ color: isSelected ? "#FFFFFF" : theme.text }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

interface ProjectCardProps {
  project: PortfolioProject;
  onPress: () => void;
}

function ProjectCard({ project, onPress }: ProjectCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "web development":
        return "globe";
      case "app development":
        return "smartphone";
      case "graphic design":
        return "image";
      case "seo":
        return "search";
      case "social media":
        return "share-2";
      case "ai automation":
        return "cpu";
      default:
        return "folder";
    }
  };

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.96);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={onPress}
      style={[
        styles.projectCard,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        animatedStyle,
      ]}
    >
      <View style={[styles.projectThumbnail, { backgroundColor: Colors.primary + "15" }]}>
        <Feather name={getCategoryIcon(project.category) as any} size={32} color={Colors.primary} />
      </View>
      <View style={styles.projectContent}>
        <View style={[styles.categoryBadge, { backgroundColor: Colors.secondary + "20" }]}>
          <ThemedText type="caption" style={{ color: Colors.secondary }}>
            {project.category}
          </ThemedText>
        </View>
        <ThemedText type="h4" numberOfLines={2}>
          {project.title}
        </ThemedText>
        <ThemedText type="small" secondary numberOfLines={2}>
          {project.description}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

export default function PortfolioScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: projects = [], isLoading } = useQuery<PortfolioProject[]>({
    queryKey: ["/api/portfolio"],
  });

  const filteredProjects = selectedCategory === "All"
    ? projects
    : projects.filter((p) => p.category === selectedCategory);

  const navigateToDetail = (id: string) => {
    navigation.navigate("PortfolioDetail", { id });
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
      <View style={{ paddingTop: headerHeight }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {CATEGORIES.map((category) => (
            <FilterChip
              key={category}
              label={category}
              isSelected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={{
          paddingTop: Spacing.md,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.md,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={filteredProjects}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <ProjectCard project={item} onPress={() => navigateToDetail(item.id)} />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="folder" size={48} color={theme.textSecondary} />
            <ThemedText type="body" secondary style={styles.emptyText}>
              No projects found in this category
            </ThemedText>
          </View>
        }
      />
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
  filtersContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.xs,
  },
  list: {
    flex: 1,
  },
  row: {
    gap: Spacing.sm,
  },
  projectCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  projectThumbnail: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  projectContent: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.full,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyText: {
    textAlign: "center",
  },
});
