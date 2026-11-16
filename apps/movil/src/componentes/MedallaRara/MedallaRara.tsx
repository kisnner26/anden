import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { BrilloQueBarre } from '@/componentes/BrilloQueBarre';
import { Bloque } from '@/componentes/Bloque';
import { formatoFechaCorta } from '@/datos/formato';
import type { SelloRaro } from '@/datos/pasaporte';
import { conAlfa } from '@/tema/alfa';
import { paletaPasaporte as p } from '@/tema/colores';
import { espacios } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesMedallaRara {
  /** posición en la lista, para que se encadenen al entrar */
  indice?: number;
  raro: SelloRaro;
  /** falso mientras la medalla todavía no se ve: espera para dar su salto */
  activo?: boolean;
}

const TAMANO = 64;

/** el dibujo de cada sello raro, de una sola línea: el sol que sale, la luna, el ciclo, tres ciudades y la brújula */
function Glifo({ id, color }: { id: SelloRaro['id']; color: string }) {
  const comun = {
    fill: 'none',
    stroke: color,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 3,
  };
  return (
    <Svg height={TAMANO} viewBox="0 0 64 64" width={TAMANO}>
      <G {...comun}>
        {id === 'madrugador' ? (
          <>
            <Path d="M16 42 H48 M22 42 A10 10 0 0 1 42 42" />
            <Path d="M32 22 V17 M19 28 L15 24 M45 28 L49 24 M12 36 H8 M52 36 H56" />
          </>
        ) : id === 'nocturno' ? (
          <>
            <Path d="M40 18 A15 15 0 1 0 46 40 A12 12 0 0 1 40 18 Z" />
            <Path d="M44 14 V20 M41 17 H47" />
          </>
        ) : id === 'constante' ? (
          <>
            <Path d="M18 30 A14 14 0 0 1 44 24 M44 24 L45 15 M44 24 L35 25" />
            <Path d="M46 34 A14 14 0 0 1 20 40 M20 40 L19 49 M20 40 L29 39" />
          </>
        ) : id === 'tresCiudades' ? (
          <>
            <Path d="M32 16 L16 44 H48 Z" />
            <Circle cx={32} cy={16} fill={color} r={4} />
            <Circle cx={16} cy={44} fill={color} r={4} />
            <Circle cx={48} cy={44} fill={color} r={4} />
          </>
        ) : (
          <>
            <Circle cx={32} cy={32} r={19} />
            <Path d="M32 17 L37 32 L32 47 L27 32 Z" />
            <Path d="M17 32 H47" />
          </>
        )}
      </G>
    </Svg>
  );
}

/**
 * un sello raro como medalla: dorada y con destello cuando se ganó, con aro punteado y barra de avance mientras falta.
 * Al aparecer da un pequeño salto
 */
export function MedallaRara({
  activo = true,
  indice = 0,
  raro,
}: PropiedadesMedallaRara) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const salto = useRef(new Animated.Value(reducido ? 1 : 0)).current;
  const titulo = t(`pasaporte.raro.${raro.id}.titulo`);
  const detalle = t(`pasaporte.raro.${raro.id}.detalle`);
  const fraccion = raro.avance.actual / raro.avance.meta;

  useEffect(() => {
    if (reducido) {
      salto.setValue(1);
      return;
    }
    if (!activo) return;
    const animacion = Animated.spring(salto, {
      delay: indice * movimiento.escalon * 2,
      friction: 5,
      tension: 90,
      toValue: 1,
      useNativeDriver: true,
    });
    animacion.start();
    return () => animacion.stop();
  }, [activo, indice, reducido, salto]);

  return (
    <Bloque estiloContenido={estilos.fila}>
      <View
        accessible
        accessibilityLabel={`${titulo}. ${detalle}${
          raro.desbloqueado
            ? ''
            : `. ${rellenar(t('pasaporte.avance'), { actual: raro.avance.actual, meta: raro.avance.meta })}`
        }`}
        style={estilos.cuerpo}
      >
        <Animated.View
          style={[
            estilos.medalla,
            {
              opacity: salto,
              transform: [
                {
                  scale: salto.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {raro.desbloqueado ? (
            <LinearGradient
              colors={[p.oroClaro, p.oro, p.oroOscuro]}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={estilos.oro}
            >
              <Glifo color={p.cueroOscuro} id={raro.id} />
              <BrilloQueBarre pausa={3800} retardo={indice * 600} />
            </LinearGradient>
          ) : (
            <View
              style={[
                estilos.oro,
                estilos.bloqueada,
                { borderColor: conAlfa(colores.tinta, 0.28) },
              ]}
            >
              <Glifo color={conAlfa(colores.tinta, 0.35)} id={raro.id} />
            </View>
          )}
        </Animated.View>
        <View style={estilos.texto}>
          <Text style={[tipografia.nombreFila, { color: colores.tinta }]}>
            {titulo}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {detalle}
          </Text>
          {raro.desbloqueado ? null : (
            <View style={estilos.avance}>
              <View
                style={[
                  estilos.pista,
                  { backgroundColor: conAlfa(colores.tinta, 0.12) },
                ]}
              >
                <View
                  style={[
                    estilos.relleno,
                    {
                      backgroundColor: colores.ambar,
                      width: `${Math.round(fraccion * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text
                style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
              >
                {rellenar(t('pasaporte.avance'), {
                  actual: raro.avance.actual,
                  meta: raro.avance.meta,
                })}
              </Text>
            </View>
          )}
        </View>
      </View>
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {raro.desbloqueado && raro.cuando
          ? formatoFechaCorta(new Date(raro.cuando))
          : t('pasaporte.bloqueado')}
      </Text>
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  avance: { alignItems: 'center', flexDirection: 'row', gap: espacios.ocho },
  bloqueada: { borderStyle: 'dashed', borderWidth: 2 },
  cuerpo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: espacios.dieciseis,
  },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    padding: espacios.dieciseis,
  },
  medalla: { height: TAMANO, width: TAMANO },
  oro: {
    alignItems: 'center',
    borderRadius: TAMANO / 2,
    height: TAMANO,
    justifyContent: 'center',
    overflow: 'hidden',
    width: TAMANO,
  },
  pista: { borderRadius: 3, flex: 1, height: 6, overflow: 'hidden' },
  relleno: { borderRadius: 3, height: 6 },
  texto: { flex: 1, gap: 4 },
});
