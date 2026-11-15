import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import {
  HORA_FINAL,
  HORA_INICIAL,
  type BloqueDelDia,
} from '@/datos/diaDelChofer';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesEjeDelDia {
  alAbrir: (viajeId: string) => void;
  bloques: readonly BloqueDelDia[];
  /** la hora de ahora sobre el eje, de 0 a 1; nulo si el día no es hoy */
  ahoraEnElEje: number | null;
}

const HORAS_MARCADAS = [6, 9, 12, 15, 18, 21] as const;

/**
 * el día del chofer en una línea: cada viaje es un bloque entre su salida y su llegada, pintado según haya cerrado, vaya en
 * vivo o esté por salir; si dos viajes de la misma unidad se pisan, ambos lo avisan en rojo. Tocar un bloque abre el viaje
 */
export function EjeDelDia({
  ahoraEnElEje,
  alAbrir,
  bloques,
}: PropiedadesEjeDelDia) {
  const { colores } = useTema();
  const [ancho, establecerAncho] = useState(0);
  const alMedir = (e: LayoutChangeEvent) =>
    establecerAncho(e.nativeEvent.layout.width);

  function colorDe(b: BloqueDelDia): string {
    if (b.solapa) return colores.cancelado;
    if (b.estado === 'enVivo') return colores.aTiempo;
    if (b.estado === 'cerrado') return colores.tintaSuave;
    return colores.ambar;
  }

  return (
    <View style={estilos.contenedor} testID="eje-del-dia">
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {t('eje.titulo')}
      </Text>
      <View onLayout={alMedir} style={estilos.eje}>
        <View
          style={[
            estilos.linea,
            { backgroundColor: conAlfa(colores.tinta, 0.12) },
          ]}
        />
        {bloques.map((b, i) => (
          <Pressable
            accessibilityLabel={`${b.destino}, ${t(`eje.${b.estado}`)}${b.solapa ? `, ${t('eje.choque')}` : ''}`}
            accessibilityRole="button"
            key={b.viajeId}
            onPress={() => alAbrir(b.viajeId)}
            style={[
              estilos.bloque,
              {
                backgroundColor: conAlfa(colorDe(b), 0.35),
                borderColor: colorDe(b),
                left: b.inicio * ancho,
                top: 6 + (i % 2) * 22,
                width: Math.max(16, (b.fin - b.inicio) * ancho),
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[tipografia.pequeno, { color: colores.tinta }]}
            >
              {b.destino}
            </Text>
          </Pressable>
        ))}
        {ahoraEnElEje !== null ? (
          <View
            pointerEvents="none"
            style={[
              estilos.ahora,
              { backgroundColor: colores.tinta, left: ahoraEnElEje * ancho },
            ]}
          />
        ) : null}
      </View>
      <View style={estilos.horas}>
        {HORAS_MARCADAS.map((h) => (
          <Text
            key={h}
            style={[
              tipografia.pequeno,
              estilos.hora,
              {
                color: colores.tintaSuave,
                left:
                  ((h - HORA_INICIAL) / (HORA_FINAL - HORA_INICIAL)) * ancho -
                  8,
              },
            ]}
          >
            {h}
          </Text>
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  ahora: { bottom: 0, position: 'absolute', top: 0, width: 2 },
  bloque: {
    borderRadius: radios.loseta,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 4,
    position: 'absolute',
  },
  contenedor: { gap: espacios.ocho },
  eje: { height: 54, justifyContent: 'center' },
  hora: { position: 'absolute', width: 16 },
  horas: { height: 16 },
  linea: { height: 2, position: 'absolute', top: 26, width: '100%' },
});
