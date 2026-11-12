import { ScrollView, StyleSheet } from 'react-native';

import { Chip } from '@/componentes/Chip';
import { mismoDia, nombreDelDia } from '@/datos/dias';
import { formatoDiaCorto } from '@/datos/formato';
import { espacios } from '@/tema/espacios';
import { t } from '@/textos/t';

export interface PropiedadesSelectorDia {
  alElegir: (dia: Date) => void;
  ahora: Date;
  dias: readonly Date[];
  seleccionado: Date;
}

function rotulo(dia: Date, ahora: Date): string {
  const nombre = nombreDelDia(dia, ahora);
  if (nombre === 'hoy') return t('dias.hoy');
  if (nombre === 'manana') return t('dias.manana');
  return formatoDiaCorto(dia);
}

/** los días en que se puede reservar, en una fila que se desliza: hoy, mañana y los siguientes */
export function SelectorDia({
  alElegir,
  ahora,
  dias,
  seleccionado,
}: PropiedadesSelectorDia) {
  return (
    <ScrollView
      accessibilityLabel={t('dias.selector')}
      contentContainerStyle={estilos.fila}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {dias.map((dia) => (
        <Chip
          alCambiar={() => alElegir(dia)}
          etiqueta={rotulo(dia, ahora)}
          key={dia.getTime()}
          seleccionado={mismoDia(dia, seleccionado)}
        />
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  fila: { gap: espacios.ocho, paddingVertical: espacios.ocho },
});
