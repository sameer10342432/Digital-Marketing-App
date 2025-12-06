import React from "react";
import { View, FlatList, StyleSheet, Pressable, ActivityIndicator, Switch, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import type { Service } from "@shared/schema";

interface ServiceItemProps {
  service: Service;
  onToggle: (isActive: boolean) => void;
}

function ServiceItem({ service, onToggle }: ServiceItemProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.serviceItem,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
      ]}
    >
      <View style={[styles.serviceIcon, { backgroundColor: Colors.primary + "15" }]}>
        <Feather name={service.icon as any} size={20} color={Colors.primary} />
      </View>
      <View style={styles.serviceInfo}>
        <ThemedText type="h4" numberOfLines={1}>
          {service.name}
        </ThemedText>
        <ThemedText type="caption" secondary>
          Starting from {service.startingPrice}
        </ThemedText>
      </View>
      <Switch
        value={service.isActive}
        onValueChange={onToggle}
        trackColor={{ false: theme.backgroundSecondary, true: Colors.primary + "60" }}
        thumbColor={service.isActive ? Colors.primary : theme.backgroundTertiary}
      />
    </View>
  );
}

export default function AdminServicesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const { data: services = [], isLoading, refetch } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiRequest("PUT", `/api/services/${id}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to update service");
    },
  });

  const handleToggle = (service: Service, isActive: boolean) => {
    updateMutation.mutate({ id: service.id, isActive });
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
      data={services}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ServiceItem
          service={item}
          onToggle={(isActive) => handleToggle(item, isActive)}
        />
      )}
      ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      showsVerticalScrollIndicator={false}
      onRefresh={refetch}
      refreshing={isLoading}
      ListHeaderComponent={
        <View style={styles.header}>
          <Feather name="info" size={16} color={theme.textSecondary} />
          <ThemedText type="small" secondary style={styles.headerText}>
            Toggle services on/off to control their visibility in the app
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    padding: Spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceInfo: {
    flex: 1,
  },
});
