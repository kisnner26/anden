import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icono } from '@/componentes/Icono';
import { antiguedadLegible } from '@/datos/cacheViajes';
import { useAhora } from '@/datos/useSalidas';
import { useConexion } from '@/datos/useConexion';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

/**
 * una píldora que baja desde arriba cuando se pierde la señal ("sin conexión · datos de hace 5 min") y, al
 * volver, cambia a "de vuelta en línea" un momento y se retira; sin señal todo sigue funcionando con lo guardado
 */
export function AvisoConexion() {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const reducido = useMovimientoReducido();
  const { enLinea, recienVuelta, ultimaSincronizacion } = useConexion();
  const ahora = useAhora(60_000);
  const visible = !enLinea || recienVuelta;
  const entrada = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (reducido) {
      entrada.setValue(visible ? 1 : 0);
      return;
    }
    Animated.spring(entrada, {
      friction: 8,
      tension: 90,
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [entrada, reducido, visible]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        estilos.envoltura,
        {
          opacity: entrada,
          top: margenes.top + espacios.cuatro,
          transform: [
            {
              translateY: entrada.interpolate({
                inputRange: [0, 1],
                outputRange: [-60, 0],
              }),
            },
          ],
        },
      ]}
      testID="aviso-conexion"
    >
      {visible ? (
        <View
          accessible
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={[
            estilos.pildora,
            {
              backgroundColor: enLinea ? colores.aTiempo : colores.bloqueNegro,
            },
          ]}
        >
          {enLinea ? (
            <Icono
              color={colores.sobreNegro}
              nombre="confirmar"
              tamano="mediano"
            />
          ) : (
            <View style={[estilos.punto, { backgroundColor: colores.ambar }]} />
          )}
          <Text style={[tipografia.pequeno, { color: colores.sobreNegro }]}>
            {enLinea
              ? t('conexion.devuelta')
              : ultimaSincronizacion
                ? rellenar(t('conexion.sinConexionConHora'), {
                    hace: antiguedadLegible(ultimaSincronizacion, ahora),
                  })
                : t('conexion.sinConexion')}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  envoltura: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 50,
  },
  pildora: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    flexDirection: 'row',
    gap: espacios.ocho,
    paddingHorizontal: espacios.dieciseis,
    paddingVertical: espacios.ocho,
  },
  punto: { borderRadius: 4, height: 8, width: 8 },
});
