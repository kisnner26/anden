import { useRouter } from 'expo-router';

import { Viajar } from '@/pantallas/Viajar';

export default function RutaViajar() {
  const router = useRouter();
  return (
    <Viajar
      alAbrirAjustes={() => router.push('/ajustes')}
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
