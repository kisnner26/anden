import { useLocalSearchParams, useRouter } from 'expo-router';

import { DetalleViaje } from '@/pantallas/DetalleViaje';

export default function RutaDetalleViaje() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const viajeId = id ?? '';

  return (
    <DetalleViaje
      alElegirAsiento={() =>
        router.push({
          params: { id: viajeId },
          pathname: '/viaje/[id]/asientos',
        })
      }
      alVerChofer={(choferId) =>
        router.push({ params: { id: choferId }, pathname: '/chofer/[id]' })
      }
      alVolver={() => router.back()}
      viajeId={viajeId}
    />
  );
}
