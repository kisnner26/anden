import { useRouter } from 'expo-router';

import { Horarios } from '@/pantallas/Horarios';

export default function RutaHorarios() {
  const router = useRouter();
  return <Horarios alAbrirBuscador={() => router.push('/buscar')} />;
}
