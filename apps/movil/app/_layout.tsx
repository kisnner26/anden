import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
} from '@expo-google-fonts/archivo';
import ArchivoCondensed_700Bold from '../assets/fuentes/Archivo-Condensed-Bold.ttf';
import ArchivoExtraCondensed_800ExtraBold from '../assets/fuentes/Archivo-ExtraCondensed-ExtraBold.ttf';
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { ProveedorTema } from '@/tema/ProveedorTema';

void SplashScreen.preventAutoHideAsync();

export default function DisenoRaiz() {
  const [fuentesCargadas, errorFuentes] = useFonts({
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    ArchivoCondensed_700Bold,
    ArchivoExtraCondensed_800ExtraBold,
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

  return (
    <ProveedorTema>
      <Stack screenOptions={{ headerShown: false }} />
    </ProveedorTema>
  );
}
