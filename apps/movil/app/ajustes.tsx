import { useRouter } from 'expo-router';

import { Ajustes } from '@/pantallas/Ajustes';

export default function RutaAjustes() {
  const router = useRouter();
  return (
    <Ajustes
      alAbrirConductor={() => router.push('/conductor')}
      alAbrirIngreso={() => router.push('/ingresar')}
      alAbrirPerfil={() => router.push('/perfil')}
      alVolver={() => router.back()}
    />
  );
}
