import { useRouter } from 'expo-router';

import { ResumenAnual } from '@/pantallas/ResumenAnual';

export default function RutaResumenAnual() {
  const router = useRouter();
  return <ResumenAnual alVolver={() => router.back()} />;
}
