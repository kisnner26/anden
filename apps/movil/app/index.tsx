import { useRouter } from 'expo-router';

import { useSesion } from '@/datos/useSesion';
import { Portada } from '@/pantallas/Portada';

export default function Inicio() {
  const router = useRouter();
  const { cargando, rol, sesion } = useSesion();

  if (cargando) return null;

  // la portada se ve cada vez que se abre la app; sin cuenta registrada no se pasa del ingreso
  return (
    <Portada
      alEmpezar={() => {
        if (!sesion) router.replace('/ingresar');
        else router.replace(rol === 'conductor' ? '/conductor' : '/viajar');
      }}
    />
  );
}
