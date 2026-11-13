import { asientosDe } from '@anden/dominio';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { estimarSalida } from '@/datos/estimacionSalida';
import { formatoHoraCompleta } from '@/datos/formato';
import { obtenerHistorial } from '@/datos/historialSalidas';
import { useSalidas } from '@/datos/useSalidas';
import { espacios, radios } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesEstimacionSalida {
  viajeId: string;
}

/**
 * el interlocal sale cuando se llena, no a una hora fija: muestra la hora en que se pone a esperar,
 * cuánto lleva vendido y, con datos, cuándo saldría
 */
export function EstimacionSalida({ viajeId }: PropiedadesEstimacionSalida) {
  const { colores } = useTema();
  const reducir = useMovimientoReducido();
  const { ahora, datos } = useSalidas();
  const avance = useRef(new Animated.Value(0)).current;

  const viaje = datos.viajes.find((candidato) => candidato.id === viajeId);
  const bus = datos.buses.find((candidato) => candidato.id === viaje?.busId);
  const capacidad = bus ? asientosDe(bus.configuracion).length : 0;
  const ocupados = datos.ocupaciones.filter(
    (ocupacion) =>
      ocupacion.viajeId === viajeId && ocupacion.estado === 'vendido',
  ).length;
  const llenado = capacidad === 0 ? 0 : Math.min(1, ocupados / capacidad);

  useEffect(() => {
    if (reducir) {
      avance.setValue(llenado);
      return;
    }
    Animated.timing(avance, {
      duration: movimiento.crecimientoBarra,
      easing: Easing.out(Easing.cubic),
      toValue: llenado,
      useNativeDriver: false,
    }).start();
  }, [avance, llenado, reducir]);

  if (!viaje || !bus) return null;
  const puestoEn = new Date(viaje.salida);
  const estimacion = estimarSalida({
    ahora,
    capacidad,
    historial: obtenerHistorial(),
    ocupados,
    puestoEn,
    rutaId: viaje.rutaId,
    servicio: bus.servicio,
  });

  const frase = !estimacion
    ? t('estimacion.sinDatos')
    : estimacion.base === 'lleno'
      ? t('estimacion.lleno')
      : rellenar(
          estimacion.confianza === 'baja'
            ? t('estimacion.aproximada')
            : t('estimacion.estimada'),
          { hora: formatoHoraCompleta(estimacion.estimada) },
        );

  return (
    <Bloque estiloContenido={estilos.tarjeta}>
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('estimacion.titulo')}
      </Text>
      <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
        {rellenar(t('estimacion.puesta'), {
          hora: formatoHoraCompleta(puestoEn),
        })}
      </Text>
      <View style={[estilos.pista, { backgroundColor: colores.linea }]}>
        <Animated.View
          style={[
            estilos.relleno,
            {
              backgroundColor: colores.ambar,
              width: avance.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {rellenar(t('estimacion.vendidos'), { capacidad, ocupados })}
      </Text>
      <Text
        accessibilityLiveRegion="polite"
        style={[tipografia.cuerpo, { color: colores.tinta }]}
      >
        {frase}
      </Text>
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {t('estimacion.nota')}
      </Text>
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  pista: { borderRadius: radios.pildora, height: 8, overflow: 'hidden' },
  relleno: { borderRadius: radios.pildora, height: 8 },
  tarjeta: { gap: espacios.ocho, padding: espacios.dieciseis },
});
