import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { formatoFechaCorta, formatoHoraCompleta } from '@/datos/formato';
import type { BoletoGuardado } from '@/datos/reserva';
import { espacios } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesTalonBoleto {
  guardado: BoletoGuardado;
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const { colores } = useTema();
  return (
    <View style={estilos.campo}>
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
  const { boleto, resumen } = guardado;
  const salida = new Date(resumen.salida);
  const reducirMovimiento = useReducedMotion();
  const anterior = useRef(boleto.estado);
  const separacion = useSharedValue(boleto.estado === 'usado' ? 1 : 0);
  const sello = useSharedValue(boleto.estado === 'usado' ? 1 : 0);
  const estiloTalon = useAnimatedStyle(() => ({
    transform: [{ translateX: separacion.value * 10 }],
  }));
  const estiloSello = useAnimatedStyle(() => ({ opacity: sello.value }));

  useEffect(() => {
    if (anterior.current === boleto.estado) return;
    anterior.current = boleto.estado;
    if (boleto.estado !== 'usado') return;
    if (reducirMovimiento) {
      separacion.value = 1;
      sello.value = 1;
      return;
    }
    separacion.value = withTiming(1, { duration: movimiento.abordaje });
    sello.value = withTiming(1, { duration: movimiento.abordaje });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [boleto.estado, reducirMovimiento, sello, separacion]);

  return (
    <View
      accessibilityLabel={`${t('boleto.titulo')} ${resumen.destino}, ${t('boleto.codigo')} ${boleto.codigo}`}
      style={[estilos.papel, { backgroundColor: colores.papel }]}
      testID="talon-boleto"
    >
      <View style={estilos.cuerpo}>
        <View style={estilos.fila}>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {`${t('boleto.titulo')} · ${t('boleto.reservado')}`}
          </Text>
          <Text
            style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
          >{`C$ ${boleto.precio}`}</Text>
        </View>
        <Text style={[estilos.destino, { color: colores.tintaPapel }]}>
          {`UCA → ${resumen.destino}.`}
        </Text>
        <View style={estilos.campos}>
          <Campo
            etiqueta={t('boleto.sale')}
            valor={`${formatoFechaCorta(salida)}, ${formatoHoraCompleta(salida)}`}
          />
          <Campo etiqueta={t('boleto.anden')} valor={String(resumen.anden)} />
          <Campo
            etiqueta={t('boleto.asiento')}
            valor={String(boleto.asiento)}
          />
          <Campo
            etiqueta={t('boleto.pasajero')}
            valor={boleto.pasajero.nombre}
          />
          <Campo etiqueta={t('boleto.placa')} valor={resumen.placa} />
          <Campo etiqueta={t('boleto.chofer')} valor={resumen.choferNombre} />
        </View>
      </View>

      <View style={estilos.perforacion}>
        <View
          style={[
            estilos.muesca,
            estilos.muescaIzquierda,
            { backgroundColor: colores.fondo },
          ]}
        />
        <View style={[estilos.linea, { borderColor: colores.tintaSuave }]} />
        <View
          style={[
            estilos.muesca,
            estilos.muescaDerecha,
            { backgroundColor: colores.fondo },
          ]}
        />
      </View>

      <Animated.View style={[estilos.cuerpo, estilos.talon, estiloTalon]}>
        <View style={estilos.codigo}>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {t('boleto.codigo')}
          </Text>
          <Text
            accessibilityLabel={boleto.codigo}
            style={[estilos.numero, { color: colores.tintaPapel }]}
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
      </Animated.View>
      {boleto.estado === 'usado' && (
        <Animated.Text style={[estilos.sello, { color: colores.ambarTitular }, estiloSello]}>
          {t('boleto.usado')}
        </Animated.Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: { gap: 2, width: '48%' },
  campos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacios.doce,
    rowGap: espacios.dieciseis,
  },
  codigo: { flex: 1, gap: espacios.cuatro },
  cuerpo: { gap: espacios.doce, padding: espacios.veinticuatro },
  destino: {
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 44,
    lineHeight: 46,
  },
  fila: { flexDirection: 'row', justifyContent: 'space-between' },
  linea: {
    borderStyle: 'dashed',
    borderTopWidth: 2,
    flex: 1,
    marginHorizontal: 18,
  },
  muesca: {
    borderRadius: 999,
    height: 28,
    position: 'absolute',
    top: -14,
    width: 28,
  },
  muescaDerecha: { right: -14 },
  muescaIzquierda: { left: -14 },
  numero: {
    fontFamily: 'JetBrainsMono_600SemiBold',
    fontSize: 26,
    letterSpacing: 1.5,
    lineHeight: 30,
  },
  papel: { borderRadius: 26, overflow: 'hidden' },
  perforacion: { alignItems: 'center', flexDirection: 'row', height: 1 },
  talon: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: espacios.veinticuatro,
  },
  sello: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 22,
    letterSpacing: 2,
    paddingBottom: espacios.dieciseis,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
