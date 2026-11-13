import { Redirect, useRouter } from 'expo-router';

import { useSesion } from '@/datos/useSesion';
import { ConductorPerfil } from '@/pantallas/ConductorPerfil';

export default function RutaConductorPerfil() {
  const router = useRouter();
  const { cargando, rol } = useSesion();

  if (cargando) return null;
  if (rol !== 'conductor') return <Redirect href="/ingresar" />;

  return (
    <ConductorPerfil
      alEditar={() => router.push('/perfil')}
      alVerPerfilPublico={(id) =>
        router.push({ params: { id }, pathname: '/chofer/[id]' })
      }
    />
  );
}
