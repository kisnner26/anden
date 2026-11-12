import { useLocalSearchParams, useRouter } from 'expo-router';

import { Buscador } from '@/pantallas/Buscador';

export default function RutaBuscar() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const router = useRouter();
  return (
    <Buscador
      alAbrirViaje={(id) =>
        router.push({ params: { id }, pathname: '/viaje/[id]' })
      }
      alVolver={() => router.back()}
      consultaInicial={q ?? ''}
    />
  );
}
