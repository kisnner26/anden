import { useRouter } from 'expo-router';

import { Pasaporte } from '@/pantallas/Pasaporte';

export default function RutaPasaporte() {
  const router = useRouter();
  return <Pasaporte alVolver={() => router.back()} />;
}
