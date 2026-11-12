import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { useSesion } from '@/datos/useSesion';
import { ConductorViaje } from '@/pantallas/ConductorViaje';

export default function RutaConductorViaje() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { cargando, rol } = useSesion();

  if (cargando) return null;
  if (rol !== 'conductor') return <Redirect href="/ingresar" />;

  return <ConductorViaje alVolver={() => router.back()} viajeId={id ?? ''} />;
}
