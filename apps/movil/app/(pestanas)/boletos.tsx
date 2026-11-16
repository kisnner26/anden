import { useRouter } from 'expo-router';

import { useModoSimple } from '@/datos/modoSimple';
import { Boletos } from '@/pantallas/Boletos';
import { BoletosSimple } from '@/pantallas/BoletosSimple';

export default function RutaBoletos() {
  const router = useRouter();
  const modoSimple = useModoSimple();
  if (modoSimple.activo) {
    return (
      <BoletosSimple
        alAbrirBoleto={(id) =>
          router.push({ params: { id }, pathname: '/boleto/[id]' })
        }
        alBuscar={() => router.navigate('/viajar')}
        alSalir={() => void modoSimple.cambiar(false)}
      />
    );
  }
  return (
    <Boletos
      alAbrirBoleto={(id) =>
        router.push({ params: { id }, pathname: '/boleto/[id]' })
      }
      alAbrirPlus={() => router.push('/plus')}
      alBuscar={() => router.navigate('/viajar')}
      alRecibir={() => router.push('/recibir')}
      alPreguntar={(pregunta) =>
        router.push({ params: { pregunta }, pathname: '/asistente' })
      }
    />
  );
}
