import { Animated, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatoFechaCorta, formatoHoraCompleta } from '@/datos/formato';
import type { BoletoGuardado } from '@/datos/reserva';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesOverlayBoleto {
  guardado: BoletoGuardado;
  /** de 0 a 1: qué tanto se ha arrastrado el boleto hacia arriba */
  progreso: Animated.Value;
  /** tamaño del QR, para pruebas y pantallas chicas */
  tamanoQR?: number;
}

/**
 * el boleto grande que aparece mientras se arrastra: fondo claro, el QR enorme para que el chofer lo lea
 * sin esfuerzo y el código; crece y se aclara con el avance del arrastre, y desaparece al soltar
 */
export function OverlayBoleto({
  guardado,
  progreso,
  tamanoQR = 260,
}: PropiedadesOverlayBoleto) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { boleto, resumen } = guardado;
  const salida = new Date(resumen.salida);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[
        estilos.fondo,
        {
          backgroundColor: colores.papel,
          opacity: progreso.interpolate({
            extrapolate: 'clamp',
            inputRange: [0, 0.5],
            outputRange: [0, 0.97],
          }),
          paddingBottom: margenes.bottom + espacios.veinticuatro,
          paddingTop: margenes.top + espacios.veinticuatro,
        },
      ]}
      testID="boleto-ampliado"
    >
      <Animated.View
        style={[
          estilos.contenido,
          {
            transform: [
              // el papel se levanta y se curva hacia quien lo mira mientras se arrastra, y se aplana al llegar arriba
              { perspective: 900 },
              {
                rotateX: progreso.interpolate({
                  extrapolate: 'clamp',
                  inputRange: [0, 1],
                  outputRange: ['38deg', '0deg'],
                }),
              },
              {
                scale: progreso.interpolate({
                  extrapolate: 'clamp',
                  inputRange: [0, 1],
                  outputRange: [0.6, 1],
                }),
              },
              {
                translateY: progreso.interpolate({
                  extrapolate: 'clamp',
                  inputRange: [0, 1],
                  outputRange: [90, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
          {`${t('boleto.hacia')} ${resumen.destino}`}
        </Text>
        <Text style={[tipografia.titulo, { color: colores.tintaPapel }]}>
          {`${formatoFechaCorta(salida)} · ${formatoHoraCompleta(salida)}`}
        </Text>
        <View
          accessibilityLabel={`QR ${boleto.codigo}`}
          accessible
          style={[estilos.qr, { backgroundColor: colores.papel }]}
        >
          <QRCode
            backgroundColor={colores.papel}
            color={colores.tintaPapel}
            size={tamanoQR}
            value={`ANDEN:${boleto.codigo}`}
          />
        </View>
        <Text style={[tipografia.display, { color: colores.tintaPapel }]}>
          {`${boleto.codigo.slice(0, 4)} ${boleto.codigo.slice(4)}`}
        </Text>
        <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
          {`${t('boleto.asiento')} ${boleto.asiento}`}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  contenido: { alignItems: 'center', gap: espacios.dieciseis },
  fondo: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  qr: { borderRadius: radios.bloque, padding: espacios.dieciseis },
});
