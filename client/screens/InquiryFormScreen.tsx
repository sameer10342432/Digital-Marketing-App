import React, { useState } from "react";
import { View, StyleSheet, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import type { ServicesStackParamList } from "@/navigation/ServicesStackNavigator";
import type { Service } from "@shared/schema";

type RouteParams = RouteProp<ServicesStackParamList, "InquiryForm">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const BUDGET_OPTIONS = ["< $500", "$500 - $1,000", "$1,000 - $5,000", "$5,000 - $10,000", "$10,000+"];

export default function InquiryFormScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const queryClient = useQueryClient();

  const { serviceId, serviceName } = route.params || {};

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedService, setSelectedService] = useState(serviceName || "");
  const [budgetRange, setBudgetRange] = useState("");
  const [message, setMessage] = useState("");
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [showBudgetPicker, setShowBudgetPicker] = useState(false);

  const scale = useSharedValue(1);

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/inquiries", {
        fullName,
        email,
        phone: phone || null,
        serviceCategory: selectedService,
        budgetRange,
        message,
        attachmentUrl: null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
      Alert.alert(
        "Inquiry Submitted",
        "Thank you for your inquiry! We will get back to you soon.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to submit inquiry. Please try again.");
    },
  });

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isValid = fullName && email && selectedService && budgetRange && message;

  const handleSubmit = () => {
    if (!isValid) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }
    submitMutation.mutate();
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={handleSubmit}
          disabled={!isValid || submitMutation.isPending}
          hitSlop={8}
        >
          {submitMutation.isPending ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <ThemedText
              type="button"
              style={{ color: isValid ? Colors.primary : theme.textSecondary }}
            >
              Submit
            </ThemedText>
          )}
        </Pressable>
      ),
    });
  }, [navigation, isValid, submitMutation.isPending, theme]);

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.md,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.md,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.field}>
        <ThemedText type="small" style={styles.label}>
          Full Name *
        </ThemedText>
        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="small" style={styles.label}>
          Email *
        </ThemedText>
        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor={theme.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="small" style={styles.label}>
          Phone (Optional)
        </ThemedText>
        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter your phone number"
          placeholderTextColor={theme.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="small" style={styles.label}>
          Service Category *
        </ThemedText>
        <Pressable
          style={[styles.picker, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          onPress={() => setShowServicePicker(!showServicePicker)}
        >
          <ThemedText type="body" secondary={!selectedService}>
            {selectedService || "Select a service"}
          </ThemedText>
          <Feather name="chevron-down" size={20} color={theme.textSecondary} />
        </Pressable>
        {showServicePicker ? (
          <View style={[styles.pickerOptions, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            {services.map((service) => (
              <Pressable
                key={service.id}
                style={[
                  styles.pickerOption,
                  selectedService === service.name && { backgroundColor: Colors.primary + "15" },
                ]}
                onPress={() => {
                  setSelectedService(service.name);
                  setShowServicePicker(false);
                }}
              >
                <ThemedText type="body">{service.name}</ThemedText>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.field}>
        <ThemedText type="small" style={styles.label}>
          Budget Range *
        </ThemedText>
        <Pressable
          style={[styles.picker, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          onPress={() => setShowBudgetPicker(!showBudgetPicker)}
        >
          <ThemedText type="body" secondary={!budgetRange}>
            {budgetRange || "Select your budget"}
          </ThemedText>
          <Feather name="chevron-down" size={20} color={theme.textSecondary} />
        </Pressable>
        {showBudgetPicker ? (
          <View style={[styles.pickerOptions, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            {BUDGET_OPTIONS.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.pickerOption,
                  budgetRange === option && { backgroundColor: Colors.primary + "15" },
                ]}
                onPress={() => {
                  setBudgetRange(option);
                  setShowBudgetPicker(false);
                }}
              >
                <ThemedText type="body">{option}</ThemedText>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.field}>
        <ThemedText type="small" style={styles.label}>
          Project Requirements *
        </ThemedText>
        <TextInput
          style={[styles.textArea, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
          value={message}
          onChangeText={setMessage}
          placeholder="Describe your project requirements..."
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <AnimatedPressable
        onPressIn={() => {
          scale.value = withSpring(0.96);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={handleSubmit}
        disabled={!isValid || submitMutation.isPending}
        style={[
          styles.submitButton,
          { opacity: isValid ? 1 : 0.5 },
          animatedButtonStyle,
        ]}
      >
        {submitMutation.isPending ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Feather name="send" size={18} color="#FFFFFF" />
            <ThemedText type="button" style={styles.submitButtonText}>
              Submit Inquiry
            </ThemedText>
          </>
        )}
      </AnimatedPressable>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  field: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
  },
  textArea: {
    minHeight: 120,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
  },
  picker: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerOptions: {
    marginTop: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  pickerOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  submitButtonText: {
    color: "#FFFFFF",
  },
});
