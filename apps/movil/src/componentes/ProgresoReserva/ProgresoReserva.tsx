import { StyleSheet, Text, View } from 'react-native';

import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export type PasoReserva = 1 | 2 | 3;

export interface PropiedadesProgresoReserva {
  paso: PasoReserva;
}

const NOMBRES = {
  1: () => t('reserva.pasoAsientos'),
  2: () => t('reserva.pasoPasajeros'),
  3: () => t('reserva.pasoConfirmar'),
} as const;

/** progreso compacto del recorrido de compra; texto y altura acompañan al color */
export function ProgresoReserva({ paso }: PropiedadesProgresoReserva) {
  const { colores } = useTema();
  const etiqueta = t('reserva.progreso')
    .replace('{{paso}}', String(paso))
    .replace('{{total}}', '3')
    .replace('{{nombre}}', NOMBRES[paso]());

  return (
    <View
      accessibilityLabel={etiqueta}
      accessibilityRole="progressbar"
      accessibilityValue={{ max: 3, min: 1, now: paso }}
      accessible
      style={estilos.contenedor}
    >
      <View style={estilos.fila}>
        <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
          {`${paso}/3`}
        </Text>
        <Text style={[tipografia.etiqueta, { color: colores.tinta }]}>
          {NOMBRES[paso]()}
        </Text>
      </View>
      <View style={estilos.segmentos}>
        {([1, 2, 3] as const).map((numero) => {
          const alcanzado = numero <= paso;
          return (
            <View
              key={numero}
              style={[
                estilos.segmento,
                alcanzado ? estilos.alcanzado : estilos.pendiente,
                {
                  backgroundColor: alcanzado ? colores.ambar : colores.linea,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  alcanzado: { height: espacios.ocho },
  contenedor: { gap: espacios.ocho },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.ocho,
  },
  pendiente: { height: espacios.cuatro },
  segmento: { borderRadius: radios.pildora, flex: 1 },
  segmentos: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.ocho,
    height: espacios.ocho,
  },
});
