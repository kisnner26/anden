import { useLocalSearchParams, useRouter } from 'expo-router';

import { Pago } from '@/pantallas/Pago';

export default function RutaPago() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <Pago
      alReservado={(boletoId) =>
        router.replace({ params: { id: boletoId }, pathname: '/boleto/[id]' })
      }
      alVolver={() => router.back()}
      viajeId={id ?? ''}
    />
  );
}
