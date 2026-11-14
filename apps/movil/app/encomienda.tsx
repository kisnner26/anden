import { useRouter } from 'expo-router';

import { Encomiendas } from '@/pantallas/Encomiendas';

export default function RutaEncomienda() {
  const router = useRouter();
  return (
    <Encomiendas
      alPreguntar={(pregunta) =>
        router.push({ params: { pregunta }, pathname: '/asistente' })
      }
      alVolver={() => router.back()}
    />
  );
}
