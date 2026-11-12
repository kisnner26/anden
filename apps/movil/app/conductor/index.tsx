import { Redirect, useRouter } from 'expo-router';

import { useSesion } from '@/datos/useSesion';
import { ConductorInicio } from '@/pantallas/ConductorInicio';

export default function RutaConductor() {
  const router = useRouter();
  const { cargando, rol } = useSesion();

  if (cargando) return null;
  // el modo conductor solo existe con una sesión de conductor
  if (rol !== 'conductor') return <Redirect href="/ingresar" />;

  return (
    <ConductorInicio
      alAbrirViaje={(id) =>
        router.push({ params: { id }, pathname: '/conductor/viaje/[id]' })
      }
      alSalir={() => router.replace('/ingresar')}
    />
  );
}
