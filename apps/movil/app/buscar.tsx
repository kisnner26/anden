import { useRouter } from 'expo-router';

import { Buscador } from '@/pantallas/Buscador';

export default function RutaBuscar() {
  const router = useRouter();
  return (
    <Buscador
      alAbrirViaje={(id) =>
        router.push({ params: { id }, pathname: '/viaje/[id]' })
      }
      alVolver={() => router.back()}
    />
  );
}
