import { useRouter } from 'expo-router';

import { Asistente } from '@/pantallas/Asistente';

export default function RutaAsistente() {
  const router = useRouter();
  return (
    <Asistente
      alAbrirBoleto={(id) =>
        router.push({ params: { id }, pathname: '/boleto/[id]' })
      }
      alAbrirViaje={(id) =>
        router.push({ params: { id }, pathname: '/viaje/[id]' })
      }
      alVolver={() => router.back()}
    />
  );
}
