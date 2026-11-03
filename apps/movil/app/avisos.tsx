import { useRouter } from 'expo-router';

import { Avisos } from '@/pantallas/Avisos';

export default function RutaAvisos() {
  const router = useRouter();
  return <Avisos alVolver={() => router.back()} />;
}
