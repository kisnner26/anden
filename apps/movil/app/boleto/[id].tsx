import { useLocalSearchParams, useRouter } from 'expo-router';

import { VerBoleto } from '@/pantallas/VerBoleto';

export default function RutaBoleto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <VerBoleto
      alCancelado={() => router.replace('/boletos')}
      alVerChofer={(choferId) =>
        router.push({ params: { id: choferId }, pathname: '/chofer/[id]' })
      }
      alReservarOtra={(destino) =>
        router.push({ params: { q: destino }, pathname: '/buscar' })
      }
      alVolver={() => router.back()}
      boletoId={id ?? ''}
    />
  );
}
