import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Icono } from '@/componentes/Icono';
import { minutosParaSalir } from '@/datos/disponibilidad';
import { formatoHora, formatoHoraCompleta, sufijoHora } from '@/datos/formato';
import { fraccionDeAsientos, franjaDelDia } from '@/datos/resumenDelDia';
import type { Salida } from '@/datos/salidas';
import { conAlfa } from '@/tema/alfa';
import { coloresFranja } from '@/tema/colores';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

const ANCHO = 128;
const ALTO = 176;
const SEPARACION = espacios.doce;
const RADIO_ANILLO = 15;
const LARGO_ANILLO = 2 * Math.PI * RADIO_ANILLO;

/** el anillo de asientos: se llena según cuántos quedan y lleva el número en el centro */
function AnilloDeAsientos({
  fraccion,
  libres,
}: {
  fraccion: number;
  libres: number;
}) {
  const { colores } = useTema();
  return (
    <View style={estilos.anillo}>
      <Svg height={40} viewBox="0 0 40 40" width={40}>
        <Circle
          cx={20}
          cy={20}
          fill="none"
          r={RADIO_ANILLO}
          stroke={conAlfa(colores.sobreNegro, 0.28)}
          strokeWidth={4}
        />
        <Circle
          cx={20}
          cy={20}
          fill="none"
          origin="20, 20"
          r={RADIO_ANILLO}
          rotation={-90}
          stroke={colores.sobreNegro}
          strokeDasharray={`${LARGO_ANILLO * fraccion} ${LARGO_ANILLO}`}
          strokeLinecap="round"
          strokeWidth={4}
        />
      </Svg>
      <Text
        style={[
          tipografia.etiqueta,
          estilos.numeroAnillo,
          { color: colores.sobreNegro },
        ]}
      >
        {libres}
      </Text>
    </View>
  );
}

