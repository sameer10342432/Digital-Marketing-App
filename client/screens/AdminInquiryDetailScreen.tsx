import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator, Alert, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import type { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import type { Inquiry } from "@shared/schema";

type RouteParams = RouteProp<HomeStackParamList, "AdminInquiryDetail">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const STATUS_OPTIONS: { value: Inquiry["status"]; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: Colors.warning },
  { value: "in_progress", label: "In Progress", color: Colors.primary },
  { value: "completed", label: "Completed", color: Colors.success },
];

export default function AdminInquiryDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const queryClient = useQueryClient();
  const { id } = route.params;

  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const scale = useSharedValue(1);

  const { data: inquiry, isLoading } = useQuery<Inquiry>({
    queryKey: ["/api/inquiries", id],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Inquiry>) => {
      const response = await apiRequest("PUT", `/api/inquiries/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/inquiries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      navigation.goBack();
    },
  });

  React.useEffect(() => {
    if (inquiry?.adminNotes) {
      setNotes(inquiry.adminNotes);
    }
  }, [inquiry]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleStatusChange = (status: Inquiry["status"]) => {
    updateMutation.mutate({ status });
  };

  const handleSaveNotes = () => {
    updateMutation.mutate({ adminNotes: notes });
    setShowNotes(false);
    Alert.alert("Success", "Notes saved successfully");
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Inquiry",
      "Are you sure you want to delete this inquiry? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (isLoading || !inquiry) {
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
      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Status
        </ThemedText>
        <View style={styles.statusButtons}>
          {STATUS_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => handleStatusChange(option.value)}
              style={[
                styles.statusButton,
                {
                  backgroundColor:
                    inquiry.status === option.value
                      ? option.color
                      : theme.backgroundDefault,
                  borderColor:
                    inquiry.status === option.value ? option.color : theme.border,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color: inquiry.status === option.value ? "#FFFFFF" : theme.text,
                  fontWeight: "600",
                }}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View
        style={[
          styles.detailCard,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        ]}
      >
        <View style={styles.detailRow}>
          <Feather name="user" size={18} color={theme.textSecondary} />
          <View style={styles.detailContent}>
            <ThemedText type="caption" secondary>
              Full Name
            </ThemedText>
            <ThemedText type="body">{inquiry.fullName}</ThemedText>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Feather name="mail" size={18} color={theme.textSecondary} />
          <View style={styles.detailContent}>
            <ThemedText type="caption" secondary>
              Email
            </ThemedText>
            <ThemedText type="body">{inquiry.email}</ThemedText>
          </View>
        </View>

        {inquiry.phone ? (
          <View style={styles.detailRow}>
            <Feather name="phone" size={18} color={theme.textSecondary} />
            <View style={styles.detailContent}>
              <ThemedText type="caption" secondary>
                Phone
              </ThemedText>
              <ThemedText type="body">{inquiry.phone}</ThemedText>
            </View>
          </View>
        ) : null}

        <View style={styles.detailRow}>
          <Feather name="briefcase" size={18} color={theme.textSecondary} />
          <View style={styles.detailContent}>
            <ThemedText type="caption" secondary>
              Service
            </ThemedText>
            <ThemedText type="body">{inquiry.serviceCategory}</ThemedText>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Feather name="dollar-sign" size={18} color={theme.textSecondary} />
          <View style={styles.detailContent}>
            <ThemedText type="caption" secondary>
              Budget Range
            </ThemedText>
            <ThemedText type="body">{inquiry.budgetRange}</ThemedText>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Feather name="calendar" size={18} color={theme.textSecondary} />
          <View style={styles.detailContent}>
            <ThemedText type="caption" secondary>
              Submitted
            </ThemedText>
            <ThemedText type="body">{formatDate(inquiry.createdAt)}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Message
        </ThemedText>
        <View
          style={[
            styles.messageCard,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <ThemedText type="body">{inquiry.message}</ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="h4">Admin Notes</ThemedText>
          {!showNotes ? (
            <Pressable onPress={() => setShowNotes(true)}>
              <ThemedText type="small" style={{ color: Colors.primary }}>
                {inquiry.adminNotes ? "Edit" : "Add Note"}
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
        {showNotes ? (
          <View>
            <TextInput
              style={[
                styles.notesInput,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about this inquiry..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.notesActions}>
              <Pressable
                onPress={() => setShowNotes(false)}
                style={[styles.notesButton, { borderColor: theme.border }]}
              >
                <ThemedText type="small">Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveNotes}
                style={[styles.notesButton, { backgroundColor: Colors.primary }]}
              >
                <ThemedText type="small" style={{ color: "#FFFFFF" }}>
                  Save Notes
                </ThemedText>
              </Pressable>
            </View>
          </View>
        ) : inquiry.adminNotes ? (
          <View
            style={[
              styles.messageCard,
              { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            ]}
          >
            <ThemedText type="body">{inquiry.adminNotes}</ThemedText>
          </View>
        ) : (
          <ThemedText type="body" secondary>
            No notes added yet
          </ThemedText>
        )}
      </View>

      <AnimatedPressable
        onPressIn={() => {
          scale.value = withSpring(0.96);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={handleDelete}
        style={[styles.deleteButton, animatedButtonStyle]}
      >
        <Feather name="trash-2" size={18} color={Colors.error} />
        <ThemedText type="button" style={{ color: Colors.error }}>
          Delete Inquiry
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
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  statusButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  statusButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  detailCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  messageCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  notesInput: {
    minHeight: 100,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
    marginBottom: Spacing.sm,
  },
  notesActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  notesButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    gap: Spacing.sm,
  },
});
