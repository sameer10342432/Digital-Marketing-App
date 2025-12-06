import React from "react";
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import type { HomeStackParamList } from "@/navigation/HomeStackNavigator";

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface StatsData {
  totalInquiries: number;
  newInquiries: number;
  inProgressInquiries: number;
  completedInquiries: number;
  mostRequestedService: string;
  weeklyData: { day: string; count: number }[];
  totalServices: number;
}

interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  color: string;
}

function StatCard({ icon, title, value, color }: StatCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <Feather name={icon as any} size={20} color={color} />
      </View>
      <ThemedText type="h2" style={{ color }}>
        {value}
      </ThemedText>
      <ThemedText type="caption" secondary>
        {title}
      </ThemedText>
    </View>
  );
}

interface QuickActionProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function QuickAction({ icon, title, subtitle, onPress }: QuickActionProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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
        styles.quickAction,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        animatedStyle,
      ]}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: Colors.primary + "15" }]}>
        <Feather name={icon as any} size={24} color={Colors.primary} />
      </View>
      <View style={styles.quickActionContent}>
        <ThemedText type="h4">{title}</ThemedText>
        <ThemedText type="small" secondary>
          {subtitle}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </AnimatedPressable>
  );
}

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ["/api/admin/stats"],
  });

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={async () => {
            await AsyncStorage.removeItem("admin");
            navigation.popToTop();
          }}
          hitSlop={8}
        >
          <Feather name="log-out" size={22} color={Colors.error} />
        </Pressable>
      ),
    });
  }, [navigation]);

  if (isLoading) {
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
      <View style={styles.statsGrid}>
        <StatCard
          icon="inbox"
          title="Total Inquiries"
          value={stats?.totalInquiries || 0}
          color={Colors.primary}
        />
        <StatCard
          icon="alert-circle"
          title="New"
          value={stats?.newInquiries || 0}
          color={Colors.warning}
        />
        <StatCard
          icon="clock"
          title="In Progress"
          value={stats?.inProgressInquiries || 0}
          color={Colors.secondary}
        />
        <StatCard
          icon="check-circle"
          title="Completed"
          value={stats?.completedInquiries || 0}
          color={Colors.success}
        />
      </View>

      <View
        style={[
          styles.infoCard,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        ]}
      >
        <Feather name="trending-up" size={20} color={Colors.primary} />
        <View style={styles.infoCardContent}>
          <ThemedText type="small" secondary>
            Most Requested Service
          </ThemedText>
          <ThemedText type="h4">{stats?.mostRequestedService || "N/A"}</ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Weekly Activity
        </ThemedText>
        <View
          style={[
            styles.chartContainer,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <View style={styles.chartBars}>
            {stats?.weeklyData?.map((day, index) => {
              const maxCount = Math.max(...(stats.weeklyData?.map((d) => d.count) || [1]), 1);
              const height = (day.count / maxCount) * 80 || 4;
              return (
                <View key={index} style={styles.chartBar}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height,
                        backgroundColor: day.count > 0 ? Colors.primary : theme.backgroundSecondary,
                      },
                    ]}
                  />
                  <ThemedText type="caption" secondary>
                    {day.day}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Quick Actions
        </ThemedText>
        <QuickAction
          icon="inbox"
          title="View Inquiries"
          subtitle={`${stats?.newInquiries || 0} new inquiries waiting`}
          onPress={() => navigation.navigate("AdminInquiries")}
        />
        <QuickAction
          icon="grid"
          title="Manage Portfolio"
          subtitle="Add, edit, or remove projects"
          onPress={() => navigation.navigate("AdminPortfolio")}
        />
        <QuickAction
          icon="briefcase"
          title="Manage Services"
          subtitle={`${stats?.totalServices || 0} services active`}
          onPress={() => navigation.navigate("AdminServices")}
        />
      </View>
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.xs,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoCardContent: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  chartContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 100,
  },
  chartBar: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  bar: {
    width: 32,
    borderRadius: BorderRadius.xs,
    minHeight: 4,
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionContent: {
    flex: 1,
  },
});
