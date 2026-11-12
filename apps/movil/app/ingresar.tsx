import { useRouter } from 'expo-router';

import { Ingresar } from '@/pantallas/Ingresar';

export default function RutaIngresar() {
  const router = useRouter();
  return (
    <Ingresar
      alIngresar={() => router.replace('/conductor')}
      alVolver={() => router.back()}
    />
  );
}
