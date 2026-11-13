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
import '@/datos/configurarServicios';
import { GuardiaDeSesion } from '@/datos/GuardiaDeSesion';
import { AdaptacionPorEdad } from '@/datos/AdaptacionPorEdad';
import { ProveedorBusPropio } from '@/datos/ProveedorBusPropio';
import { ProveedorSuscripcion } from '@/datos/ProveedorSuscripcion';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { ProveedorAvisos } from '@/datos/ProveedorAvisos';
import { ProveedorBloqueo } from '@/datos/ProveedorBloqueo';
import { ProveedorBoletos } from '@/datos/ProveedorBoletos';
import { ProveedorHabituales } from '@/datos/ProveedorHabituales';
import { ProveedorEspera } from '@/datos/ProveedorEspera';
import { ProveedorFavoritos } from '@/datos/ProveedorFavoritos';
import { ProveedorCierres } from '@/datos/ProveedorCierres';
import { ProveedorAbordaje } from '@/datos/ProveedorAbordaje';
import { ProveedorPagos } from '@/datos/ProveedorPagos';
import { ProveedorSesion } from '@/datos/ProveedorSesion';
import { ProveedorRecordatorios } from '@/datos/ProveedorRecordatorios';
import { ProveedorPerfil } from '@/datos/ProveedorPerfil';
import { ProveedorReserva } from '@/datos/ProveedorReserva';
import { ProveedorUbicacion } from '@/datos/ProveedorUbicacion';
import { PuertaBloqueo } from '@/pantallas/Bloqueo';
import { ProveedorModoUso } from '@/tema/ProveedorModoUso';
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
      <ProveedorModoUso>
        <ProveedorSesion>
          <ProveedorSuscripcion>
            <ProveedorBusPropio>
              <ProveedorBloqueo>
                <ProveedorPerfil>
                  <AdaptacionPorEdad />
                  <ProveedorBoletos>
                    <ProveedorEspera>
                      <ProveedorAvisos>
                        <ProveedorUbicacion>
                          <ProveedorReserva>
                            <ProveedorFavoritos>
                              <ProveedorHabituales>
                                <ProveedorRecordatorios>
                                  <ProveedorPagos>
                                    <ProveedorAbordaje>
                                      <ProveedorCierres>
                                        <GuardiaDeSesion />
                                        <Stack
                                          screenOptions={{ headerShown: false }}
                                        >
                                          <Stack.Screen
                                            name="boleto/[id]"
                                            options={{
                                              animation: 'fade_from_bottom',
                                              animationDuration: 420,
                                            }}
                                          />
                                          <Stack.Screen
                                            name="ingresar"
                                            options={{ animation: 'fade' }}
                                          />
                                          <Stack.Screen
                                            name="buscar"
                                            options={{
                                              animation: 'fade_from_bottom',
                                            }}
                                          />
                                        </Stack>
                                      </ProveedorCierres>
                                    </ProveedorAbordaje>
                                  </ProveedorPagos>
                                </ProveedorRecordatorios>
                              </ProveedorHabituales>
                            </ProveedorFavoritos>
                          </ProveedorReserva>
                        </ProveedorUbicacion>
                      </ProveedorAvisos>
                    </ProveedorEspera>
                  </ProveedorBoletos>
                </ProveedorPerfil>
                <PuertaBloqueo />
              </ProveedorBloqueo>
            </ProveedorBusPropio>
          </ProveedorSuscripcion>
        </ProveedorSesion>
      </ProveedorModoUso>
    </ProveedorTema>
  );
}
