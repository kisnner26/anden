import { useRouter } from 'expo-router';

import { CrearCuenta } from '@/pantallas/CrearCuenta';

export default function RutaCuenta() {
  const router = useRouter();
  return <CrearCuenta alTerminar={() => router.replace('/viajar')} />;
}
