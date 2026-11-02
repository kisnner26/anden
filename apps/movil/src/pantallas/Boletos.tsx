import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesBoletos {
  alBuscar: () => void;
}

/** los boletos de la persona; todavía no hay compras, así que muestra el estado vacío */
export function Boletos({ alBuscar }: PropiedadesBoletos) {
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
        {t('boletos.titulo')}
        <Text style={{ color: colores.ambarTitular }}>.</Text>
      </Text>

      <Bloque estilo={estilos.bloque} estiloContenido={estilos.vacio}>
        <View style={estilos.centrada}>
          <Loseta tamano={72}>
            <Icono nombre="boleto" tamano="ilustracion" />
          </Loseta>
        </View>
        <View style={estilos.textos}>
          <Text style={[estilos.vacioTitulo, { color: colores.tinta }]}>
            {t('boletos.vacioTitulo')}
          </Text>
          <Text
            style={[
              tipografia.cuerpo,
              estilos.detalle,
              { color: colores.tintaSuave },
            ]}
          >
            {t('boletos.vacioDetalle')}
          </Text>
        </View>
        <BotonAccion alPresionar={alBuscar} etiqueta={t('boletos.buscar')} />
      </Bloque>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  bloque: { marginTop: espacios.veinticuatro },
  centrada: { alignItems: 'center' },
  contenido: { paddingHorizontal: espacios.lateral },
  detalle: { textAlign: 'center' },
  textos: { alignItems: 'center', gap: espacios.ocho },
  titulo: {
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 46,
    lineHeight: 48,
  },
  vacio: {
    alignItems: 'stretch',
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
