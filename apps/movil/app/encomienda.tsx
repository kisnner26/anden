import { useRouter } from 'expo-router';

import { Encomiendas } from '@/pantallas/Encomiendas';

export default function RutaEncomienda() {
  const router = useRouter();
  return <Encomiendas alVolver={() => router.back()} />;
}
