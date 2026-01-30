// App.tsx
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from 'expo-font';

import { RootNavigator } from "./src/app/navigation/RootNavigator";
import { validateEnv } from "./src/app/config/env";
import { queryClient } from "./src/app/config/queryClient";

export default function App() {
  const [fontsLoaded] = useFonts({
    'Hakgyoansim_EohangkkumigiOTFB': require('./assets/fonts/Hakgyoansim_EohangkkumigiOTFB.otf'),
    'Jalnan2': require('./assets/fonts/Jalnan2.otf'),
  });

  useEffect(() => {
    validateEnv();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.container}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="dark" backgroundColor="#000000" />
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
