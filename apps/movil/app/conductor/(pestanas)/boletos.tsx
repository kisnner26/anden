import { Redirect } from 'expo-router';

import { useSesion } from '@/datos/useSesion';
import { ConductorBoletos } from '@/pantallas/ConductorBoletos';

export default function RutaConductorBoletos() {
  const { cargando, rol } = useSesion();

  if (cargando) return null;
  if (rol !== 'conductor') return <Redirect href="/ingresar" />;

  return <ConductorBoletos />;
}
