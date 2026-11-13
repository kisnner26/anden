import { useLocalSearchParams, useRouter } from 'expo-router';

import { DondeViene } from '@/pantallas/DondeViene';

export default function RutaDondeViene() {
  const { ciudad } = useLocalSearchParams<{ ciudad?: string }>();
  const router = useRouter();
  return (
    <DondeViene
      alAbrirViaje={(id) =>
        router.push({ params: { id }, pathname: '/viaje/[id]' })
      }
      alVolver={() => router.back()}
      ciudadInicial={ciudad}
    />
  );
}
