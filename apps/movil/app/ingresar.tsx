import { useRouter } from 'expo-router';

import { Ingresar } from '@/pantallas/Ingresar';
import { marcarInvitado } from '@/servicios/sesion';

export default function RutaIngresar() {
  const router = useRouter();
  return (
    <Ingresar
      alCrearCuenta={() => router.push('/cuenta')}
      alIngresar={(rol) =>
        router.replace(rol === 'conductor' ? '/conductor' : '/viajar')
      }
      alInvitado={() => {
        void marcarInvitado();
        router.replace('/viajar');
      }}
    />
  );
}
