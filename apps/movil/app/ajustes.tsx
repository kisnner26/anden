import { useRouter } from 'expo-router';

import { Ajustes } from '@/pantallas/Ajustes';

export default function RutaAjustes() {
  const router = useRouter();
  return (
    <Ajustes
      alSalir={() => router.replace('/ingresar')}
      alAbrirPlus={() => router.push('/plus')}
      alAbrirPasaporte={() => router.push('/pasaporte')}
      alAbrirResumen={() => router.push('/resumen-anual')}
      alAbrirPerfil={() => router.push('/perfil')}
      alAbrirPerfilConductor={() => router.push('/conductor/perfil')}
      alVolver={() => router.back()}
    />
  );
}
