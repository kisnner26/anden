import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { PuertaBiometrica } from '@/componentes/PuertaBiometrica';
import { useSesion } from '@/datos/useSesion';
import { ConductorViaje } from '@/pantallas/ConductorViaje';
import { t } from '@/textos/t';

export default function RutaConductorViaje() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { cargando, rol } = useSesion();

  if (cargando) return null;
  if (rol !== 'conductor') return <Redirect href="/ingresar" />;

  return (
    <PuertaBiometrica motivo={t('conductor.motivoPanel')}>
      <ConductorViaje alVolver={() => router.back()} viajeId={id ?? ''} />
    </PuertaBiometrica>
  );
}
