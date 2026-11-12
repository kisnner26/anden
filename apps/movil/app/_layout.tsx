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

import { ProveedorAvisos } from '@/datos/ProveedorAvisos';
import { ProveedorBloqueo } from '@/datos/ProveedorBloqueo';
import { ProveedorBoletos } from '@/datos/ProveedorBoletos';
import { ProveedorPerfil } from '@/datos/ProveedorPerfil';
import { ProveedorReserva } from '@/datos/ProveedorReserva';
import { ProveedorUbicacion } from '@/datos/ProveedorUbicacion';
import { PuertaBloqueo } from '@/pantallas/Bloqueo';
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
      <ProveedorBloqueo>
        <ProveedorPerfil>
          <ProveedorBoletos>
            <ProveedorAvisos>
              <ProveedorUbicacion>
                <ProveedorReserva>
                  <Stack screenOptions={{ headerShown: false }} />
                </ProveedorReserva>
              </ProveedorUbicacion>
            </ProveedorAvisos>
          </ProveedorBoletos>
        </ProveedorPerfil>
        <PuertaBloqueo />
      </ProveedorBloqueo>
    </ProveedorTema>
  );
}
