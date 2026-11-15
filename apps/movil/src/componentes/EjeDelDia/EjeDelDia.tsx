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
import { Bloque } from '@/componentes/Bloque';
import { conAlfa } from '@/tema/alfa';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
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

  const visibles = bloques.slice(0, MAXIMO_DE_FILAS);
  const ocultos = bloques.length - visibles.length;

  return (
    <View style={estilos.contenedor} testID="eje-del-dia">
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {t('eje.titulo')}
      </Text>
      <Bloque estiloContenido={estilos.tarjeta}>
        <View style={estilos.filas}>
          {visibles.map((b) => (
            <View key={b.viajeId} style={estilos.fila}>
              <Text
                numberOfLines={1}
                style={[
                  tipografia.pequeno,
                  estilos.destino,
                  { color: colores.tinta },
                ]}
              >
                {b.destino}
              </Text>
              <View
                onLayout={alMedir}
                style={[
                  estilos.pista,
                  { backgroundColor: conAlfa(colores.tinta, 0.08) },
                ]}
              >
                <Pressable
                  accessibilityLabel={`${b.destino}, ${t(`eje.${b.estado}`)}${b.solapa ? `, ${t('eje.choque')}` : ''}`}
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => alAbrir(b.viajeId)}
                  style={[
                    estilos.bloque,
                    {
                      backgroundColor: conAlfa(colorDe(b), 0.4),
                      borderColor: colorDe(b),
                      left: b.inicio * ancho,
                      width: Math.max(14, (b.fin - b.inicio) * ancho),
                    },
                  ]}
                />
              </View>
            </View>
          ))}
          {ahoraEnElEje !== null ? (
            <View
              pointerEvents="none"
              style={[
                estilos.ahora,
                {
                  backgroundColor: colores.tinta,
                  left: ETIQUETA + espacios.ocho + ahoraEnElEje * ancho,
                },
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
                    ETIQUETA +
                    espacios.ocho +
                    ((h - HORA_INICIAL) / (HORA_FINAL - HORA_INICIAL)) * ancho -
                    8,
                },
              ]}
            >
              {h}
            </Text>
          ))}
        </View>
        {ocultos > 0 ? (
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {rellenar(t('eje.masViajes'), { n: ocultos })}
          </Text>
        ) : null}
      </Bloque>
    </View>
  );
}

const ETIQUETA = 76;
const MAXIMO_DE_FILAS = 4;

const estilos = StyleSheet.create({
  ahora: { bottom: 28, position: 'absolute', top: 0, width: 2 },
  bloque: {
    borderRadius: 7,
    borderWidth: 1.5,
    height: 16,
    position: 'absolute',
    top: 2,
  },
  contenedor: { gap: espacios.ocho },
  destino: { width: ETIQUETA },
  fila: { alignItems: 'center', flexDirection: 'row', gap: espacios.ocho },
  filas: { gap: espacios.ocho },
  hora: { position: 'absolute', width: 16 },
  horas: { height: 16 },
  pista: { borderRadius: 8, flex: 1, height: 20 },
  tarjeta: { gap: espacios.ocho, padding: espacios.dieciseis },
});
