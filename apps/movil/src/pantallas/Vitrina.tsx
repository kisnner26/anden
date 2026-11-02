import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { coloresClaros, coloresOscuros } from '@/tema/colores';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { t } from '@/textos/t';

type ModoVitrina = 'oscuro' | 'claro';

export function Vitrina() {
  const [modo, establecerModo] = useState<ModoVitrina>('oscuro');
  const colores = modo === 'oscuro' ? coloresOscuros : coloresClaros;

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        { backgroundColor: colores.fondo },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <View style={estilos.cabecera}>
        <View style={estilos.titulos}>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {t('vitrina.marca')}
          </Text>
          <Text style={[tipografia.display, { color: colores.tinta }]}>
            {t('vitrina.titulo')}
          </Text>
          <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
            {t('vitrina.subtitulo')}
          </Text>
        </View>
        <SelectorTema
          modo={modo}
          alCambiar={establecerModo}
          colores={colores}
        />
      </View>
    </ScrollView>
  );
}

function SelectorTema({
  modo,
  alCambiar,
  colores,
}: {
  modo: ModoVitrina;
  alCambiar: (modo: ModoVitrina) => void;
  colores: typeof coloresOscuros | typeof coloresClaros;
}) {
  const siguiente = modo === 'oscuro' ? 'claro' : 'oscuro';
  return (
    <Pressable
      accessibilityLabel={t('vitrina.cambiarTema')}
      accessibilityRole="button"
      onPress={() => alCambiar(siguiente)}
      style={[
        estilos.selector,
        { backgroundColor: colores.superficie, borderColor: colores.linea },
      ]}
    >
      <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
        {modo === 'oscuro' ? t('vitrina.temaOscuro') : t('vitrina.temaClaro')}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cabecera: { gap: espacios.veinticuatro },
  contenido: {
    flexGrow: 1,
    gap: espacios.treintaYDos,
    paddingBottom: espacios.cuarentaYOcho,
    paddingHorizontal: espacios.lateral,
    paddingTop: espacios.veinticuatro,
  },
  selector: {
    alignSelf: 'flex-start',
    borderRadius: radios.pildora,
    borderWidth: 1,
    paddingHorizontal: espacios.dieciseis,
    paddingVertical: espacios.doce,
  },
  titulos: { gap: espacios.ocho },
});
