import React from "react";
import { View, FlatList, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
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
import type { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import type { Inquiry } from "@shared/schema";

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface InquiryCardProps {
  inquiry: Inquiry;
  onPress: () => void;
}

function InquiryCard({ inquiry, onPress }: InquiryCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return Colors.warning;
      case "in_progress":
        return Colors.primary;
      case "completed":
        return Colors.success;
      default:
        return Colors.primary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.98);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={onPress}
      style={[
        styles.inquiryCard,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        animatedStyle,
      ]}
    >
      <View style={styles.inquiryHeader}>
        <View style={styles.inquiryInfo}>
          <ThemedText type="h4" numberOfLines={1}>
            {inquiry.fullName}
          </ThemedText>
          <ThemedText type="small" secondary numberOfLines={1}>
            {inquiry.email}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(inquiry.status) + "20" },
          ]}
        >
          <ThemedText
            type="caption"
            style={{ color: getStatusColor(inquiry.status), fontWeight: "600" }}
          >
            {getStatusLabel(inquiry.status)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.inquiryDetails}>
        <View style={styles.detailItem}>
          <Feather name="briefcase" size={14} color={theme.textSecondary} />
          <ThemedText type="small" secondary numberOfLines={1}>
            {inquiry.serviceCategory}
          </ThemedText>
        </View>
        <View style={styles.detailItem}>
          <Feather name="dollar-sign" size={14} color={theme.textSecondary} />
          <ThemedText type="small" secondary>
            {inquiry.budgetRange}
          </ThemedText>
        </View>
      </View>

      <View style={styles.inquiryFooter}>
        <View style={styles.detailItem}>
          <Feather name="calendar" size={14} color={theme.textSecondary} />
          <ThemedText type="caption" secondary>
            {formatDate(inquiry.createdAt)}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={18} color={theme.textSecondary} />
      </View>
    </AnimatedPressable>
  );
}

export default function AdminInquiriesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { data: inquiries = [], isLoading, refetch } = useQuery<Inquiry[]>({
    queryKey: ["/api/inquiries"],
  });

  const navigateToDetail = (id: string) => {
    navigation.navigate("AdminInquiryDetail", { id });
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.md,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.md,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={inquiries}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <InquiryCard inquiry={item} onPress={() => navigateToDetail(item.id)} />
      )}
      ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      showsVerticalScrollIndicator={false}
      onRefresh={refetch}
      refreshing={isLoading}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Feather name="inbox" size={48} color={theme.textSecondary} />
          <ThemedText type="h4" style={styles.emptyTitle}>
            No Inquiries Yet
          </ThemedText>
          <ThemedText type="body" secondary style={styles.emptyText}>
            New inquiries from clients will appear here
          </ThemedText>
        </View>
      }
    />
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
  inquiryCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  inquiryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  inquiryInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.full,
  },
  inquiryDetails: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  inquiryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
});
