import { useRouter } from 'expo-router';

import { Asistente } from '@/pantallas/Asistente';

export default function RutaAsistente() {
  const router = useRouter();
  return <Asistente alVolver={() => router.back()} />;
}
