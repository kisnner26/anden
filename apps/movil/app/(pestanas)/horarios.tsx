import { useRouter } from 'expo-router';

import { useModoSimple } from '@/datos/modoSimple';
import { Horarios } from '@/pantallas/Horarios';
import { HorariosSimple } from '@/pantallas/HorariosSimple';

export default function RutaHorarios() {
  const router = useRouter();
  const modoSimple = useModoSimple();
  if (modoSimple.activo) {
    return (
      <HorariosSimple
        alAbrirViaje={(id) =>
          router.push({ params: { id }, pathname: '/viaje/[id]' })
        }
        alSalir={() => void modoSimple.cambiar(false)}
      />
    );
  }
  return (
    <Horarios
      alAbrirBuscador={() => router.push('/buscar')}
      alPreguntar={(pregunta) =>
        router.push({ params: { pregunta }, pathname: '/asistente' })
      }
      alAbrirViaje={(id) =>
        router.push({ params: { id }, pathname: '/viaje/[id]' })
      }
    />
  );
}
