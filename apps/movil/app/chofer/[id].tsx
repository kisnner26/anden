import { useLocalSearchParams, useRouter } from 'expo-router';

import { PerfilChofer } from '@/pantallas/PerfilChofer';

export default function RutaChofer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return <PerfilChofer alVolver={() => router.back()} choferId={id ?? ''} />;
}
