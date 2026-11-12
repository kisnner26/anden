import { useRouter } from 'expo-router';

import { CrearCuenta } from '@/pantallas/CrearCuenta';
import { marcarInvitado } from '@/servicios/sesion';

export default function RutaCuenta() {
  const router = useRouter();
  return (
    <CrearCuenta
      alTerminar={() => {
        // sin servidor, crear la cuenta guarda el perfil en el teléfono: no hace falta volver a ingresar
        void marcarInvitado();
        router.replace('/viajar');
      }}
    />
  );
}
