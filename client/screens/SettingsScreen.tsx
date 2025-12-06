import React from "react";
import { View, ScrollView, StyleSheet, Pressable, Switch, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
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

const APP_VERSION = "1.0.0";

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
}

function SettingItem({ icon, title, subtitle, rightElement, onPress }: SettingItemProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const content = (
    <View style={styles.settingItemContent}>
      <View style={[styles.settingIcon, { backgroundColor: Colors.primary + "15" }]}>
        <Feather name={icon as any} size={20} color={Colors.primary} />
      </View>
      <View style={styles.settingTextContainer}>
        <ThemedText type="body">{title}</ThemedText>
        {subtitle ? (
          <ThemedText type="small" secondary>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {rightElement}
    </View>
  );

  if (onPress) {
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
          styles.settingItem,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          animatedStyle,
        ]}
      >
        {content}
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </AnimatedPressable>
    );
  }

  return (
    <View
      style={[
        styles.settingItem,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
      ]}
    >
      {content}
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const adminData = await AsyncStorage.getItem("admin");
      setIsAdmin(!!adminData);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const handleAdminAccess = () => {
    if (isAdmin) {
      navigation.navigate("AdminDashboard");
    } else {
      navigation.navigate("AdminLogin");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout from admin panel?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("admin");
              setIsAdmin(false);
              Alert.alert("Success", "Logged out successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to logout");
            }
          },
        },
      ]
    );
  };

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
      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Appearance
        </ThemedText>
        <SettingItem
          icon="moon"
          title="Dark Mode"
          subtitle={isDark ? "Currently using dark theme" : "Currently using light theme"}
          rightElement={
            <View style={styles.themeIndicator}>
              <Feather
                name={isDark ? "moon" : "sun"}
                size={16}
                color={isDark ? Colors.secondary : Colors.warning}
              />
              <ThemedText type="small" secondary>
                {isDark ? "Dark" : "Light"}
              </ThemedText>
            </View>
          }
        />
        <ThemedText type="caption" secondary style={styles.hint}>
          Theme follows your device settings
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Admin Access
        </ThemedText>
        <SettingItem
          icon="shield"
          title={isAdmin ? "Admin Dashboard" : "Admin Login"}
          subtitle={isAdmin ? "Manage inquiries, portfolio & services" : "Access admin panel"}
          onPress={handleAdminAccess}
        />
        {isAdmin ? (
          <SettingItem
            icon="log-out"
            title="Logout"
            subtitle="Sign out from admin panel"
            onPress={handleLogout}
          />
        ) : null}
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          About
        </ThemedText>
        <SettingItem
          icon="info"
          title="Version"
          subtitle={APP_VERSION}
        />
        <SettingItem
          icon="code"
          title="Built with"
          subtitle="React Native & Expo"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  settingItemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  settingTextContainer: {
    flex: 1,
  },
  themeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  hint: {
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
