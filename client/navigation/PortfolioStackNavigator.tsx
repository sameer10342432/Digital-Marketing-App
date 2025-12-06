import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PortfolioScreen from "@/screens/PortfolioScreen";
import PortfolioDetailScreen from "@/screens/PortfolioDetailScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type PortfolioStackParamList = {
  Portfolio: undefined;
  PortfolioDetail: { id: string };
};

const Stack = createNativeStackNavigator<PortfolioStackParamList>();

export default function PortfolioStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{ headerTitle: "Portfolio" }}
      />
      <Stack.Screen
        name="PortfolioDetail"
        component={PortfolioDetailScreen}
        options={{ headerTitle: "Project Details" }}
      />
    </Stack.Navigator>
  );
}
