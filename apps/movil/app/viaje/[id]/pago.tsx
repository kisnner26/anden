import { useLocalSearchParams, useRouter } from 'expo-router';

import { Pago } from '@/pantallas/Pago';
import { movimiento } from '@/tema/movimiento';

export default function RutaPago() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <Pago
      alReservado={() =>
        setTimeout(() => {
          router.dismissAll();
          router.replace('/boletos');
        }, movimiento.confirmacionReserva)
      }
      alVolver={() => router.back()}
      viajeId={id ?? ''}
    />
  );
}
