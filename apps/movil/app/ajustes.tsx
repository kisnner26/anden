import { useRouter } from 'expo-router';

import { Ajustes } from '@/pantallas/Ajustes';

export default function RutaAjustes() {
  const router = useRouter();
  return (
    <Ajustes
      alSalir={() => router.replace('/ingresar')}
      alAbrirPlus={() => router.push('/plus')}
      alAbrirPerfil={() => router.push('/perfil')}
      alVolver={() => router.back()}
    />
  );
}
