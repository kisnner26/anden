import { Rutas } from '@/pantallas/Rutas';
import { useRouter } from 'expo-router';

export default function RutaRutas() {
  const router = useRouter();
  return (
    <Rutas
      alAbrirRuta={(id) =>
        router.push({ pathname: '/ruta/[id]', params: { id } })
      }
    />
  );
}
