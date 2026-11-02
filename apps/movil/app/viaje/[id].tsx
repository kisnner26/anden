import { useLocalSearchParams, useRouter } from 'expo-router';

import { Asientos } from '@/pantallas/Asientos';

export default function RutaAsientos() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return <Asientos alVolver={() => router.back()} viajeId={id ?? ''} />;
}
