import { useLocalSearchParams, useRouter } from 'expo-router';

import { Recibir } from '@/pantallas/Recibir';

export default function RutaRecibir() {
  const { codigo } = useLocalSearchParams<{ codigo?: string }>();
  const router = useRouter();
  return (
    <Recibir
      alVerBoleto={(id) =>
        router.replace({ params: { id }, pathname: '/boleto/[id]' })
      }
      alVolver={() => router.back()}
      codigoInicial={codigo ?? ''}
    />
  );
}
