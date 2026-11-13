import { Redirect, useRouter } from 'expo-router';

import { PuertaBiometrica } from '@/componentes/PuertaBiometrica';
import { useSesion } from '@/datos/useSesion';
import { ConductorInicio } from '@/pantallas/ConductorInicio';
import { t } from '@/textos/t';

export default function RutaConductor() {
  const router = useRouter();
  const { cargando, rol } = useSesion();

  if (cargando) return null;
  // el modo conductor solo existe con una sesión de conductor
  if (rol !== 'conductor') return <Redirect href="/ingresar" />;

  return (
    <PuertaBiometrica motivo={t('conductor.motivoPanel')}>
      <ConductorInicio
        alAbrirViaje={(id) =>
          router.push({ params: { id }, pathname: '/conductor/viaje/[id]' })
        }
        alSalir={() => router.replace('/ingresar')}
      />
    </PuertaBiometrica>
  );
}
