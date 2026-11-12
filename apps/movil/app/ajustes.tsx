import { useRouter } from 'expo-router';

import { Ajustes } from '@/pantallas/Ajustes';

export default function RutaAjustes() {
  const router = useRouter();
  return (
    <Ajustes
      alAbrirIngreso={() => router.push('/ingresar')}
      alSalir={() => router.replace('/ingresar')}
      alAbrirPerfil={() => router.push('/perfil')}
      alVolver={() => router.back()}
    />
  );
}
