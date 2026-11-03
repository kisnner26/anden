import { useRouter } from 'expo-router';

import { PerfilUsuario } from '@/pantallas/PerfilUsuario';

export default function RutaPerfil() {
  const router = useRouter();
  return <PerfilUsuario alVolver={() => router.back()} />;
}
