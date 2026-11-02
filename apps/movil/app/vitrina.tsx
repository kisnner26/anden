import { StyleSheet, Text, View } from 'react-native';

import { Vitrina } from '@/pantallas/Vitrina';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export default function RutaVitrina() {
  const { colores } = useTema();
  if (__DEV__) return <Vitrina />;

  return (
    <View style={[estilos.noDisponible, { backgroundColor: colores.fondo }]}>
      <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
        {t('vitrina.soloDesarrollo')}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  noDisponible: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
