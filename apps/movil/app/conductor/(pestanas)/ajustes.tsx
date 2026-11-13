import { Redirect, useRouter } from 'expo-router';

import { useSesion } from '@/datos/useSesion';
import { ConductorAjustes } from '@/pantallas/ConductorAjustes';

export default function RutaConductorAjustes() {
  const router = useRouter();
  const { cargando, rol } = useSesion();

  if (cargando) return null;
  if (rol !== 'conductor') return <Redirect href="/ingresar" />;

  return (
    <ConductorAjustes
      alAbrirAjustesGenerales={() => router.push('/ajustes')}
      alSalir={() => router.replace('/ingresar')}
    />
  );
}
