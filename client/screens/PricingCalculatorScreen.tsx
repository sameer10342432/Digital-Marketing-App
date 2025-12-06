import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
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
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import type { ServicesStackParamList } from "@/navigation/ServicesStackNavigator";
import type { Service } from "@shared/schema";

type NavigationProp = NativeStackNavigationProp<ServicesStackParamList>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const COMPLEXITY_OPTIONS = [
  { id: "basic", label: "Basic", multiplier: 1.0, description: "Simple requirements" },
  { id: "standard", label: "Standard", multiplier: 1.5, description: "Moderate complexity" },
  { id: "premium", label: "Premium", multiplier: 2.5, description: "Complex features" },
];

const SPEED_OPTIONS = [
  { id: "standard", label: "Standard", multiplier: 1.0, days: "14-21 days" },
  { id: "express", label: "Express", multiplier: 1.3, days: "7-10 days" },
  { id: "urgent", label: "Urgent", multiplier: 1.6, days: "3-5 days" },
];

const ADD_ONS = [
  { id: "revisions", label: "Extra Revisions (+3)", price: 150 },
  { id: "priority", label: "Priority Support", price: 200 },
  { id: "source", label: "Source Files", price: 100 },
  { id: "maintenance", label: "30-Day Maintenance", price: 300 },
  { id: "analytics", label: "Analytics Setup", price: 250 },
  { id: "seo", label: "SEO Optimization", price: 350 },
];

interface SelectionCardProps {
  selected: boolean;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function SelectionCard({ selected, title, subtitle, onPress }: SelectionCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
      style={[
        styles.selectionCard,
        {
          backgroundColor: selected ? Colors.primary + "15" : theme.backgroundDefault,
          borderColor: selected ? Colors.primary : theme.border,
          borderWidth: selected ? 2 : 1,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.selectionCardContent}>
        <ThemedText type="body" style={selected ? { color: Colors.primary, fontWeight: "600" } : undefined}>
          {title}
        </ThemedText>
        <ThemedText type="small" style={{ opacity: 0.7 }}>
          {subtitle}
        </ThemedText>
      </View>
      {selected && (
        <View style={[styles.checkIcon, { backgroundColor: Colors.primary }]}>
          <Feather name="check" size={14} color="#FFFFFF" />
        </View>
      )}
    </AnimatedPressable>
  );
}

interface AddOnRowProps {
  label: string;
  price: number;
  enabled: boolean;
  onToggle: () => void;
}

function AddOnRow({ label, price, enabled, onToggle }: AddOnRowProps) {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.addOnRow, { borderBottomColor: theme.border }]}>
      <View style={styles.addOnInfo}>
        <ThemedText type="body">{label}</ThemedText>
        <ThemedText type="small" style={{ opacity: 0.6 }}>+${price}</ThemedText>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: theme.border, true: Colors.primary + "80" }}
        thumbColor={enabled ? Colors.primary : theme.tabIconDefault}
      />
    </View>
  );
}

