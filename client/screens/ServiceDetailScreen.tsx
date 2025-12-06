import React from "react";
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
type RouteParams = RouteProp<ServicesStackParamList, "ServiceDetail">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ServiceDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const { id } = route.params;

  const scale = useSharedValue(1);

  const { data: service, isLoading } = useQuery<Service>({
    queryKey: ["/api/services", id],
  });

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const navigateToInquiry = () => {
    navigation.navigate("InquiryForm", {
      serviceId: service?.id,
      serviceName: service?.name,
    });
  };

  React.useLayoutEffect(() => {
    if (service) {
      navigation.setOptions({
        headerTitle: service.name,
      });
    }
  }, [navigation, service]);

  if (isLoading || !service) {
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
        paddingBottom: insets.bottom + Spacing.xl + 80,
        paddingHorizontal: Spacing.md,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBanner}
      >
        <View style={styles.headerIconContainer}>
          <Feather name={service.icon as any} size={40} color="#FFFFFF" />
        </View>
        <ThemedText type="h2" style={styles.headerTitle}>
          {service.name}
        </ThemedText>
      </LinearGradient>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          About This Service
        </ThemedText>
        <ThemedText type="body" secondary>
          {service.description}
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          What We Offer
        </ThemedText>
        {service.offerings.map((offering, index) => (
          <View key={index} style={styles.listItem}>
            <Feather name="check-circle" size={18} color={Colors.success} />
            <ThemedText type="body" style={styles.listItemText}>
              {offering}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Deliverables
        </ThemedText>
        {service.deliverables.map((deliverable, index) => (
          <View key={index} style={styles.listItem}>
            <Feather name="package" size={18} color={Colors.primary} />
            <ThemedText type="body" style={styles.listItemText}>
              {deliverable}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.infoCardsRow}>
        <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Feather name="clock" size={20} color={Colors.primary} />
          <ThemedText type="caption" secondary>
            Timeline
          </ThemedText>
          <ThemedText type="h4">{service.timeline}</ThemedText>
        </View>
        <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Feather name="dollar-sign" size={20} color={Colors.success} />
          <ThemedText type="caption" secondary>
            Starting From
          </ThemedText>
          <ThemedText type="h4">{service.startingPrice}</ThemedText>
        </View>
      </View>

      <AnimatedPressable
        onPressIn={() => {
          scale.value = withSpring(0.96);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={navigateToInquiry}
        style={[styles.ctaButton, animatedButtonStyle]}
      >
        <Feather name="send" size={20} color="#FFFFFF" />
        <ThemedText type="button" style={styles.ctaButtonText}>
          Submit Inquiry
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
  headerBanner: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  headerTitle: {
    color: "#FFFFFF",
    textAlign: "center",
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
  infoCardsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  infoCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.xs,
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
