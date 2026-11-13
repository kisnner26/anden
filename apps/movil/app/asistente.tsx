import { useRouter } from 'expo-router';

import { Asistente } from '@/pantallas/Asistente';

export default function RutaAsistente() {
  const router = useRouter();
  return (
    <Asistente
      alAbrirViaje={(id) =>
        router.push({ params: { id }, pathname: '/viaje/[id]' })
      }
      alVolver={() => router.back()}
    />
  );
}
