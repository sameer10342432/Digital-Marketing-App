import React from "react";
import { View, FlatList, StyleSheet, Pressable, ActivityIndicator } from "react-native";
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
import type { ServicesStackParamList } from "@/navigation/ServicesStackNavigator";
import type { Service } from "@shared/schema";

type NavigationProp = NativeStackNavigationProp<ServicesStackParamList>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ServiceListItemProps {
  service: Service;
  onPress: () => void;
}

function ServiceListItem({ service, onPress }: ServiceListItemProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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
        styles.serviceItem,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        animatedStyle,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: Colors.primary + "15" }]}>
        <Feather name={service.icon as any} size={24} color={Colors.primary} />
      </View>
      <View style={styles.serviceContent}>
        <ThemedText type="h4">{service.name}</ThemedText>
        <ThemedText type="small" secondary numberOfLines={2}>
          {service.description}
        </ThemedText>
        <ThemedText type="caption" style={{ color: Colors.primary, marginTop: Spacing.xs }}>
          Starting from {service.startingPrice}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </AnimatedPressable>
  );
}

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const navigateToDetail = (id: string) => {
    navigation.navigate("ServiceDetail", { id });
  };

  const navigateToPricingCalculator = () => {
    navigation.navigate("PricingCalculator");
  };

  const navigateToProjectTracker = () => {
    navigation.navigate("ProjectTracker");
  };

  const navigateToContractGenerator = () => {
    navigation.navigate("ContractGenerator");
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={navigateToPricingCalculator} hitSlop={8}>
          <Feather name="dollar-sign" size={22} color={theme.text} />
        </Pressable>
      ),
    });
  }, [navigation, theme]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const QuickActionsHeader = () => (
    <View style={styles.quickActionsContainer}>
      <Pressable
        style={[styles.quickActionButton, { backgroundColor: Colors.primary + "15" }]}
        onPress={navigateToPricingCalculator}
      >
        <Feather name="dollar-sign" size={18} color={Colors.primary} />
        <ThemedText type="small" style={{ color: Colors.primary, fontWeight: "600" }}>
          Calculator
        </ThemedText>
      </Pressable>
      <Pressable
        style={[styles.quickActionButton, { backgroundColor: Colors.primary + "15" }]}
        onPress={navigateToProjectTracker}
      >
        <Feather name="activity" size={18} color={Colors.primary} />
        <ThemedText type="small" style={{ color: Colors.primary, fontWeight: "600" }}>
          Track Project
        </ThemedText>
      </Pressable>
      <Pressable
        style={[styles.quickActionButton, { backgroundColor: Colors.primary + "15" }]}
        onPress={navigateToContractGenerator}
      >
        <Feather name="file-text" size={18} color={Colors.primary} />
        <ThemedText type="small" style={{ color: Colors.primary, fontWeight: "600" }}>
          Contract
        </ThemedText>
      </Pressable>
    </View>
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.md,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.md,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={services}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={QuickActionsHeader}
      renderItem={({ item }) => (
        <ServiceListItem service={item} onPress={() => navigateToDetail(item.id)} />
      )}
      ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      showsVerticalScrollIndicator={false}
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
  quickActionsContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceContent: {
    flex: 1,
  },
});
