import { StatusBar } from 'expo-status-bar';

import { useTema } from '@/tema/useTema';

/** la hora y la señal del teléfono se dibujan claras sobre el fondo oscuro y oscuras sobre el claro, según el tema de la app y no solo el del sistema */
export function BarraDeEstado() {
  const { modo } = useTema();
  return <StatusBar animated style={modo === 'oscuro' ? 'light' : 'dark'} />;
}
