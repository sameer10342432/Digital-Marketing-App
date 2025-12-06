import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AboutScreen from "@/screens/AboutScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type AboutStackParamList = {
  About: undefined;
};

const Stack = createNativeStackNavigator<AboutStackParamList>();

export default function AboutStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ headerTitle: "About" }}
      />
    </Stack.Navigator>
  );
}
