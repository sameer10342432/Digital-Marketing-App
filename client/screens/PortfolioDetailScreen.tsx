import React from "react";
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
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
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { PortfolioProject } from "@shared/schema";

type NavigationProp = NativeStackNavigationProp<PortfolioStackParamList & RootStackParamList>;
type RouteParams = RouteProp<PortfolioStackParamList, "PortfolioDetail">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PortfolioDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const { id } = route.params;

  const scale = useSharedValue(1);

  const { data: project, isLoading } = useQuery<PortfolioProject>({
    queryKey: ["/api/portfolio", id],
  });

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
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

  const handleRequestSimilar = () => {
    navigation.getParent()?.navigate("InquiryModal", {
      serviceName: project?.category,
    });
  };

  const handleViewProject = () => {
    if (project?.projectUrl) {
      Linking.openURL(project.projectUrl);
    }
  };

  React.useLayoutEffect(() => {
    if (project) {
      navigation.setOptions({
        headerTitle: project.title,
        headerRight: () => (
          <Pressable onPress={handleRequestSimilar} hitSlop={8}>
            <Feather name="file-text" size={22} color={Colors.primary} />
          </Pressable>
        ),
      });
    }
  }, [navigation, project]);

  if (isLoading || !project) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.md,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.md,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerImage, { backgroundColor: Colors.primary + "15" }]}>
        <Feather name={getCategoryIcon(project.category) as any} size={64} color={Colors.primary} />
      </View>

      <View style={[styles.categoryBadge, { backgroundColor: Colors.secondary + "20" }]}>
        <ThemedText type="small" style={{ color: Colors.secondary }}>
          {project.category}
        </ThemedText>
      </View>

      <ThemedText type="h2" style={styles.title}>
        {project.title}
      </ThemedText>

      <ThemedText type="body" secondary style={styles.description}>
        {project.description}
      </ThemedText>

      {project.deliverables && project.deliverables.length > 0 ? (
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Deliverables
          </ThemedText>
          {project.deliverables.map((deliverable, index) => (
            <View key={index} style={styles.listItem}>
              <Feather name="check-circle" size={18} color={Colors.success} />
              <ThemedText type="body" style={styles.listItemText}>
                {deliverable}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : null}

      {project.projectUrl ? (
        <Pressable
          onPress={handleViewProject}
          style={[styles.linkButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <Feather name="external-link" size={20} color={Colors.primary} />
          <ThemedText type="body" style={{ color: Colors.primary }}>
            View Live Project
          </ThemedText>
        </Pressable>
      ) : null}

      <AnimatedPressable
        onPressIn={() => {
          scale.value = withSpring(0.96);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={handleRequestSimilar}
        style={[styles.ctaButton, animatedButtonStyle]}
      >
        <Feather name="file-text" size={20} color="#FFFFFF" />
        <ThemedText type="button" style={styles.ctaButtonText}>
          Request Similar Project
        </ThemedText>
      </AnimatedPressable>
    </ScrollView>
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
  headerImage: {
    height: 200,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  description: {
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  listItemText: {
    flex: 1,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  ctaButtonText: {
    color: "#FFFFFF",
  },
});
