import { StyleSheet, Text, View } from 'react-native';

import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export default function Inicio() {
  const { colores } = useTema();

  return (
    <View style={[estilos.pantalla, { backgroundColor: colores.fondo }]}>
      <Text style={[tipografia.display, { color: colores.tinta }]}>
        {t('inicio.marca')}
      </Text>
      <Text style={[tipografia.datoGrande, { color: colores.ambar }]}>
        {t('inicio.horaMuestra')}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
