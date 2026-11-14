import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Svg, { Path } from 'react-native-svg';

import { BarridoDeLuz } from '@/componentes/BarridoDeLuz';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Autobus, varianteDeClave } from '@/componentes/Autobus';
import { nombrePropio } from '@/datos/perfil';
import { useBusPropio } from '@/datos/useBusPropio';
import { useSuscripcion } from '@/datos/useSuscripcion';
import { formatoFechaCorta, formatoHoraCompleta } from '@/datos/formato';
import type { BoletoGuardado } from '@/datos/reserva';
import { espacios, radios, tamanosBoleto } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';
import { puntoCorto } from '@/datos/puntoEncuentro';

export interface PropiedadesTalonBoleto {
  guardado: BoletoGuardado;
}

/** cuánto tarda en caer la mitad que se queda el chofer; con el temblor previo y el sello, todo dura poco más de dos segundos */
const DURACION_RASGADO = 900;
const ESPERA_RASGADO = 320;
const DIENTES = 22;

/** el borde rasgado de la mitad que se desprende: una hilera de dientes que apuntan hacia arriba */
function BordeRasgado({ color }: { color: string }) {
  const ancho = 120;
  const paso = ancho / DIENTES;
  let trazo = `M0 8 `;
  for (let i = 0; i < DIENTES; i += 1) {
    const x = i * paso;
    trazo += `L${x + paso / 2} ${i % 3 === 0 ? 0 : 2} L${x + paso} 8 `;
  }
  trazo += 'Z';
  return (
    <Svg
      height={8}
      preserveAspectRatio="none"
      style={estilos.dientes}
      viewBox={`0 0 ${ancho} 8`}
      width="100%"
    >
      <Path d={trazo} fill={color} />
    </Svg>
  );
}

function Casilla({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const { colores } = useTema();
  return (
    <View
      style={[estilos.casilla, { backgroundColor: colores.bloqueNegroClaro }]}
    >
      <Text style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}>
        {etiqueta}
      </Text>
      <Text style={[tipografia.casillaBoleto, { color: colores.ambar }]}>
        {valor}
      </Text>
    </View>
  );
}

function Campo({
  completo = false,
  etiqueta,
  valor,
}: {
  completo?: boolean;
  etiqueta: string;
  valor: string;
}) {
  const { colores } = useTema();
  return (
    <View style={[estilos.campo, completo && estilos.campoCompleto]}>
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {etiqueta}
      </Text>
      <Text style={[tipografia.dato, { color: colores.tintaPapel }]}>
        {valor}
      </Text>
    </View>
  );
}

