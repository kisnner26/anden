import { Rutas } from '@/pantallas/Rutas';
import { useRouter } from 'expo-router';

export default function RutaRutas() {
  const router = useRouter();
  return (
    <Rutas
      alElegirAsientos={(id) =>
        router.push({ pathname: '/viaje/[id]/asientos', params: { id } })
      }
      alAbrirEncomiendas={() => router.push('/encomienda')}
      alAbrirRuta={(id) =>
        router.push({ pathname: '/ruta/[id]', params: { id } })
      }
    />
  );
}
