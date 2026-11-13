import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ExplosionConfirmacion } from '@/componentes/ExplosionConfirmacion';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { reproducirSonido } from '@/datos/sonidos';
import { espacios, tamanosIlustracion } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

/** cuánto se queda la pantalla antes de seguir */
const DURACION_MS = 2200;
const DURACION_REDUCIDA_MS = 900;

export interface PropiedadesCuentaCreada {
  /** se llama solo, cuando termina la celebración */
  alTerminar: () => void;
  nombre: string;
}

/** pantalla completa de bienvenida al crear la cuenta: el sello amarillo entra con resorte y los anillos laten */
export function CuentaCreada({ alTerminar, nombre }: PropiedadesCuentaCreada) {
  const { colores } = useTema();
  const reducir = useMovimientoReducido();
  const escala = useSharedValue(reducir ? 1 : 0.2);
  const texto = useSharedValue(reducir ? 1 : 0);

  const estiloSello = useAnimatedStyle(() => ({
    transform: [{ scale: escala.value }],
  }));
  const estiloTexto = useAnimatedStyle(() => ({
    opacity: texto.value,
    transform: [{ translateY: (1 - texto.value) * espacios.dieciseis }],
  }));

  useEffect(() => {
    if (!reducir) {
      escala.value = withSpring(1, { damping: 8, stiffness: 110 });
      texto.value = withDelay(450, withTiming(1, { duration: 500 }));
    }
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => undefined);
    void reproducirSonido('bienvenida');
    const pausa = setTimeout(
      alTerminar,
      reducir ? DURACION_REDUCIDA_MS : DURACION_MS,
    );
    return () => clearTimeout(pausa);
  }, [alTerminar, escala, reducir, texto]);

  return (
    <View
      accessibilityLiveRegion="assertive"
      style={[estilos.pantalla, { backgroundColor: colores.fondo }]}
      testID="cuenta-creada"
    >
      <View style={estilos.insignia}>
        <ExplosionConfirmacion />
        <Animated.View style={estiloSello}>
          <Loseta
            tamano={tamanosIlustracion.confirmacionReserva}
            variante="ambar"
          >
            <Icono
              color={colores.sobreAmbar}
              nombre="confirmar"
              tamano="ilustracion"
            />
          </Loseta>
        </Animated.View>
      </View>
      <Animated.View style={[estilos.textos, estiloTexto]}>
        <Text
          style={[
            tipografia.titularPantalla,
            estilos.centrado,
            { color: colores.tinta },
          ]}
        >
          {rellenar(t('cuenta.bienvenida'), { nombre })}
        </Text>
        <Text
          style={[
            tipografia.cuerpo,
            estilos.centrado,
            { color: colores.tintaSuave },
          ]}
        >
          {t('cuenta.bienvenidaDetalle')}
        </Text>
      </Animated.View>
    </View>
  );
}

const estilos = StyleSheet.create({
  centrado: { textAlign: 'center' },
  insignia: {
    alignItems: 'center',
    height: tamanosIlustracion.confirmacionReserva * 1.6,
    justifyContent: 'center',
    width: '100%',
  },
  pantalla: {
    alignItems: 'center',
    gap: espacios.veinticuatro,
    justifyContent: 'center',
    paddingHorizontal: espacios.lateral,
    ...StyleSheet.absoluteFill,
  },
  textos: { alignItems: 'center', gap: espacios.ocho },
});
