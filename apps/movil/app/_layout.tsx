import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
} from '@expo-google-fonts/archivo';
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

void SplashScreen.preventAutoHideAsync();

export default function DisenoRaiz() {
  const [fuentesCargadas, errorFuentes] = useFonts({
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    ArchivoCondensed_700Bold: require('../assets/fuentes/Archivo-Condensed-Bold.ttf'),
    ArchivoExtraCondensed_800ExtraBold: require('../assets/fuentes/Archivo-ExtraCondensed-ExtraBold.ttf'),
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });

  useEffect(() => {
    if (fuentesCargadas || errorFuentes) {
      void SplashScreen.hideAsync();
    }
  }, [errorFuentes, fuentesCargadas]);

  if (!fuentesCargadas && !errorFuentes) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
