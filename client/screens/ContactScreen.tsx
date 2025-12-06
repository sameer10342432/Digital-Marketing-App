import React from "react";
import { View, ScrollView, StyleSheet, Pressable, Linking, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CONTACT_INFO = {
  email: "sameerliaqat81@gmail.com",
  phone: "+923001234567",
  whatsapp: "+923001234567",
};

const SOCIAL_LINKS = [
  { name: "Facebook", icon: "facebook", url: "https://facebook.com", color: "#1877F2" },
  { name: "Instagram", icon: "instagram", url: "https://instagram.com", color: "#E4405F" },
  { name: "LinkedIn", icon: "linkedin", url: "https://linkedin.com", color: "#0A66C2" },
  { name: "GitHub", icon: "github", url: "https://github.com", color: "#333333" },
  { name: "Website", icon: "globe", url: "https://sammer.dev", color: "#6366F1" },
];

interface ContactCardProps {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

function ContactCard({ icon, title, subtitle, color, onPress }: ContactCardProps) {
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
        styles.contactCard,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        animatedStyle,
      ]}
    >
      <View style={[styles.contactIcon, { backgroundColor: color + "20" }]}>
        <Feather name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.contactContent}>
        <ThemedText type="h4">{title}</ThemedText>
        <ThemedText type="small" secondary>
          {subtitle}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </AnimatedPressable>
  );
}

interface SocialButtonProps {
  name: string;
  icon: string;
  color: string;
  onPress: () => void;
}

function SocialButton({ name, icon, color, onPress }: SocialButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.9);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={onPress}
      style={[
        styles.socialButton,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        animatedStyle,
      ]}
    >
      <View style={[styles.socialIcon, { backgroundColor: color + "20" }]}>
        <Feather name={icon as any} size={20} color={color} />
      </View>
      <ThemedText type="small">{name}</ThemedText>
    </AnimatedPressable>
  );
}

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const handleWhatsApp = async () => {
    const url = `https://wa.me/${CONTACT_INFO.whatsapp.replace("+", "")}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "WhatsApp is not installed on this device");
      }
    } catch (error) {
      Alert.alert("Error", "Could not open WhatsApp");
    }
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${CONTACT_INFO.email}`);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${CONTACT_INFO.phone}`);
  };

  const handleSocialLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.md,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.md,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerSection}>
        <ThemedText type="h2" style={styles.headerTitle}>
          Get in Touch
        </ThemedText>
        <ThemedText type="body" secondary style={styles.headerSubtitle}>
          Ready to start your project? Reach out through any of these channels.
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Contact Me
        </ThemedText>

        <ContactCard
          icon="message-circle"
          title="WhatsApp"
          subtitle="Quick response via chat"
          color={Colors.success}
          onPress={handleWhatsApp}
        />

        <ContactCard
          icon="mail"
          title="Email"
          subtitle={CONTACT_INFO.email}
          color={Colors.primary}
          onPress={handleEmail}
        />

        <ContactCard
          icon="phone"
          title="Phone"
          subtitle={CONTACT_INFO.phone}
          color={Colors.secondary}
          onPress={handleCall}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Follow Me
        </ThemedText>

        <View style={styles.socialGrid}>
          {SOCIAL_LINKS.map((link) => (
            <SocialButton
              key={link.name}
              name={link.name}
              icon={link.icon}
              color={link.color}
              onPress={() => handleSocialLink(link.url)}
            />
          ))}
        </View>
      </View>

      <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <Feather name="clock" size={24} color={Colors.primary} />
        <View style={styles.infoCardContent}>
          <ThemedText type="h4">Working Hours</ThemedText>
          <ThemedText type="small" secondary>
            Monday - Friday: 9:00 AM - 6:00 PM (PKT)
          </ThemedText>
          <ThemedText type="small" secondary>
            Weekend: Available for urgent inquiries
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    textAlign: "center",
    maxWidth: 280,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  contactContent: {
    flex: 1,
  },
  socialGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  socialButton: {
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 80,
    gap: Spacing.xs,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  infoCardContent: {
    flex: 1,
    gap: Spacing.xs,
  },
});
