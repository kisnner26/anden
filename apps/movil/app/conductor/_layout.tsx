import { Stack } from 'expo-router';

import { CierreAutomatico } from '@/componentes/CierreAutomatico';
import { PublicadorPerfilChofer } from '@/componentes/PublicadorPerfilChofer';

/** el panel del conductor: sus pestañas y, encima, el viaje abierto */
export default function DisenoConductor() {
  return (
    <>
      <PublicadorPerfilChofer />
      <CierreAutomatico />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
