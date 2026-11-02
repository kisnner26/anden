import { StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

/** aviso de que las tarifas son de muestra mientras no esté cargado el tarifario oficial del MTI */
export function EtiquetaMuestra() {
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
        {t('viajar.tarifasMuestra')}
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