function Tarjeta({
  alElegir,
  ahora,
  esProxima,
  indice,
  maximo,
  salio,
  salida,
}: {
  ahora: Date;
  alElegir?: (viajeId: string) => void;
  esProxima: boolean;
  indice: number;
  maximo: number;
  salida: Salida;
  salio: boolean;
}) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const entrada = useRef(new Animated.Value(reducido ? 1 : 0)).current;
  const pulso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducido) return;
    Animated.spring(entrada, {
      delay: Math.min(indice, 8) * 70,
      friction: 8,
      tension: 70,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [entrada, indice, reducido]);

  // la que sigue respira despacio para que se note cuál es sin leer nada
  useEffect(() => {
    if (reducido || !esProxima) return;
    const bucle = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, {
          duration: 1300,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulso, {
          duration: 1300,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    bucle.start();
    return () => bucle.stop();
  }, [esProxima, pulso, reducido]);

  const [claro, oscuro] = coloresFranja[franjaDelDia(salida.salida)];
  const expreso = salida.servicio === 'expreso';
  const falta = minutosParaSalir(salida, ahora);

  return (
    <Animated.View
      style={[
        estilos.envoltura,
        {
          opacity: Animated.multiply(entrada, salio ? 0.5 : 1),
          transform: [
            {
              translateY: entrada.interpolate({
                inputRange: [0, 1],
                outputRange: [24, 0],
              }),
            },
            {
              scale: esProxima
                ? pulso.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.035],
                  })
                : 1,
            },
          ],
        },
      ]}
      testID={
        esProxima ? 'salida-proxima' : salio ? 'salida-pasada' : 'salida-futura'
      }
    >
      <Pressable
        accessibilityLabel={rellenar(t('vistaDia.marca'), {
          destino: salida.destino,
          hora: formatoHoraCompleta(salida.salida),
          libres: salida.asientosLibres,
        })}
        accessibilityRole="button"
        onPress={() => alElegir?.(salida.viajeId)}
        style={({ pressed }) => pressed && estilos.presionada}
      >
        <LinearGradient
          colors={[claro, oscuro]}
          end={{ x: 0.9, y: 1 }}
          start={{ x: 0.1, y: 0 }}
          style={[
            estilos.tarjeta,
            esProxima && { borderColor: colores.sobreNegro, borderWidth: 2 },
          ]}
        >
          <View style={estilos.superior}>
            <Text
              style={[
                tipografia.etiqueta,
                { color: conAlfa(colores.sobreNegro, 0.9) },
              ]}
            >
              {salida.codigoDestino}
            </Text>
            {expreso ? (
              <Icono
                color={colores.sobreNegro}
                nombre="rayo"
                tamano="mediano"
              />
            ) : null}
          </View>
          <View style={estilos.hora}>
            <Text style={[estilos.numeral, { color: colores.sobreNegro }]}>
              {formatoHora(salida.salida)}
            </Text>
            <Text
              style={[
                tipografia.etiqueta,
                { color: conAlfa(colores.sobreNegro, 0.85) },
              ]}
            >
              {esProxima && falta > 0
                ? rellenar(t('vistaDia.enMinutos'), { minutos: falta })
                : sufijoHora(salida.salida)}
            </Text>
          </View>
          <View style={estilos.inferior}>
            <AnilloDeAsientos
              fraccion={fraccionDeAsientos(salida.asientosLibres, maximo)}
              libres={salida.asientosLibres}
            />
            <Text style={[tipografia.dato, { color: colores.sobreNegro }]}>
              {salida.tarifa === null ? '—' : `C$ ${salida.tarifa}`}
            </Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export interface PropiedadesCarruselSalidas {
  ahora: Date;
  alElegir?: (viajeId: string) => void;
  /** si el día es hoy se marca la que sigue y se apagan las que ya salieron */
  esHoy: boolean;
  salidas: readonly Salida[];
}

/**
 * las salidas del día como tarjetas que se deslizan: cada una toma el color del momento del día
 * (amanecer, mañana, tarde, noche), lleva la hora grande, un anillo con los asientos libres y la tarifa
 */
export function CarruselSalidas({
  ahora,
  alElegir,
  esHoy,
  salidas,
}: PropiedadesCarruselSalidas) {
  const { colores } = useTema();
  if (salidas.length === 0) return null;

  const ordenadas = [...salidas].sort(
    (a, b) => a.salida.getTime() - b.salida.getTime(),
  );
  const salio = (salida: Salida) =>
    esHoy && salida.salida.getTime() < ahora.getTime();
  const indiceProxima = ordenadas.findIndex((salida) => !salio(salida));
  const maximo = Math.max(1, ...ordenadas.map((s) => s.asientosLibres));

  return (
    <View style={estilos.contenedor} testID="salidas-del-dia">
      <View style={estilos.cabecera}>
        <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
          {t('vistaDia.lineaTitulo')}
        </Text>
        <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
          {rellenar(
            t(
              ordenadas.length === 1 ? 'vistaDia.cuentaUna' : 'vistaDia.cuenta',
            ),
            { cantidad: ordenadas.length },
          )}
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={estilos.pista}
        contentOffset={{
          x: Math.max(0, indiceProxima) * (ANCHO + SEPARACION),
          y: 0,
        }}
        decelerationRate="fast"
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ANCHO + SEPARACION}
      >
        {ordenadas.map((salida, indice) => (
          <Tarjeta
            ahora={ahora}
            alElegir={alElegir}
            esProxima={esHoy && indice === indiceProxima}
            indice={indice}
            key={salida.viajeId}
            maximo={maximo}
            salida={salida}
            salio={salio(salida)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  anillo: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  cabecera: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contenedor: { gap: espacios.doce },
  envoltura: { width: ANCHO },
  hora: { alignItems: 'flex-start', gap: 0 },
  inferior: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  numeral: {
    fontFamily: tipografia.display.fontFamily,
    fontSize: 46,
    lineHeight: 50,
  },
  numeroAnillo: { position: 'absolute' },
  pista: { gap: SEPARACION, paddingVertical: espacios.cuatro },
  presionada: { opacity: 0.92, transform: [{ scale: 0.97 }] },
  superior: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tarjeta: {
    borderRadius: radios.bloque,
    height: ALTO,
    justifyContent: 'space-between',
    padding: espacios.dieciseis,
    width: ANCHO,
  },
});