export default function PricingCalculatorScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedComplexity, setSelectedComplexity] = useState("standard");
  const [selectedSpeed, setSelectedSpeed] = useState("standard");
  const [enabledAddOns, setEnabledAddOns] = useState<Record<string, boolean>>({});

  const selectedServiceData = useMemo(() => {
    return services.find(s => s.id === selectedService);
  }, [services, selectedService]);

  const basePrice = useMemo(() => {
    if (!selectedServiceData) return 0;
    const priceStr = selectedServiceData.startingPrice.replace(/[^0-9]/g, "");
    return parseInt(priceStr, 10) || 500;
  }, [selectedServiceData]);

  const calculation = useMemo(() => {
    const complexity = COMPLEXITY_OPTIONS.find(c => c.id === selectedComplexity);
    const speed = SPEED_OPTIONS.find(s => s.id === selectedSpeed);
    
    const complexityMultiplier = complexity?.multiplier || 1;
    const speedMultiplier = speed?.multiplier || 1;
    
    let subtotal = basePrice * complexityMultiplier * speedMultiplier;
    
    let addOnsTotal = 0;
    ADD_ONS.forEach(addOn => {
      if (enabledAddOns[addOn.id]) {
        addOnsTotal += addOn.price;
      }
    });
    
    const total = subtotal + addOnsTotal;
    const lowEstimate = Math.round(total * 0.9);
    const highEstimate = Math.round(total * 1.1);
    
    return {
      subtotal: Math.round(subtotal),
      addOnsTotal,
      total: Math.round(total),
      lowEstimate,
      highEstimate,
      deliveryTime: speed?.days || "14-21 days",
    };
  }, [basePrice, selectedComplexity, selectedSpeed, enabledAddOns]);

  const deliverables = useMemo(() => {
    const items: string[] = [];
    if (selectedServiceData) {
      items.push(...(selectedServiceData.deliverables || []));
    }
    
    const complexity = COMPLEXITY_OPTIONS.find(c => c.id === selectedComplexity);
    if (complexity?.id === "standard") {
      items.push("Standard documentation");
    } else if (complexity?.id === "premium") {
      items.push("Comprehensive documentation", "Training session");
    }
    
    ADD_ONS.forEach(addOn => {
      if (enabledAddOns[addOn.id]) {
        items.push(addOn.label);
      }
    });
    
    return items;
  }, [selectedServiceData, selectedComplexity, enabledAddOns]);

  const toggleAddOn = (id: string) => {
    setEnabledAddOns(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleProceed = () => {
    navigation.navigate("InquiryForm", {
      serviceId: selectedService || undefined,
      serviceName: selectedServiceData?.name,
    });
  };

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
        <ThemedText type="h3" style={styles.sectionTitle}>
          Select Service
        </ThemedText>
        <View style={styles.servicesGrid}>
          {services.map(service => (
            <SelectionCard
              key={service.id}
              selected={selectedService === service.id}
              title={service.name}
              subtitle={`From ${service.startingPrice}`}
              onPress={() => setSelectedService(service.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Work Complexity
        </ThemedText>
        <View style={styles.optionsRow}>
          {COMPLEXITY_OPTIONS.map(option => (
            <SelectionCard
              key={option.id}
              selected={selectedComplexity === option.id}
              title={option.label}
              subtitle={option.description}
              onPress={() => setSelectedComplexity(option.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Delivery Speed
        </ThemedText>
        <View style={styles.optionsRow}>
          {SPEED_OPTIONS.map(option => (
            <SelectionCard
              key={option.id}
              selected={selectedSpeed === option.id}
              title={option.label}
              subtitle={option.days}
              onPress={() => setSelectedSpeed(option.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Add-On Features
        </ThemedText>
        <ThemedView style={[styles.addOnsCard, { borderColor: theme.border }]}>
          {ADD_ONS.map(addOn => (
            <AddOnRow
              key={addOn.id}
              label={addOn.label}
              price={addOn.price}
              enabled={enabledAddOns[addOn.id] || false}
              onToggle={() => toggleAddOn(addOn.id)}
            />
          ))}
        </ThemedView>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Estimate Summary
        </ThemedText>
        <ThemedView style={[styles.summaryCard, { borderColor: theme.border }]}>
          <View style={styles.priceRow}>
            <ThemedText type="body">Base Service</ThemedText>
            <ThemedText type="body">${calculation.subtotal}</ThemedText>
          </View>
          {calculation.addOnsTotal > 0 && (
            <View style={styles.priceRow}>
              <ThemedText type="body">Add-Ons</ThemedText>
              <ThemedText type="body">+${calculation.addOnsTotal}</ThemedText>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow, { borderTopColor: theme.border }]}>
            <ThemedText type="h3">Estimated Range</ThemedText>
            <ThemedText type="h3" style={{ color: Colors.primary }}>
              ${calculation.lowEstimate} - ${calculation.highEstimate}
            </ThemedText>
          </View>
          <View style={styles.deliveryRow}>
            <Feather name="clock" size={16} color={theme.tabIconDefault} />
            <ThemedText type="small" style={{ opacity: 0.7 }}>
              Estimated delivery: {calculation.deliveryTime}
            </ThemedText>
          </View>
        </ThemedView>
      </View>

      {deliverables.length > 0 && (
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Included Deliverables
          </ThemedText>
          <ThemedView style={[styles.deliverablesCard, { borderColor: theme.border }]}>
            {deliverables.map((item, index) => (
              <View key={index} style={styles.deliverableRow}>
                <Feather name="check-circle" size={16} color={Colors.primary} />
                <ThemedText type="body" style={styles.deliverableText}>
                  {item}
                </ThemedText>
              </View>
            ))}
          </ThemedView>
        </View>
      )}

      <View style={styles.ctaSection}>
        <Pressable
          style={[styles.ctaButton, { backgroundColor: Colors.primary }]}
          onPress={handleProceed}
        >
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
          <ThemedText type="button" style={styles.ctaButtonText}>
            Proceed to Inquiry
          </ThemedText>
        </Pressable>
        <ThemedText type="small" style={styles.disclaimer}>
          Final pricing may vary based on specific requirements discussed during consultation.
        </ThemedText>
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
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  servicesGrid: {
    gap: Spacing.sm,
  },
  optionsRow: {
    gap: Spacing.sm,
  },
  selectionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  selectionCardContent: {
    flex: 1,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addOnsCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  addOnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  addOnInfo: {
    flex: 1,
  },
  summaryCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  totalRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    marginBottom: Spacing.md,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  deliverablesCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  deliverableRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  deliverableText: {
    flex: 1,
  },
  ctaSection: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    marginTop: Spacing.md,
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
    color: "#FFFFFF",
    fontWeight: "600",
  },
  disclaimer: {
    textAlign: "center",
    opacity: 0.6,
  },
});
