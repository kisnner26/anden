import { useModoSimple } from '@/datos/modoSimple';
import { Rutas } from '@/pantallas/Rutas';
import { RutasSimple } from '@/pantallas/RutasSimple';
import { useRouter } from 'expo-router';

export default function RutaRutas() {
  const router = useRouter();
  const modoSimple = useModoSimple();
  if (modoSimple.activo) {
    return (
      <RutasSimple
        alBuscar={(destino) =>
          router.push({ params: { q: destino }, pathname: '/buscar' })
        }
        alSalir={() => void modoSimple.cambiar(false)}
      />
    );
  }
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
