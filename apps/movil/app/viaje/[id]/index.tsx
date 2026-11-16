import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { useBoletoEnCurso } from '@/datos/useBoletoEnCurso';

import { DetalleViaje } from '@/pantallas/DetalleViaje';

export default function RutaDetalleViaje() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const viajeId = id ?? '';
  const enCurso = useBoletoEnCurso();

  // si la persona ya va en este viaje, entrar a él es ver el viaje en curso
  if (enCurso?.boleto.viajeId === viajeId) {
    return (
      <Redirect
        href={{ params: { id: enCurso.boleto.id }, pathname: '/en-curso/[id]' }}
      />
    );
  }

  return (
    <DetalleViaje
      alArmarGrupo={() =>
        router.push({ params: { id: viajeId }, pathname: '/viaje/[id]/grupo' })
      }
      alElegirAsiento={() =>
        router.push({
          params: { id: viajeId },
          pathname: '/viaje/[id]/asientos',
        })
      }
      alVerChofer={(choferId) =>
        router.push({ params: { id: choferId }, pathname: '/chofer/[id]' })
      }
      alPreguntar={(pregunta) =>
        router.push({ params: { pregunta }, pathname: '/asistente' })
      }
      alVolver={() => router.back()}
      viajeId={viajeId}
    />
  );
}
