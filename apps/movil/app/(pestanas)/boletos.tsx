import { useRouter } from 'expo-router';

import { Boletos } from '@/pantallas/Boletos';

export default function RutaBoletos() {
  const router = useRouter();
  return (
    <Boletos
      alAbrirBoleto={(id) =>
        router.push({ params: { id }, pathname: '/boleto/[id]' })
      }
      alBuscar={() => router.navigate('/viajar')}
    />
  );
}
