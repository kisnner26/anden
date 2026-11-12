import { useLocalSearchParams, useRouter } from 'expo-router';

import { Pago } from '@/pantallas/Pago';

export default function RutaPago() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <Pago
      alListo={() => {
        router.dismissAll();
        router.replace('/boletos');
      }}
      alVerBoleto={(boletoId) => {
        router.dismissAll();
        router.replace('/boletos');
        router.push({ params: { id: boletoId }, pathname: '/boleto/[id]' });
      }}
      alVolver={() => router.back()}
      viajeId={id ?? ''}
    />
  );
}
