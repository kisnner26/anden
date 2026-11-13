import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrbeIA } from '@/componentes/OrbeIA';
import { useIA } from '@/datos/useIA';
import { useSesion } from '@/datos/useSesion';
import { t } from '@/textos/t';

/** pantallas donde el orbe estorba: el propio asistente, el ingreso y el panel del conductor */
const SIN_ORBE = [
  '/asistente',
  '/ingresar',
  '/cuenta',
  '/registro-conductor',
  '/conductor',
];

/**
 * el orbe de la IA siempre a mano: flota sobre toda la app para quien activó el asistente y, al
 * tocarlo, abre la conversación desde cualquier pantalla
 */
export function OrbeFlotante() {
  const { usable } = useIA();
  const { rol, sesion } = useSesion();
  const ruta = usePathname();
  const router = useRouter();
  const margenes = useSafeAreaInsets();

  if (!usable || !sesion || rol === 'conductor') return null;
  if (SIN_ORBE.some((prefijo) => ruta.startsWith(prefijo))) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[estilos.capa, { bottom: margenes.bottom + 96 }]}
    >
      <OrbeIA
        alPresionar={() => router.push('/asistente')}
        etiquetaAccesible={t('ia.entrada')}
        tamano={34}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  capa: { position: 'absolute', right: 0 },
});
