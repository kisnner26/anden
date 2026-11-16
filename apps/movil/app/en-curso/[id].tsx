import { useLocalSearchParams, useRouter } from 'expo-router';

import { ViajeEnCurso } from '@/pantallas/ViajeEnCurso';

/** el viaje que la persona está haciendo; el parámetro es el id de su boleto */
export default function RutaViajeEnCurso() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const boletoId = id ?? '';

  return (
    <ViajeEnCurso
      alVerBoleto={(destino) =>
        router.push({
          params: { id: destino, ver: '1' },
          pathname: '/boleto/[id]',
        })
      }
      alVerChofer={(choferId) =>
        router.push({ params: { id: choferId }, pathname: '/chofer/[id]' })
      }
      alVolver={() => router.back()}
      boletoId={boletoId}
    />
  );
}
