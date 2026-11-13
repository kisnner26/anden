import { useRouter } from 'expo-router';

import { CrearCuenta } from '@/pantallas/CrearCuenta';

export default function RutaCuenta() {
  const router = useRouter();
  return (
    <CrearCuenta
      alRegistrarConductor={() => router.push('/registro-conductor')}
      alTerminar={() => router.replace('/viajar')}
    />
  );
}
