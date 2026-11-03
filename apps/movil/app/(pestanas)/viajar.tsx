import { useRouter } from 'expo-router';

import { Viajar } from '@/pantallas/Viajar';

export default function RutaViajar() {
  const router = useRouter();
  return (
    <Viajar
      alAbrirAjustes={() => router.push('/ajustes')}
      alAbrirViaje={(id) =>
        router.push({ params: { id }, pathname: '/viaje/[id]' })
      }
      alElegirAsiento={(id) =>
        router.push({ params: { id }, pathname: '/viaje/[id]/asientos' })
      }
    />
  );
}
