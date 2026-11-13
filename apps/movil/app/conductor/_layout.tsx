import { Stack } from 'expo-router';

/** el panel del conductor: sus pestañas y, encima, el viaje abierto */
export default function DisenoConductor() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
