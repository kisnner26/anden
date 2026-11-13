import { useRouter } from 'expo-router';

import { RegistroConductor } from '@/pantallas/RegistroConductor';

export default function RutaRegistroConductor() {
  const router = useRouter();
  return <RegistroConductor alVolver={() => router.back()} />;
}
