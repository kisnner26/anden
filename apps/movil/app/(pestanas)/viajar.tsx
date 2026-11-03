import { useRouter } from 'expo-router';

import { Viajar } from '@/pantallas/Viajar';

export default function RutaViajar() {
  const router = useRouter();
  return (
    <Viajar
      alAbrirAjustes={() => router.push('/ajustes')}
      alElegirViaje={(id) =>
        router.push({ params: { id }, pathname: '/viaje/[id]' })
      }
    />
  );
}