/** el boleto en papel crema con su línea perforada, el código de abordaje y el QR; se lee sin conexión */
export function TalonBoleto({ guardado }: PropiedadesTalonBoleto) {
  const { colores } = useTema();
  const { efectivo } = useBusPropio();
  const { plus } = useSuscripcion();
  const { boleto, resumen } = guardado;
  const salida = new Date(resumen.salida);
  const reducirMovimiento = useMovimientoReducido();
  const anterior = useRef(boleto.estado);
  const yaUsado = boleto.estado === 'usado';
  const rasgado = useSharedValue(yaUsado ? 1 : 0);
  const temblor = useSharedValue(0);
  const sello = useSharedValue(yaUsado ? 1 : 0);
  // cuando el chofer escanea, la mitad del QR se desprende y se la queda: pasado un rato ya no se dibuja
  const [retirada, establecerRetirada] = useState(yaUsado);
  const estiloSuperior = useAnimatedStyle(() => ({
    transform: [
      { translateX: temblor.value },
      { translateY: -rasgado.value * 4 },
    ],
  }));
  const estiloInferior = useAnimatedStyle(() => ({
    opacity: 1 - rasgado.value * 0.92,
    transform: [
      { translateY: rasgado.value * 150 },
      { translateX: rasgado.value * 26 },
      { rotate: `${rasgado.value * 14}deg` },
    ],
    transformOrigin: 'left top',
  }));
  const estiloDientes = useAnimatedStyle(() => ({
    opacity: Math.min(1, rasgado.value * 12),
  }));
  const estiloSello = useAnimatedStyle(() => ({
    opacity: sello.value,
    transform: [{ scale: 1.25 - sello.value * 0.25 }, { rotate: '-7deg' }],
  }));

  useEffect(() => {
    if (anterior.current === boleto.estado) return;
    anterior.current = boleto.estado;
    if (boleto.estado !== 'usado') return;
    if (reducirMovimiento) {
      rasgado.value = 1;
      sello.value = 1;
      establecerRetirada(true);
      return;
    }
    // primero tiembla, como cuando el papel se tensa, y después se rasga y cae
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    temblor.value = withSequence(
      withTiming(-3, { duration: 45 }),
      withTiming(3, { duration: 80 }),
      withTiming(-3, { duration: 80 }),
      withTiming(0, { duration: 45 }),
    );
    const rasgar = setTimeout(() => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, ESPERA_RASGADO);
    rasgado.value = withDelay(
      ESPERA_RASGADO,
      withTiming(1, {
        duration: DURACION_RASGADO,
        easing: Easing.in(Easing.cubic),
      }),
    );
    sello.value = withDelay(
      ESPERA_RASGADO + DURACION_RASGADO * 0.6,
      withTiming(1, { duration: 450 }),
    );
    const retirar = setTimeout(
      () => establecerRetirada(true),
      ESPERA_RASGADO + DURACION_RASGADO + 250,
    );
    return () => {
      clearTimeout(rasgar);
      clearTimeout(retirar);
    };
  }, [boleto.estado, rasgado, reducirMovimiento, sello, temblor]);

  return (
    <View
      accessibilityLabel={`${t('boleto.titulo')} ${resumen.destino}, ${t('boleto.codigo')} ${boleto.codigo}`}
      style={estilos.contenedor}
      testID="talon-boleto"
    >
      <Animated.View
        style={[
          estilos.mitadSuperior,
          retirada && estilos.mitadSuperiorSola,
          { backgroundColor: colores.bloqueNegro },
          estiloSuperior,
        ]}
        testID="talon-mitad-superior"
      >
        <BarridoDeLuz radio={0} retraso={600} />
        <View style={estilos.fila}>
          <Text
            style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
          >
            {`${t('boleto.titulo')} · ${t('boleto.reservado')}${plus ? ` · ${t('plus.marca')}` : ''}`}
          </Text>
          <Text style={[tipografia.dato, { color: colores.ambar }]}>
            {`C$ ${boleto.precio}`}
          </Text>
        </View>
        <View style={estilos.destinoYBus}>
          <View style={estilos.destinoColumna}>
            <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
              {t('boleto.hacia')}
            </Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={[tipografia.titularBoleto, { color: colores.sobreNegro }]}
            >
              {resumen.destino}
            </Text>
            <Text
              style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
            >
              {`${t('boleto.desde')} ${resumen.origen ?? t('horarios.terminal')}`}
            </Text>
          </View>
          <Autobus
            ancho={118}
            letrero={resumen.destino.toUpperCase()}
            variante={efectivo ?? varianteDeClave(resumen.destino)}
          />
        </View>
        <View style={estilos.fila}>
          <View
            style={[
              estilos.casilla,
              estilos.casillaSalida,
              { backgroundColor: colores.bloqueNegroClaro },
            ]}
          >
            <Text
              style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
            >
              {t('boleto.sale')}
            </Text>
            <Text
              style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
            >
              {formatoFechaCorta(salida)}
            </Text>
            <Text style={[tipografia.dato, { color: colores.sobreNegro }]}>
              {formatoHoraCompleta(salida)}
            </Text>
          </View>
          <Casilla
            etiqueta={t('boletos.encuentroCorto')}
            valor={puntoCorto(resumen.puntoEncuentro) || '—'}
          />
          <Casilla
            etiqueta={t('boleto.asiento')}
            valor={String(boleto.asiento)}
          />
        </View>
        {boleto.estado === 'usado' && (
          <Animated.View style={[estilos.sello, estiloSello]}>
            <Text
              style={[
                tipografia.sello,
                estilos.textoSello,
                { color: colores.ambarTitular },
              ]}
            >
              {t('boleto.usado')}
            </Text>
          </Animated.View>
        )}
      </Animated.View>

      {!retirada && (
        <Animated.View
          style={[
            estilos.mitadInferior,
            { backgroundColor: colores.papel },
            estiloInferior,
          ]}
          testID="talon-mitad-inferior"
        >
          <Animated.View
            pointerEvents="none"
            style={[estilos.bordeRasgado, estiloDientes]}
          >
            <BordeRasgado color={colores.papel} />
          </Animated.View>
          <View style={estilos.perforacion}>
            <View
              style={[
                estilos.muesca,
                estilos.muescaIzquierda,
                { backgroundColor: colores.fondo },
              ]}
            />
            <View
              style={[estilos.linea, { borderColor: colores.tintaSuave }]}
            />
            <View
              style={[
                estilos.muesca,
                estilos.muescaDerecha,
                { backgroundColor: colores.fondo },
              ]}
            />
          </View>

          <View style={[estilos.cuerpo, estilos.pasajeroFila]}>
            <Campo
              completo
              etiqueta={t('boleto.pasajero')}
              valor={nombrePropio(boleto.pasajero.nombre)}
            />
            <Campo etiqueta={t('boleto.placa')} valor={resumen.placa} />
            <Campo etiqueta={t('boleto.chofer')} valor={resumen.choferNombre} />
          </View>

          <View style={[estilos.cuerpo, estilos.talon]}>
            <View style={estilos.codigo}>
              <Text
                style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
              >
                {t('boleto.codigo')}
              </Text>
              <Text
                accessibilityLabel={boleto.codigo}
                style={[tipografia.codigoBoleto, { color: colores.tintaPapel }]}
              >
                {`${boleto.codigo.slice(0, 4)} ${boleto.codigo.slice(4)}`}
              </Text>
              <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
                {t('boleto.ayuda')}
              </Text>
            </View>
            <View accessibilityLabel={`QR ${boleto.codigo}`} accessible>
              <QRCode
                backgroundColor={colores.papel}
                color={colores.tintaPapel}
                size={96}
                value={`ANDEN:${boleto.codigo}`}
              />
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: { flex: 1, gap: 2, minWidth: '40%' },
  campoCompleto: { flexBasis: '100%', flexGrow: 0 },
  casilla: {
    borderRadius: radios.casilla,
    gap: espacios.cuatro,
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.doce,
  },
  casillaSalida: { flex: 1 },
  destinoColumna: { flex: 1, gap: espacios.cuatro },
  destinoYBus: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
  },
  pasajeroFila: {
    columnGap: espacios.doce,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: espacios.dieciseis,
  },
  codigo: { flex: 1, gap: espacios.cuatro },
  cuerpo: { gap: espacios.doce, padding: espacios.veinticuatro },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'space-between',
  },
  linea: {
    borderStyle: 'dashed',
    borderTopWidth: 2,
    flex: 1,
    marginHorizontal: 18,
  },
  muesca: {
    borderRadius: radios.pildora,
    height: tamanosBoleto.muesca,
    position: 'absolute',
    top: 0,
    width: tamanosBoleto.muesca,
  },
  muescaDerecha: { right: -tamanosBoleto.muesca / 2 },
  muescaIzquierda: { left: -tamanosBoleto.muesca / 2 },
  contenedor: { zIndex: 1 },
  mitadSuperior: {
    borderTopLeftRadius: radios.bloque,
    borderTopRightRadius: radios.bloque,
    gap: espacios.dieciseis,
    overflow: 'hidden',
    padding: espacios.veinticuatro,
    zIndex: 1,
  },
  /** ya sin la otra mitad, el boleto se cierra con sus esquinas de abajo redondeadas */
  mitadSuperiorSola: {
    borderBottomLeftRadius: radios.bloque,
    borderBottomRightRadius: radios.bloque,
  },
  mitadInferior: {
    borderBottomLeftRadius: radios.bloque,
    borderBottomRightRadius: radios.bloque,
    zIndex: 2,
  },
  bordeRasgado: { height: 8, left: 0, position: 'absolute', right: 0, top: -7 },
  dientes: { height: 8, width: '100%' },
  sello: {
    alignSelf: 'center',
    borderRadius: radios.casilla,
    borderWidth: 3,
    paddingHorizontal: espacios.veinticuatro,
    paddingVertical: espacios.ocho,
  },
  textoSello: { textAlign: 'center', textTransform: 'uppercase' },
  /** una franja propia entre el negro y el crema: nada se encima y las muescas quedan centradas */
  perforacion: {
    alignItems: 'center',
    flexDirection: 'row',
    height: tamanosBoleto.muesca,
  },
  talon: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
