import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ServicesScreen from "@/screens/ServicesScreen";
import ServiceDetailScreen from "@/screens/ServiceDetailScreen";
import InquiryFormScreen from "@/screens/InquiryFormScreen";
import PricingCalculatorScreen from "@/screens/PricingCalculatorScreen";
import ProjectTrackerScreen from "@/screens/ProjectTrackerScreen";
import ContractGeneratorScreen from "@/screens/ContractGeneratorScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type ServicesStackParamList = {
  Services: undefined;
  ServiceDetail: { id: string };
  InquiryForm: { serviceId?: string; serviceName?: string };
  PricingCalculator: undefined;
  ProjectTracker: undefined;
  ContractGenerator: undefined;
};

const Stack = createNativeStackNavigator<ServicesStackParamList>();

export default function ServicesStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Services"
        component={ServicesScreen}
        options={{ headerTitle: "Services" }}
      />
      <Stack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
        options={{ headerTitle: "Service Details" }}
      />
      <Stack.Screen
        name="InquiryForm"
        component={InquiryFormScreen}
        options={{
          headerTitle: "Submit Inquiry",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="PricingCalculator"
        component={PricingCalculatorScreen}
        options={{ headerTitle: "Pricing Calculator" }}
      />
      <Stack.Screen
        name="ProjectTracker"
        component={ProjectTrackerScreen}
        options={{ headerTitle: "Track Project" }}
      />
      <Stack.Screen
        name="ContractGenerator"
        component={ContractGeneratorScreen}
        options={{ headerTitle: "Contract Generator" }}
      />
    </Stack.Navigator>
  );
}
