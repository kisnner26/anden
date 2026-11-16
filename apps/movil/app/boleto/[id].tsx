import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { useBoletoEnCurso } from '@/datos/useBoletoEnCurso';
import { VerBoleto } from '@/pantallas/VerBoleto';

export default function RutaBoleto() {
  const { id, ver } = useLocalSearchParams<{ id: string; ver?: string }>();
  const router = useRouter();
  const enCurso = useBoletoEnCurso();

  // al entrar al boleto de un viaje que ya salió se ve el viaje en curso; "ver" pide el boleto mismo
  if (enCurso?.boleto.id === id && ver !== '1') {
    return <Redirect href={{ params: { id }, pathname: '/en-curso/[id]' }} />;
  }

  return (
    <VerBoleto
      alCancelado={() => router.replace('/boletos')}
      alReubicado={(nuevoId) =>
        router.replace({ params: { id: nuevoId }, pathname: '/boleto/[id]' })
      }
      alTransferir={(boletoId) =>
        router.push({ params: { id: boletoId }, pathname: '/transferir/[id]' })
      }
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
