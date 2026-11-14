import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aparece } from '@/componentes/Aparece';
import { BarridoDeLuz } from '@/componentes/BarridoDeLuz';
import { BotonAccion } from '@/componentes/BotonAccion';
import { ExplosionConfirmacion } from '@/componentes/ExplosionConfirmacion';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';

import { AnillosPlus, DestellosPlus, RayosPlus } from './EfectosPlus';
import { reproducirSonido } from '@/datos/sonidos';
import { BENEFICIOS_PLUS } from '@/servicios/beneficios';
import { espacios, radios, tamanosIlustracion } from '@/tema/espacios';
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
  const escala = useSharedValue(reducir ? 1 : 0.35);
  const giro = useSharedValue(reducir ? 0 : -30);
  const caida = useSharedValue(reducir ? 0 : -260);
  const flotar = useSharedValue(0);
  const brillo = useSharedValue(reducir ? 1 : 0);

  const estiloSello = useAnimatedStyle(() => ({
    transform: [
      { translateY: caida.value + flotar.value },
      { scale: escala.value },
      { rotate: `${giro.value}deg` },
    ],
  }));
  const estiloBrillo = useAnimatedStyle(() => ({
    opacity: brillo.value * 0.4,
    transform: [{ scale: 0.8 + brillo.value * 0.7 }],
  }));

  useEffect(() => {
    const temporizadores: ReturnType<typeof setTimeout>[] = [];
    if (!reducir) {
      // el sello cae desde arriba, rebota al llegar y después flota despacio
      caida.value = withSpring(0, { damping: 9, stiffness: 85 });
      escala.value = withSpring(1, { damping: 7, stiffness: 100 });
      giro.value = withSpring(0, { damping: 9, stiffness: 90 });
      brillo.value = withDelay(250, withTiming(1, { duration: 900 }));
      flotar.value = withDelay(
        1500,
        withRepeat(
          withSequence(
            withTiming(-7, { duration: 1700 }),
            withTiming(7, { duration: 1700 }),
          ),
          -1,
          true,
        ),
      );
      // el golpe al aterrizar y un toque suave por cada beneficio que aparece
      temporizadores.push(
        setTimeout(() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(
            () => undefined,
          );
        }, 420),
      );
      BENEFICIOS_PLUS.forEach((_, indice) => {
        temporizadores.push(
          setTimeout(
            () => {
              void Haptics.selectionAsync().catch(() => undefined);
            },
            1100 + indice * 160,
          ),
        );
      });
    }
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => undefined);
    void reproducirSonido('plus');
    return () => temporizadores.forEach(clearTimeout);
  }, [brillo, caida, escala, flotar, giro, reducir]);

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
          <RayosPlus />
          <AnillosPlus />
          <Animated.View
            style={[
              estilos.brillo,
              { backgroundColor: colores.ambar },
              estiloBrillo,
            ]}
          />
          <ExplosionConfirmacion />
          <DestellosPlus />
          <Animated.View style={estiloSello}>
            <View style={estilos.cristal}>
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
              <BarridoDeLuz radio={radios.loseta} retraso={900} />
            </View>
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
            <EntradaLateral indice={indice} key={beneficio.id}>
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
            </EntradaLateral>
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

/** cada beneficio entra desde la derecha, uno tras otro, con un pequeño rebote */
function EntradaLateral({
  children,
  indice,
}: {
  children: React.ReactNode;
  indice: number;
}) {
  const reducir = useMovimientoReducido();
  const avance = useSharedValue(reducir ? 1 : 0);

  useEffect(() => {
    if (reducir) return;
    avance.value = withDelay(
      1000 + indice * 160,
      withSpring(1, { damping: 11, stiffness: 120 }),
    );
  }, [avance, indice, reducir]);

  const estilo = useAnimatedStyle(() => ({
    opacity: Math.min(1, avance.value * 1.5),
    transform: [{ translateX: (1 - avance.value) * 60 }],
  }));
  return <Animated.View style={estilo}>{children}</Animated.View>;
}

const TAMANO_ICONO = 40;

const estilos = StyleSheet.create({
  cristal: { borderRadius: radios.loseta, overflow: 'hidden' },
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
