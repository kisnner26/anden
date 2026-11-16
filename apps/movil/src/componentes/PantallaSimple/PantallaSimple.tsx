import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesPantallaSimple {
  /** la pantalla de siempre: sale del modo simple desde acá */
  alSalir: () => void;
  children: ReactNode;
  /** una frase corta que dice qué se puede hacer en esta pantalla */
  indicacion?: string;
  testID?: string;
  titulo: string;
}

/** el marco de las pantallas del modo simple: un titular grande, botones gigantes debajo y una salida al inicio de siempre */
export function PantallaSimple({
  alSalir,
  children,
  indicacion,
  testID,
  titulo,
}: PropiedadesPantallaSimple) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: espacios.cuarentaYOcho + 90,
          paddingTop: margenes.top + espacios.veinticuatro,
        },
      ]}
      style={{ backgroundColor: colores.fondo }}
      testID={testID}
    >
      <Text
        accessibilityRole="header"
        style={[tipografia.titularPantalla, { color: colores.tinta }]}
      >
        {titulo}
      </Text>
      {indicacion ? (
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {indicacion}
        </Text>
      ) : null}
      {children}
      <Pressable accessibilityRole="button" onPress={alSalir}>
        <View style={estilos.salir}>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('inicioSimple.salir')}
          </Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  salir: { alignItems: 'center', minHeight: 44, justifyContent: 'center' },
});
