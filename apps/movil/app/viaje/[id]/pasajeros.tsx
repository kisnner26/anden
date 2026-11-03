import { useLocalSearchParams, useRouter } from 'expo-router';

import { Pasajeros } from '@/pantallas/Pasajeros';

export default function RutaPasajeros() {
  const { asientos, id } = useLocalSearchParams<{
    asientos: string;
    id: string;
  }>();
  const router = useRouter();
  const viajeId = id ?? '';
  const elegidos = (asientos ?? '')
    .split(',')
    .map(Number)
    .filter((numero) => Number.isInteger(numero) && numero > 0);

  return (
    <Pasajeros
      alContinuar={() =>
        router.push({ params: { id: viajeId }, pathname: '/viaje/[id]/pago' })
      }
      alVolver={() => router.back()}
      asientos={elegidos}
      viajeId={viajeId}
    />
  );
}
