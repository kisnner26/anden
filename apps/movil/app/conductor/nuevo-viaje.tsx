import { Redirect, useRouter } from 'expo-router';

import { useSesion } from '@/datos/useSesion';
import { ConductorNuevoViaje } from '@/pantallas/ConductorNuevoViaje';

export default function RutaNuevoViaje() {
  const router = useRouter();
  const { cargando, rol } = useSesion();

  if (cargando) return null;
  if (rol !== 'conductor') return <Redirect href="/ingresar" />;

  return (
    <ConductorNuevoViaje
      alPublicar={() => router.back()}
      alVolver={() => router.back()}
    />
  );
}
