import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aparece } from '@/componentes/Aparece';
import { BotonAccion } from '@/componentes/BotonAccion';
import { ExplosionConfirmacion } from '@/componentes/ExplosionConfirmacion';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { reproducirSonido } from '@/datos/sonidos';
import { BENEFICIOS_PLUS } from '@/servicios/beneficios';
import { espacios, tamanosIlustracion } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesBienvenidaPlus {
  alEmpezar: () => void;
}

/** pantalla completa al activar Plus: el sello entra con resorte, llueven los anillos y se agradece antes de seguir */
export function BienvenidaPlus({ alEmpezar }: PropiedadesBienvenidaPlus) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const reducir = useMovimientoReducido();
  const escala = useSharedValue(reducir ? 1 : 0.15);
  const giro = useSharedValue(reducir ? 0 : -25);
  const brillo = useSharedValue(reducir ? 1 : 0);

  const estiloSello = useAnimatedStyle(() => ({
    transform: [{ scale: escala.value }, { rotate: `${giro.value}deg` }],
  }));
  const estiloBrillo = useAnimatedStyle(() => ({
    opacity: brillo.value * 0.35,
    transform: [{ scale: 0.8 + brillo.value * 0.6 }],
  }));

  useEffect(() => {
    if (!reducir) {
      escala.value = withSpring(1, { damping: 7, stiffness: 100 });
      giro.value = withSpring(0, { damping: 9, stiffness: 90 });
      brillo.value = withDelay(250, withTiming(1, { duration: 900 }));
    }
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => undefined);
    void reproducirSonido('plus');
  }, [brillo, escala, giro, reducir]);

  return (
    <View
      accessibilityViewIsModal
      style={[estilos.pantalla, { backgroundColor: colores.fondo }]}
      testID="bienvenida-plus"
    >
      <ScrollView
        contentContainerStyle={[
          estilos.contenido,
          {
            paddingBottom: margenes.bottom + espacios.cuarentaYOcho,
            paddingTop: margenes.top + espacios.cuarentaYOcho,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={estilos.insignia}>
          <Animated.View
            style={[
              estilos.brillo,
              { backgroundColor: colores.ambar },
              estiloBrillo,
            ]}
          />
          <ExplosionConfirmacion />
          <Animated.View style={estiloSello}>
            <Loseta
              tamano={tamanosIlustracion.confirmacionReserva}
              variante="ambar"
            >
              <Icono
                color={colores.sobreAmbar}
                nombre="estrella"
                tamano="ilustracion"
              />
            </Loseta>
          </Animated.View>
        </View>

        <Aparece indice={2}>
          <Text
            accessibilityRole="header"
            style={[
              tipografia.display,
              estilos.centrado,
              { color: colores.tinta },
            ]}
          >
            {t('plus.bienvenidaTitulo')}.
          </Text>
        </Aparece>
        <Aparece indice={3}>
          <Text
            style={[
              tipografia.cuerpo,
              estilos.centrado,
              { color: colores.tintaSuave },
            ]}
          >
            {t('plus.bienvenidaGracias')}
          </Text>
        </Aparece>

        <View style={estilos.lista}>
          <Text
            style={[
              tipografia.etiqueta,
              estilos.centrado,
              { color: colores.ambarTexto },
            ]}
          >
            {t('plus.bienvenidaLista')}
          </Text>
          {BENEFICIOS_PLUS.map((beneficio, indice) => (
            <Aparece indice={4 + indice} key={beneficio.id}>
              <View style={estilos.fila}>
                <View
                  style={[
                    estilos.icono,
                    { backgroundColor: colores.bloqueNegro },
                  ]}
                >
                  <Icono
                    color={colores.ambar}
                    nombre={beneficio.icono}
                    tamano="mediano"
                  />
                </View>
                <Text
                  style={[
                    tipografia.nombreFila,
                    estilos.textoFila,
                    { color: colores.tinta },
                  ]}
                >
                  {t(`plus.${beneficio.id}Titulo`)}
                </Text>
              </View>
            </Aparece>
          ))}
        </View>

        <BotonAccion
          alPresionar={alEmpezar}
          etiqueta={t('plus.bienvenidaEmpezar')}
        />
      </ScrollView>
    </View>
  );
}

const TAMANO_ICONO = 40;

const estilos = StyleSheet.create({
  brillo: {
    borderRadius: 999,
    height: 220,
    position: 'absolute',
    width: 220,
  },
  centrado: { textAlign: 'center' },
  contenido: {
    gap: espacios.veinticuatro,
    paddingHorizontal: espacios.lateral,
  },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
  },
  icono: {
    alignItems: 'center',
    borderRadius: 999,
    height: TAMANO_ICONO,
    justifyContent: 'center',
    width: TAMANO_ICONO,
  },
  insignia: {
    alignItems: 'center',
    height: tamanosIlustracion.confirmacionReserva * 2.6,
    justifyContent: 'center',
  },
  lista: { gap: espacios.doce },
  pantalla: { ...StyleSheet.absoluteFill },
  textoFila: { flex: 1 },
});
