import { useLocalSearchParams, useRouter } from 'expo-router';

import { Asientos } from '@/pantallas/Asientos';

export default function RutaAsientos() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const viajeId = id ?? '';

  return (
    <Asientos
      alSeguir={(asientos) =>
        router.push({
          params: { asientos: asientos.join(','), id: viajeId },
          pathname: '/viaje/[id]/pasajeros',
        })
      }
      alVolver={() => router.back()}
      viajeId={viajeId}
    />
  );
}
