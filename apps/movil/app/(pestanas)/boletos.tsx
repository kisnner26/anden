import { useRouter } from 'expo-router';

import { Boletos } from '@/pantallas/Boletos';

export default function RutaBoletos() {
  const router = useRouter();
  return (
    <Boletos
      alAbrirBoleto={(id) =>
        router.push({ params: { id }, pathname: '/boleto/[id]' })
      }
      alAbrirPasaporte={() => router.push('/pasaporte')}
      alAbrirResumen={() => router.push('/resumen-anual')}
      alAbrirPlus={() => router.push('/plus')}
      alBuscar={() => router.navigate('/viajar')}
      alRecibir={() => router.push('/recibir')}
      alPreguntar={(pregunta) =>
        router.push({ params: { pregunta }, pathname: '/asistente' })
      }
    />
  );
}
