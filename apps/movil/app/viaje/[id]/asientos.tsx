import { useLocalSearchParams, useRouter } from 'expo-router';

import { Asientos } from '@/pantallas/Asientos';

export default function RutaAsientos() {
  const { grupo, id, pasajeros } = useLocalSearchParams<{
    grupo?: string;
    id: string;
    pasajeros?: string;
  }>();
  const router = useRouter();
  const viajeId = id ?? '';

  return (
    <Asientos
      alSeguir={(asientos) =>
        router.push({
          params: {
            asientos: asientos.join(','),
            ...(grupo ? { grupo } : {}),
            id: viajeId,
          },
          pathname: '/viaje/[id]/pasajeros',
        })
      }
      alVolver={() => router.back()}
      grupo={grupo}
      pasajeros={Number.parseInt(pasajeros ?? '', 10) || undefined}
      viajeId={viajeId}
    />
  );
}
