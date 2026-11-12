import { StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesEtiquetaMuestra {
  /** texto del aviso; por defecto el de las tarifas de muestra */
  texto?: string;
}

/** aviso de que un dato es de muestra; por defecto, que las tarifas lo son mientras no esté el tarifario oficial del MTI */
export function EtiquetaMuestra({ texto }: PropiedadesEtiquetaMuestra = {}) {
  const { colores } = useTema();

  return (
    <Bloque
      estiloContenido={estilos.contenido}
      hundido
      radio="pildora"
      testID="etiqueta-muestra"
    >
      <View style={[estilos.punto, { backgroundColor: colores.ambar }]} />
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {texto ?? t('viajar.tarifasMuestra')}
      </Text>
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  punto: { borderRadius: 999, height: 8, width: 8 },
});
