import { useRouter } from 'expo-router';

import { Boletos } from '@/pantallas/Boletos';

export default function RutaBoletos() {
  const router = useRouter();
  return <Boletos alBuscar={() => router.navigate('/viajar')} />;
}
