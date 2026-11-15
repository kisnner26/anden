import { useLocalSearchParams, useRouter } from 'expo-router';

import { ArmarGrupo } from '@/pantallas/ArmarGrupo';

export default function RutaArmarGrupo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <ArmarGrupo
      alCreado={(codigo) =>
        router.replace({ params: { codigo }, pathname: '/grupo/[codigo]' })
      }
      alVolver={() => router.back()}
      viajeId={id ?? ''}
    />
  );
}
