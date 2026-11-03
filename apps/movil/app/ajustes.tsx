import { useRouter } from 'expo-router';

import { Ajustes } from '@/pantallas/Ajustes';

export default function RutaAjustes() {
  const router = useRouter();
  return <Ajustes alVolver={() => router.back()} />;
}
