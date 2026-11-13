import { Redirect, useRouter } from 'expo-router';

import { useSesion } from '@/datos/useSesion';
import { ConductorPasajeros } from '@/pantallas/ConductorPasajeros';

export default function RutaConductorPasajeros() {
  const router = useRouter();
  const { cargando, rol } = useSesion();

  if (cargando) return null;
  if (rol !== 'conductor') return <Redirect href="/ingresar" />;

  return (
    <ConductorPasajeros
      alAbrirViaje={(id) =>
        router.push({ params: { id }, pathname: '/conductor/viaje/[id]' })
      }
    />
  );
}
