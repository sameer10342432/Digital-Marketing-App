import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import AdminLoginScreen from "@/screens/AdminLoginScreen";
import AdminDashboardScreen from "@/screens/AdminDashboardScreen";
import AdminInquiriesScreen from "@/screens/AdminInquiriesScreen";
import AdminInquiryDetailScreen from "@/screens/AdminInquiryDetailScreen";
import AdminPortfolioScreen from "@/screens/AdminPortfolioScreen";
import AdminServicesScreen from "@/screens/AdminServicesScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";

export type HomeStackParamList = {
  Home: undefined;
  Settings: undefined;
  AdminLogin: undefined;
  AdminDashboard: undefined;
  AdminInquiries: undefined;
  AdminInquiryDetail: { id: string };
  AdminPortfolio: undefined;
  AdminServices: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Sammer" />,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerTitle: "Settings" }}
      />
      <Stack.Screen
        name="AdminLogin"
        component={AdminLoginScreen}
        options={{ headerTitle: "Admin Login" }}
      />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ headerTitle: "Dashboard" }}
      />
      <Stack.Screen
        name="AdminInquiries"
        component={AdminInquiriesScreen}
        options={{ headerTitle: "Inquiries" }}
      />
      <Stack.Screen
        name="AdminInquiryDetail"
        component={AdminInquiryDetailScreen}
        options={{ headerTitle: "Inquiry Details" }}
      />
      <Stack.Screen
        name="AdminPortfolio"
        component={AdminPortfolioScreen}
        options={{ headerTitle: "Manage Portfolio" }}
      />
      <Stack.Screen
        name="AdminServices"
        component={AdminServicesScreen}
        options={{ headerTitle: "Manage Services" }}
      />
    </Stack.Navigator>
  );
}
