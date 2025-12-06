import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import type { Service, Contract } from "@shared/schema";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DEFAULT_TERMS = `1. SCOPE OF WORK
The service provider agrees to deliver the services and deliverables as described in this contract.

2. PAYMENT TERMS
Payment is due according to the agreed schedule. A deposit may be required before work begins.

3. TIMELINE
The estimated timeline is provided as a guideline. Actual delivery may vary based on project complexity.

4. REVISIONS
Standard revision rounds are included as specified. Additional revisions may incur extra charges.

5. INTELLECTUAL PROPERTY
Upon full payment, all deliverables become the property of the client.

6. CONFIDENTIALITY
Both parties agree to keep all project information confidential.

7. CANCELLATION
Either party may cancel with written notice. Completed work will be billed.`;

interface SelectableCardProps {
  selected: boolean;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

function SelectableCard({ selected, title, subtitle, onPress }: SelectableCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.97); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
      style={[
        styles.selectableCard,
        {
          backgroundColor: selected ? Colors.primary + "15" : theme.backgroundDefault,
          borderColor: selected ? Colors.primary : theme.border,
          borderWidth: selected ? 2 : 1,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.selectableCardContent}>
        <ThemedText type="body" style={selected ? { color: Colors.primary, fontWeight: "600" } : undefined}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText type="small" style={{ opacity: 0.7 }}>
            {subtitle}
          </ThemedText>
        )}
      </View>
      {selected && (
        <View style={[styles.checkIcon, { backgroundColor: Colors.primary }]}>
          <Feather name="check" size={14} color="#FFFFFF" />
        </View>
      )}
    </AnimatedPressable>
  );
}

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

function FormInput({ label, value, onChangeText, placeholder, multiline, numberOfLines }: FormInputProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.formField}>
      <ThemedText type="body" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      <TextInput
        style={[
          styles.textInput,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor: theme.border,
            color: theme.text,
          },
          multiline && { height: numberOfLines ? numberOfLines * 24 : 100, textAlignVertical: "top" },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.tabIconDefault}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
  );
}

