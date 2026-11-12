import { useRouter } from 'expo-router';

import { Plus } from '@/pantallas/Plus';

export default function RutaPlus() {
  const router = useRouter();
  return <Plus alVolver={() => router.back()} />;
}
