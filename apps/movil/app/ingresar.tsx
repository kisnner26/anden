import { useRouter } from 'expo-router';

import { Ingresar } from '@/pantallas/Ingresar';

export default function RutaIngresar() {
  const router = useRouter();
  return (
    <Ingresar
      alCrearCuenta={() => router.push('/cuenta')}
      alIngresar={(rol) =>
        router.replace(rol === 'conductor' ? '/conductor' : '/viajar')
      }
    />
  );
}
