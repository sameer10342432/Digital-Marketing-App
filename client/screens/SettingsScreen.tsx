import React from "react";
import { View, ScrollView, StyleSheet, Pressable, Alert } from "react-native";
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
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();
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
      t("admin.logout"),
      t("admin.logoutConfirm", "Are you sure you want to logout from admin panel?"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("admin.logout"),
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("admin");
              setIsAdmin(false);
              Alert.alert(t("common.success"), t("admin.loggedOut", "Logged out successfully"));
            } catch (error) {
              Alert.alert(t("common.error"), t("admin.logoutError", "Failed to logout"));
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
          {t("settings.language")}
        </ThemedText>
        <LanguageSwitcher />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          {t("settings.appearance", "Appearance")}
        </ThemedText>
        <SettingItem
          icon="moon"
          title={t("settings.darkMode", "Dark Mode")}
          subtitle={isDark ? t("settings.darkTheme", "Currently using dark theme") : t("settings.lightTheme", "Currently using light theme")}
          rightElement={
            <View style={styles.themeIndicator}>
              <Feather
                name={isDark ? "moon" : "sun"}
                size={16}
                color={isDark ? Colors.secondary : Colors.warning}
              />
              <ThemedText type="small" secondary>
                {isDark ? t("settings.dark", "Dark") : t("settings.light", "Light")}
              </ThemedText>
            </View>
          }
        />
        <ThemedText type="caption" secondary style={styles.hint}>
          {t("settings.themeHint", "Theme follows your device settings")}
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          {t("admin.access", "Admin Access")}
        </ThemedText>
        <SettingItem
          icon="shield"
          title={isAdmin ? t("admin.dashboard") : t("admin.login", "Admin Login")}
          subtitle={isAdmin ? t("admin.manageContent", "Manage inquiries, portfolio & services") : t("admin.accessPanel", "Access admin panel")}
          onPress={handleAdminAccess}
        />
        {isAdmin ? (
          <SettingItem
            icon="log-out"
            title={t("admin.logout")}
            subtitle={t("admin.signOut", "Sign out from admin panel")}
            onPress={handleLogout}
          />
        ) : null}
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          {t("settings.about")}
        </ThemedText>
        <SettingItem
          icon="info"
          title={t("settings.version")}
          subtitle={APP_VERSION}
        />
        <SettingItem
          icon="code"
          title={t("settings.builtWith", "Built with")}
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
