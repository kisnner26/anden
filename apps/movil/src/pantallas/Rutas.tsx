import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

/** el mapa de rutas autorizadas; todavía no existe, así que lo anuncia con honestidad */
export function Rutas() {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        { paddingBottom: 130, paddingTop: margenes.top + 8 },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <Text style={[estilos.titulo, { color: colores.tinta }]}>
        {t('rutas.titulo')}
        <Text style={{ color: colores.ambarTitular }}>.</Text>
      </Text>

      <Bloque estilo={estilos.bloque} estiloContenido={estilos.vacio}>
        <Loseta tamano={72}>
          <Icono
            nombre="pestanaRutas"
            tamano="ilustracion"
            color={colores.tinta}
            colorDetalle={colores.barroClaro}
          />
        </Loseta>
        <View style={estilos.textos}>
          <Text style={[estilos.vacioTitulo, { color: colores.tinta }]}>
            {t('rutas.proximamente')}
          </Text>
          <Text
            style={[
              tipografia.cuerpo,
              estilos.detalle,
              { color: colores.tintaSuave },
            ]}
          >
            {t('rutas.detalle')}
          </Text>
        </View>
      </Bloque>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  bloque: { marginTop: espacios.veinticuatro },
  contenido: { paddingHorizontal: espacios.lateral },
  detalle: { textAlign: 'center' },
  textos: { alignItems: 'center', gap: espacios.ocho },
  titulo: {
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 46,
    lineHeight: 48,
  },
  vacio: {
    alignItems: 'center',
    gap: espacios.veinticuatro,
    padding: espacios.veinticuatro,
  },
  vacioTitulo: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
  },
});
