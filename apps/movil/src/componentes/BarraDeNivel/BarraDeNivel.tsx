import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import type { AvanceDeNivel } from '@/datos/identidadPasaporte';
import { conAlfa } from '@/tema/alfa';
import { espacios } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesBarraDeNivel {
  avance: AvanceDeNivel;
  retardo?: number;
}

/** el nivel actual del pasaporte con una barra que se llena hasta lo avanzado y lo que falta para el siguiente */
export function BarraDeNivel({ avance, retardo = 0 }: PropiedadesBarraDeNivel) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const lleno = useRef(
    new Animated.Value(reducido ? avance.progreso : 0),
  ).current;

  useEffect(() => {
    if (reducido) {
      lleno.setValue(avance.progreso);
      return;
    }
    const animacion = Animated.timing(lleno, {
      delay: retardo,
      duration: movimiento.crecimientoBarra,
      easing: Easing.out(Easing.cubic),
      toValue: avance.progreso,
      useNativeDriver: false,
    });
    animacion.start();
    return () => animacion.stop();
  }, [avance.progreso, lleno, reducido, retardo]);

  const siguiente = avance.siguiente;
  return (
    <Bloque estiloContenido={estilos.contenido}>
      <View style={estilos.cabecera}>
        <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
          {t('pasaporte.datos.nivel')}
        </Text>
        <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
          {t(`pasaporte.niveles.${avance.nivel}`)}
        </Text>
      </View>
      <View
        style={[
          estilos.pista,
          { backgroundColor: conAlfa(colores.tinta, 0.12) },
        ]}
      >
        <Animated.View
          style={[
            estilos.relleno,
            {
              backgroundColor: colores.ambar,
              width: lleno.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {siguiente
          ? rellenar(
              t(
                siguiente.faltan === 1
                  ? 'pasaporte.proximoNivel.uno'
                  : 'pasaporte.proximoNivel.muchos',
              ),
              {
                n: siguiente.faltan,
                nivel: t(`pasaporte.niveles.${siguiente.id}`),
              },
            )
          : t('pasaporte.nivelMaximo')}
      </Text>
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  cabecera: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contenido: { gap: espacios.doce, padding: espacios.dieciseis },
  pista: { borderRadius: 5, height: 10, overflow: 'hidden' },
  relleno: { borderRadius: 5, height: 10 },
});
