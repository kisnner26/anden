import { Redirect } from 'expo-router';

import { useSesion } from '@/datos/useSesion';
import { ConductorHistorial } from '@/pantallas/ConductorHistorial';

export default function RutaConductorHistorial() {
  const { cargando, rol } = useSesion();

  if (cargando) return null;
  if (rol !== 'conductor') return <Redirect href="/ingresar" />;

  return <ConductorHistorial />;
}