export default function ContractGeneratorScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [projectScope, setProjectScope] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [timeline, setTimeline] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [customTerms, setCustomTerms] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  const selectedServiceData = useMemo(() => {
    return services.find((s) => s.id === selectedService);
  }, [services, selectedService]);

  const contractContent = useMemo(() => {
    const deliverablesArray = deliverables
      .split("\n")
      .filter((d) => d.trim())
      .map((d) => d.trim());

    const terms = customTerms.trim() || DEFAULT_TERMS;

    return {
      clientName: clientName,
      serviceSelected: selectedServiceData?.name || "",
      projectScope: projectScope,
      deliverables: deliverablesArray,
      timeline: timeline,
      totalAmount: totalAmount,
      termsAndConditions: terms,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  }, [clientName, selectedServiceData, projectScope, deliverables, timeline, totalAmount, customTerms]);

  const handleGeneratePreview = () => {
    if (!clientName.trim()) {
      Alert.alert("Error", "Please enter client name");
      return;
    }
    if (!selectedService) {
      Alert.alert("Error", "Please select a service");
      return;
    }
    if (!projectScope.trim()) {
      Alert.alert("Error", "Please describe the project scope");
      return;
    }
    if (!timeline.trim()) {
      Alert.alert("Error", "Please specify the timeline");
      return;
    }
    if (!totalAmount.trim()) {
      Alert.alert("Error", "Please specify the total amount");
      return;
    }
    const deliverablesArray = deliverables
      .split("\n")
      .filter((d) => d.trim());
    if (deliverablesArray.length === 0) {
      Alert.alert("Error", "Please add at least one deliverable");
      return;
    }
    setPreviewMode(true);
  };

  const createContractMutation = useMutation({
    mutationFn: async (contractData: {
      clientId: string;
      clientName: string;
      serviceSelected: string;
      projectScope: string;
      deliverables: string[];
      timeline: string;
      totalAmount: string;
      termsAndConditions: string;
    }) => {
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contractData),
      });
      if (!response.ok) throw new Error("Failed to create contract");
      return response.json();
    },
    onSuccess: () => {
      Alert.alert(
        "Contract Saved",
        "Your contract has been saved successfully. You can now share it or create a new one.",
        [
          {
            text: "Create New",
            onPress: () => {
              setClientName("");
              setClientEmail("");
              setSelectedService(null);
              setProjectScope("");
              setDeliverables("");
              setTimeline("");
              setTotalAmount("");
              setCustomTerms("");
              setPreviewMode(false);
            },
          },
          { text: "Stay on Preview", style: "cancel" },
        ]
      );
    },
    onError: () => {
      Alert.alert("Error", "Failed to save contract. Please try again.");
    },
  });

  const handleSaveContract = async () => {
    if (!clientName.trim()) {
      Alert.alert("Error", "Please enter client name");
      return;
    }
    if (!clientEmail.trim()) {
      Alert.alert("Error", "Please enter client email to save the contract");
      return;
    }
    if (!selectedServiceData) {
      Alert.alert("Error", "Please select a service");
      return;
    }
    if (!projectScope.trim()) {
      Alert.alert("Error", "Please describe the project scope");
      return;
    }
    if (!timeline.trim()) {
      Alert.alert("Error", "Please specify the timeline");
      return;
    }
    if (!totalAmount.trim()) {
      Alert.alert("Error", "Please specify the total amount");
      return;
    }

    const deliverablesArray = deliverables
      .split("\n")
      .filter((d) => d.trim())
      .map((d) => d.trim());

    if (deliverablesArray.length === 0) {
      Alert.alert("Error", "Please add at least one deliverable");
      return;
    }

    const terms = customTerms.trim() || DEFAULT_TERMS;

    createContractMutation.mutate({
      clientId: clientEmail.trim(),
      clientName: clientName.trim(),
      serviceSelected: selectedServiceData.name,
      projectScope: projectScope.trim(),
      deliverables: deliverablesArray,
      timeline: timeline.trim(),
      totalAmount: totalAmount.trim(),
      termsAndConditions: terms,
    });
  };

  const handleShare = async () => {
    const contractText = `
SERVICE CONTRACT

Date: ${contractContent.date}

Client: ${contractContent.clientName}
Service: ${contractContent.serviceSelected}

PROJECT SCOPE
${contractContent.projectScope}

DELIVERABLES
${contractContent.deliverables.map((d, i) => `${i + 1}. ${d}`).join("\n")}

TIMELINE
${contractContent.timeline}

TOTAL AMOUNT
${contractContent.totalAmount}

TERMS AND CONDITIONS
${contractContent.termsAndConditions}

---
Generated by Sammer Digital Agency
    `.trim();

    try {
      await Share.share({
        message: contractText,
        title: "Service Contract",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share contract");
    }
  };

  if (previewMode) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: insets.bottom + Spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.previewHeader}>
          <Pressable
            style={[styles.backButton, { backgroundColor: theme.backgroundDefault }]}
            onPress={() => setPreviewMode(false)}
          >
            <Feather name="arrow-left" size={20} color={theme.text} />
            <ThemedText type="body">Edit</ThemedText>
          </Pressable>
          <View style={styles.previewActions}>
            <Pressable
              style={[styles.saveButton, { backgroundColor: Colors.primary + "20", borderColor: Colors.primary }]}
              onPress={handleSaveContract}
              disabled={createContractMutation.isPending}
            >
              <Feather name="save" size={18} color={Colors.primary} />
              <ThemedText type="body" style={{ color: Colors.primary, fontWeight: "600" }}>
                {createContractMutation.isPending ? "Saving..." : "Save"}
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.shareButton, { backgroundColor: Colors.primary }]}
              onPress={handleShare}
            >
              <Feather name="share-2" size={18} color="#FFFFFF" />
              <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Share
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <ThemedView style={[styles.contractDocument, { borderColor: theme.border }]}>
          <View style={styles.contractHeader}>
            <ThemedText type="h2">SERVICE CONTRACT</ThemedText>
            <ThemedText type="small" style={{ opacity: 0.6 }}>
              Date: {contractContent.date}
            </ThemedText>
          </View>

          <View style={styles.contractSection}>
            <ThemedText type="h4">Client Information</ThemedText>
            <ThemedText type="body">{contractContent.clientName}</ThemedText>
          </View>

          <View style={styles.contractSection}>
            <ThemedText type="h4">Service Selected</ThemedText>
            <ThemedText type="body">{contractContent.serviceSelected}</ThemedText>
          </View>

          <View style={styles.contractSection}>
            <ThemedText type="h4">Project Scope</ThemedText>
            <ThemedText type="body">{contractContent.projectScope}</ThemedText>
          </View>

          <View style={styles.contractSection}>
            <ThemedText type="h4">Deliverables</ThemedText>
            {contractContent.deliverables.map((item, index) => (
              <View key={index} style={styles.deliverableItem}>
                <ThemedText type="body">{index + 1}. {item}</ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.contractSection}>
            <ThemedText type="h4">Timeline</ThemedText>
            <ThemedText type="body">{contractContent.timeline}</ThemedText>
          </View>

          <View style={styles.contractSection}>
            <ThemedText type="h4">Total Amount</ThemedText>
            <ThemedText type="h3" style={{ color: Colors.primary }}>
              {contractContent.totalAmount}
            </ThemedText>
          </View>

          <View style={[styles.contractSection, styles.termsSection]}>
            <ThemedText type="h4">Terms and Conditions</ThemedText>
            <ThemedText type="small" style={styles.termsText}>
              {contractContent.termsAndConditions}
            </ThemedText>
          </View>

          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <View style={[styles.signatureLine, { borderColor: theme.border }]} />
              <ThemedText type="small">Client Signature</ThemedText>
            </View>
            <View style={styles.signatureBox}>
              <View style={[styles.signatureLine, { borderColor: theme.border }]} />
              <ThemedText type="small">Service Provider</ThemedText>
            </View>
          </View>
        </ThemedView>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.md,
        paddingBottom: insets.bottom + Spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <ThemedText type="h2" style={styles.title}>
          Contract Generator
        </ThemedText>
        <ThemedText type="body" style={styles.subtitle}>
          Create a professional service contract for your project.
        </ThemedText>
      </View>

      <View style={styles.formSection}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Client Information
        </ThemedText>
        <FormInput
          label="Client Name"
          value={clientName}
          onChangeText={setClientName}
          placeholder="Enter client's full name"
        />
        <FormInput
          label="Client Email"
          value={clientEmail}
          onChangeText={setClientEmail}
          placeholder="Enter client's email"
        />
      </View>

      <View style={styles.formSection}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Select Service
        </ThemedText>
        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <SelectableCard
              key={service.id}
              selected={selectedService === service.id}
              title={service.name}
              subtitle={`From ${service.startingPrice}`}
              onPress={() => setSelectedService(service.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.formSection}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Project Details
        </ThemedText>
        <FormInput
          label="Project Scope"
          value={projectScope}
          onChangeText={setProjectScope}
          placeholder="Describe the project scope and objectives..."
          multiline
          numberOfLines={4}
        />
        <FormInput
          label="Deliverables (one per line)"
          value={deliverables}
          onChangeText={setDeliverables}
          placeholder="Website design\nSource code\nDocumentation"
          multiline
          numberOfLines={4}
        />
        <FormInput
          label="Timeline"
          value={timeline}
          onChangeText={setTimeline}
          placeholder="e.g., 4-6 weeks"
        />
        <FormInput
          label="Total Amount"
          value={totalAmount}
          onChangeText={setTotalAmount}
          placeholder="e.g., $2,500"
        />
      </View>

      <View style={styles.formSection}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Terms & Conditions
        </ThemedText>
        <ThemedText type="small" style={styles.termsNote}>
          Leave blank to use standard terms, or customize below:
        </ThemedText>
        <FormInput
          label=""
          value={customTerms}
          onChangeText={setCustomTerms}
          placeholder="Custom terms and conditions..."
          multiline
          numberOfLines={6}
        />
      </View>

      <View style={styles.ctaSection}>
        <Pressable
          style={[styles.generateButton, { backgroundColor: Colors.primary }]}
          onPress={handleGeneratePreview}
        >
          <Feather name="file-text" size={20} color="#FFFFFF" />
          <ThemedText type="button" style={styles.buttonText}>
            Generate Contract Preview
          </ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    opacity: 0.7,
  },
  formSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  formField: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  textInput: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 16,
  },
  servicesGrid: {
    gap: Spacing.sm,
  },
  selectableCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  selectableCardContent: {
    flex: 1,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  termsNote: {
    opacity: 0.6,
    marginBottom: Spacing.sm,
  },
  ctaSection: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  previewActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  contractDocument: {
    marginHorizontal: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  contractHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  contractSection: {
    marginBottom: Spacing.lg,
  },
  deliverableItem: {
    marginTop: Spacing.xs,
  },
  termsSection: {
    marginTop: Spacing.md,
  },
  termsText: {
    marginTop: Spacing.sm,
    lineHeight: 20,
    opacity: 0.8,
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.xl,
    gap: Spacing.lg,
  },
  signatureBox: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.sm,
  },
  signatureLine: {
    width: "100%",
    height: 0,
    borderBottomWidth: 1,
  },
});
