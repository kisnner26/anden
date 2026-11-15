import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { formatoHoraCompleta } from '@/datos/formato';
import { llenadoDe } from '@/datos/llenado';
import type { Salida } from '@/datos/salidas';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesBarraDeLlenado {
  salida: Salida;
}

/** el bus sale cuando se llena: una barra con lo vendido, cuántos faltan y un botón para invitar a alguien a completarlo */
export function BarraDeLlenado({ salida }: PropiedadesBarraDeLlenado) {
  const { colores } = useTema();
  const llenado = llenadoDe(salida);
  if (!llenado || !salida.ventaAbierta) return null;

  const texto =
    llenado.faltan === 0
      ? t('llenado.lleno')
      : llenado.faltan === 1
        ? t('llenado.falta1')
        : rellenar(t('llenado.faltan'), { n: llenado.faltan });

  function invitar() {
    void Share.share({
      message: rellenar(t('llenado.invitacion'), {
        destino: salida.destino,
        hora: formatoHoraCompleta(salida.salida),
        n: llenado!.faltan,
      }),
    });
  }

  return (
    <View style={estilos.contenedor} testID="barra-de-llenado">
      <View
        accessibilityLabel={rellenar(t('llenado.accesible'), {
          total: llenado.total,
          vendidos: llenado.vendidos,
        })}
        accessibilityRole="progressbar"
        accessible
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
              width: `${Math.round(llenado.proporcion * 100)}%`,
            },
          ]}
        />
      </View>
      <View style={estilos.fila}>
        <Text style={[tipografia.pequeno, { color: colores.tinta }]}>
          {texto}
        </Text>
        {llenado.faltan > 0 ? (
          <Pressable accessibilityRole="button" onPress={invitar}>
            <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
              {t('llenado.invitar')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: espacios.ocho },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pista: { borderRadius: radios.pildora, height: 8, overflow: 'hidden' },
  relleno: { borderRadius: radios.pildora, height: 8 },
});
