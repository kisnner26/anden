import { useLocalSearchParams, useRouter } from 'expo-router';

import { Asistente } from '@/pantallas/Asistente';

export default function RutaAsistente() {
  const router = useRouter();
  const { pregunta } = useLocalSearchParams<{ pregunta?: string }>();
  return (
    <Asistente
      alAbrirPantalla={(pantalla) => {
        const rutas = {
          ajustes: '/ajustes',
          avisos: '/avisos',
          boletos: '/boletos',
          encomienda: '/encomienda',
          horarios: '/horarios',
          plus: '/plus',
          rutas: '/rutas',
        } as const;
        router.push(rutas[pantalla]);
      }}
      alAbrirBoleto={(id) =>
        router.push({ params: { id }, pathname: '/boleto/[id]' })
      }
      alAbrirViaje={(id) =>
        router.push({ params: { id }, pathname: '/viaje/[id]' })
      }
      alVolver={() => router.back()}
      preguntaInicial={pregunta}
    />
  );
}
