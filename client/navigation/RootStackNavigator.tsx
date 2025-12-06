import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import InquiryFormScreen from "@/screens/InquiryFormScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  InquiryModal: { serviceId?: string; serviceName?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InquiryModal"
        component={InquiryFormScreen}
        options={{
          presentation: "modal",
          headerTitle: "Request a Quote",
        }}
      />
    </Stack.Navigator>
  );
}
