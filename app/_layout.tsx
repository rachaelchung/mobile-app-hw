import {
  Caveat_400Regular,
  useFonts as useCaveatFonts,
} from "@expo-google-fonts/caveat";
import {
  Nunito_400Regular,
  Nunito_700Bold,
  useFonts as useNunitoFonts,
} from "@expo-google-fonts/nunito";
import { PressStart2P_400Regular, useFonts } from "@expo-google-fonts/press-start-2p";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MementosProvider } from "@/context/MementosContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [pixelLoaded] = useFonts({ PressStart2P_400Regular });
  const [nunitoLoaded] = useNunitoFonts({ Nunito_400Regular, Nunito_700Bold });
  const [caveatLoaded] = useCaveatFonts({ Caveat_400Regular });

  const loaded = pixelLoaded && nunitoLoaded && caveatLoaded;

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <MementosProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </MementosProvider>
    </SafeAreaProvider>
  );
}
