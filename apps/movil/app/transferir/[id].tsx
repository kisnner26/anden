import { useLocalSearchParams, useRouter } from 'expo-router';

import { Transferir } from '@/pantallas/Transferir';

export default function RutaTransferir() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return (
    <Transferir
      alTerminar={() => router.replace('/boletos')}
      alVolver={() => router.back()}
      boletoId={id ?? ''}
    />
  );
}
