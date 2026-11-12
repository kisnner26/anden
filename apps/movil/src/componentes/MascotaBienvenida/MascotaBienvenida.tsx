import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Autobus } from '@/componentes/Autobus';
import { Bloque } from '@/componentes/Bloque';
import { franjaDelDia } from '@/datos/mascota';
import { reproducirSonido } from '@/datos/sonidos';
import { useMascota } from '@/datos/useMascota';
import { espacios } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useModoUso } from '@/tema/useModoUso';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

const ANCHO_BUS = 104;

export interface PropiedadesMascotaBienvenida {
  ahora: Date;
  /** primer nombre de la persona, si ya tiene cuenta */
  nombre: string;
  /** aviso de la próxima salida; sin él dice que no quedan salidas */
  proximaSalida?: { destino: string; hora: string };
}

/** el bus de personaje saluda según la hora; al tocarlo toca la bocina. No se dibuja si la persona la apagó */
export function MascotaBienvenida({
  ahora,
  nombre,
  proximaSalida,
}: PropiedadesMascotaBienvenida) {
  const { colores } = useTema();
  const { activa: encendida } = useMascota();
  const { ajustes } = useModoUso();
  const activa = encendida && ajustes.mostrarMascota;
  const reducir = useMovimientoReducido();
  const meceo = useSharedValue(0);
  const rebote = useSharedValue(1);
  const [tocada, establecerTocada] = useState(false);

  useEffect(() => {
    if (reducir || !activa) return;
    meceo.value = withRepeat(
      withSequence(
        withTiming(1, { duration: movimiento.vaivenBus }),
        withTiming(0, { duration: movimiento.vaivenBus }),
      ),
      -1,
    );
  }, [activa, meceo, reducir]);

  const estiloBus = useAnimatedStyle(() => ({
    transform: [
      { translateY: -movimiento.amplitudMascota * meceo.value },
      { scale: rebote.value },
    ],
  }));

  if (!activa) return null;

  const saludo = t(`mascota.${franjaDelDia(ahora.getHours())}`);
  const titulo = nombre === '' ? saludo : `${saludo}, ${nombre}`;
  const detalle = tocada
    ? t('mascota.bocina')
    : proximaSalida
      ? `${t('mascota.proximo')} ${proximaSalida.destino} ${t('mascota.sale')} ${proximaSalida.hora}`
      : t('mascota.sinSalidas');

  function tocar() {
    establecerTocada(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
      () => undefined,
    );
    void reproducirSonido('bocina');
    if (!reducir) {
      rebote.value = withSequence(
        withTiming(0.88, { duration: movimiento.reboteMascota / 3 }),
        withSpring(1, { damping: 6, stiffness: 160 }),
      );
    }
  }

  return (
    <Pressable
      accessibilityHint={t('mascota.etiqueta')}
      accessibilityLabel={`${titulo}. ${detalle}`}
      accessibilityRole="button"
      onPress={tocar}
      testID="mascota-bienvenida"
    >
      <Bloque estiloContenido={estilos.fila}>
        <Animated.View style={estiloBus}>
          <Autobus ancho={ANCHO_BUS} letrero="ANDÉN" />
        </Animated.View>
        <View style={estilos.texto}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {titulo}
          </Text>
          <Text
            accessibilityLiveRegion="polite"
            style={[tipografia.pequeno, { color: colores.tintaSuave }]}
          >
            {detalle}
          </Text>
        </View>
      </Bloque>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
    padding: espacios.dieciseis,
  },
  texto: { flex: 1, gap: espacios.cuatro },
});
