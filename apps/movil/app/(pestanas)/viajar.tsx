import { useRouter } from 'expo-router';

import { useModoSimple } from '@/datos/modoSimple';
import { InicioSimple } from '@/pantallas/InicioSimple';
import { Viajar } from '@/pantallas/Viajar';

export default function RutaViajar() {
  const router = useRouter();
  const modoSimple = useModoSimple();
  if (modoSimple.activo) {
    return (
      <InicioSimple
        alAbrirBoleto={(id) =>
          router.push({ params: { id }, pathname: '/boleto/[id]' })
        }
        alBuscar={(destino) =>
          router.push({ params: { q: destino }, pathname: '/buscar' })
        }
        alSalir={() => void modoSimple.cambiar(false)}
      />
    );
  }
  return (
    <Viajar
      alAbrirAjustes={() => router.push('/ajustes')}
      alAbrirAsistente={() => router.push('/asistente')}
      alAbrirAvisos={() => router.push('/avisos')}
      alAbrirViaje={(id) =>
        router.push({ params: { id }, pathname: '/viaje/[id]' })
      }
      alIrA={(pestana) => router.navigate(`/${pestana}`)}
      alAbrirDondeViene={() => router.push('/donde-viene')}
      alReservarOtroDia={() => router.navigate('/horarios')}
      alElegirAsiento={(id) =>
        router.push({ params: { id }, pathname: '/viaje/[id]/asientos' })
      }
    />
  );
}
