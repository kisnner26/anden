import { Stack } from 'expo-router';

import { PublicadorPerfilChofer } from '@/componentes/PublicadorPerfilChofer';

/** el panel del conductor: sus pestañas y, encima, el viaje abierto */
export default function DisenoConductor() {
  return (
    <>
      <PublicadorPerfilChofer />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
