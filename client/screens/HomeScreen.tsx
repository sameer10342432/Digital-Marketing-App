import React from "react";
import { View, ScrollView, StyleSheet, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
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
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import type { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Service } from "@shared/schema";

type NavigationProp = NativeStackNavigationProp<HomeStackParamList & RootStackParamList>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ServiceCardProps {
  name: string;
  icon: string;
  onPress: () => void;
}

function ServiceCard({ name, icon, onPress }: ServiceCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.95);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={onPress}
      style={[
        styles.serviceCard,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        animatedStyle,
      ]}
    >
      <View style={[styles.serviceIconContainer, { backgroundColor: Colors.primary + "15" }]}>
        <Feather name={icon as any} size={24} color={Colors.primary} />
      </View>
      <ThemedText type="small" numberOfLines={2} style={styles.serviceCardText}>
        {name}
      </ThemedText>
    </AnimatedPressable>
  );
}

interface CTAButtonProps {
  title: string;
  icon: string;
  variant: "primary" | "secondary" | "outline";
  onPress: () => void;
}

function CTAButton({ title, icon, variant, onPress }: CTAButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getButtonStyle = () => {
    switch (variant) {
      case "primary":
        return { backgroundColor: Colors.primary };
      case "secondary":
        return { backgroundColor: Colors.secondary };
      case "outline":
        return { backgroundColor: "transparent", borderWidth: 1, borderColor: Colors.primary };
    }
  };

  const getTextColor = () => {
    return variant === "outline" ? Colors.primary : "#FFFFFF";
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
      style={[styles.ctaButton, getButtonStyle(), animatedStyle]}
    >
      <Feather name={icon as any} size={18} color={getTextColor()} />
      <ThemedText type="button" style={[styles.ctaButtonText, { color: getTextColor() }]}>
        {title}
      </ThemedText>
    </AnimatedPressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation<NavigationProp>();

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const navigateToSettings = () => {
    navigation.navigate("Settings");
  };

  const navigateToService = (serviceId: string) => {
    navigation.getParent()?.navigate("ServicesTab", {
      screen: "ServiceDetail",
      params: { id: serviceId },
    });
  };

  const navigateToQuote = () => {
    navigation.navigate("InquiryModal", {});
  };

  const navigateToContact = () => {
    navigation.getParent()?.navigate("ContactTab");
  };

  const navigateToPortfolio = () => {
    navigation.getParent()?.navigate("PortfolioTab");
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={navigateToSettings} hitSlop={8}>
          <Feather name="settings" size={22} color={theme.text} />
        </Pressable>
      ),
    });
  }, [navigation, theme]);

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
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBanner}
      >
        <View style={styles.heroContent}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.heroIcon}
            resizeMode="contain"
          />
          <ThemedText type="heroTitle" style={styles.heroTitle}>
            {t("home.welcome")}
          </ThemedText>
          <ThemedText type="body" style={styles.heroSubtitle}>
            {t("home.tagline")}
          </ThemedText>
          <ThemedText type="small" style={styles.heroDescription}>
            {t("home.subtitle")}
          </ThemedText>
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          {t("home.ourServices")}
        </ThemedText>
        <View style={styles.servicesGrid}>
          {services.slice(0, 8).map((service) => (
            <ServiceCard
              key={service.id}
              name={service.name}
              icon={service.icon}
              onPress={() => navigateToService(service.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.ctaSection}>
        <CTAButton
          title={t("services.getQuote")}
          icon="file-text"
          variant="primary"
          onPress={navigateToQuote}
        />
        <CTAButton
          title={t("home.getInTouch")}
          icon="message-circle"
          variant="secondary"
          onPress={navigateToContact}
        />
        <CTAButton
          title={t("portfolio.viewProject")}
          icon="grid"
          variant="outline"
          onPress={navigateToPortfolio}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroBanner: {
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  heroContent: {
    alignItems: "center",
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  heroTitle: {
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  heroDescription: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    maxWidth: 300,
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  serviceCard: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "45%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.sm,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceCardText: {
    textAlign: "center",
  },
  ctaSection: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  ctaButtonText: {
    fontWeight: "600",
  },
});
