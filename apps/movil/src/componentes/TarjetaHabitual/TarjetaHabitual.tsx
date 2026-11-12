import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { type Habitual } from '@/datos/habituales';
import {
  formatoDiasSemana,
  formatoFechaCorta,
  formatoHoraCompleta,
} from '@/datos/formato';
import { mismoDia, nombreDelDia } from '@/datos/dias';
import type { Salida } from '@/datos/salidas';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesTarjetaHabitual {
  ahora: Date;
  alQuitar: () => void;
  alReservar: (viajeId: string) => void;
  habitual: Habitual;
  proxima: Salida | null;
}

function cuando(salida: Date, ahora: Date): string {
  const nombre = nombreDelDia(salida, ahora);
  const hora = formatoHoraCompleta(salida);
  if (nombre === 'hoy') return `${t('dias.hoy').toLowerCase()} ${hora}`;
  if (nombre === 'manana') return `${t('dias.manana').toLowerCase()} ${hora}`;
  return `${formatoFechaCorta(salida)} ${hora}`;
}

/** el viaje que la persona hace seguido y la próxima salida que le sirve, lista para reservar */
export function TarjetaHabitual({
  ahora,
  alQuitar,
  alReservar,
  habitual,
  proxima,
}: PropiedadesTarjetaHabitual) {
  const { colores } = useTema();
  const [hora = 0, minuto = 0] = habitual.hora.split(':').map(Number);
  const horaHabitual = formatoHoraCompleta(new Date(2000, 0, 1, hora, minuto));

  return (
    <Bloque estiloContenido={estilos.contenido} testID="tarjeta-habitual">
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('habitual.titulo')}
      </Text>
      <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
        {`${habitual.origen} → ${habitual.destino}`}
      </Text>
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {`${formatoDiasSemana(habitual.dias)} · ${horaHabitual}`}
      </Text>

      <View style={estilos.fila}>
        {proxima ? (
          <Pressable
            accessibilityLabel={rellenar(t('habitual.reservar'), {
              cuando: cuando(proxima.salida, ahora),
            })}
            accessibilityRole="button"
            onPress={() => alReservar(proxima.viajeId)}
            style={estilos.reservar}
          >
            <Text style={[tipografia.subtitulo, { color: colores.ambarTexto }]}>
              {rellenar(t('habitual.proxima'), {
                cuando: cuando(proxima.salida, ahora),
              })}
            </Text>
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {mismoDia(proxima.salida, ahora)
                ? t('habitual.reservarHoy')
                : t('habitual.reservarAhora')}
            </Text>
          </Pressable>
        ) : (
          <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
            {t('habitual.sinSalida')}
          </Text>
        )}
        <Pressable
          accessibilityLabel={rellenar(t('habitual.quitar'), {
            origen: habitual.origen,
            destino: habitual.destino,
          })}
          accessibilityRole="button"
          onPress={alQuitar}
          style={estilos.quitar}
        >
          <Text style={[tipografia.pequeno, { color: colores.cancelado }]}>
            {t('habitual.quitarCorto')}
          </Text>
        </Pressable>
      </View>
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  contenido: { gap: espacios.cuatro, padding: espacios.dieciseis },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'space-between',
    marginTop: espacios.ocho,
  },
  quitar: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
    paddingHorizontal: espacios.ocho,
  },
  reservar: { flex: 1, gap: 2, minHeight: tamanosControl.toqueMinimo },
});
