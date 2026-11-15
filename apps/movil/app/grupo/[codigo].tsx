import { useLocalSearchParams, useRouter } from 'expo-router';

import { Grupo } from '@/pantallas/Grupo';

export default function RutaGrupo() {
  const { codigo } = useLocalSearchParams<{ codigo: string }>();
  const router = useRouter();
  const clave = (codigo ?? '').toUpperCase();

  return (
    <Grupo
      alElegirAsiento={(viajeId) =>
        router.push({
          params: { grupo: clave, id: viajeId },
          pathname: '/viaje/[id]/asientos',
        })
      }
      alVolver={() => router.back()}
      codigo={clave}
    />
  );
}
