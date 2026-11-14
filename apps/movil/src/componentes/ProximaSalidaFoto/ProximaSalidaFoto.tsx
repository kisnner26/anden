import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { FotoDestino } from '@/componentes/FotoDestino';
import { formatoHoraCompleta } from '@/datos/formato';
import { minutosParaSalir, nivelDisponibilidad } from '@/datos/disponibilidad';
import type { Salida } from '@/datos/salidas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesProximaSalidaFoto {
  ahora: Date;
  alAbrir?: (viajeId: string) => void;
  /** si es hoy se dice en cuánto sale; otro día, solo "primera salida" */
  esHoy: boolean;
  salida: Salida;
}

/** la salida que viene, con la foto de su destino, la hora grande y cuánto falta */
export function ProximaSalidaFoto({
  ahora,
  alAbrir,
  esHoy,
  salida,
}: PropiedadesProximaSalidaFoto) {
  const { colores } = useTema();
  const nivel = nivelDisponibilidad(salida.asientosLibres);
  const detalle = `${
    esHoy
      ? `${t('horarios.saleEn')} ${minutosParaSalir(salida, ahora)} ${t('horarios.minutos')} · `
      : ''
  }${
    nivel === 'pocos'
      ? t('horarios.pocosAsientos')
      : `${salida.asientosLibres} ${t('horarios.libres')}`
  }`;

  return (
    <Pressable
      accessibilityLabel={`${salida.destino}, ${formatoHoraCompleta(salida.salida)}`}
      accessibilityRole="button"
      onPress={() => alAbrir?.(salida.viajeId)}
      style={({ pressed }) => pressed && estilos.presionada}
    >
      <Bloque estiloContenido={estilos.contenido} testID="proxima-salida-foto">
        <FotoDestino
          destino={salida.destino}
          estilo={estilos.foto}
          origen={salida.origen}
          radio="tarjeta"
        >
          <View style={estilos.sobreFoto}>
            <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
              {esHoy ? t('horarios.proximaSalida') : t('dias.primeraSalida')}
            </Text>
            <View style={estilos.fila}>
              <Text
                numberOfLines={1}
                style={[
                  tipografia.display,
                  estilos.destino,
                  { color: colores.sobreNegro },
                ]}
              >
                {salida.destino}
              </Text>
              <Text style={[tipografia.dato, { color: colores.sobreNegro }]}>
                {formatoHoraCompleta(salida.salida)}
              </Text>
            </View>
            <Text
              style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
            >
              {detalle}
            </Text>
          </View>
        </FotoDestino>
      </Bloque>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacios.ocho },
  destino: { flex: 1 },
  fila: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'space-between',
  },
  foto: { height: 184, justifyContent: 'flex-end' },
  presionada: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  sobreFoto: { gap: 2, padding: espacios.dieciseis },
});
