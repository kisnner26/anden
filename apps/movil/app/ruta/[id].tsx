import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';

import { DetalleRuta as PantallaDetalleRuta } from '@/pantallas/DetalleRuta';

/** detalle local de una ruta de muestra. */
export default function DetalleRuta() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PantallaDetalleRuta alVolver={() => router.back()} rutaId={id} />;
}
