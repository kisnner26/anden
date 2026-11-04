import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { TarjetaCorredor } from '@/componentes/TarjetaCorredor';
import { CORREDORES_INICIALES } from '@/datos/corredores';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesRutas {
  alAbrirRuta?: (id: string) => void;
}

/** los dos corredores que opera Andén; sin geometría falsa mientras faltan datos verificados */
export function Rutas({ alAbrirRuta }: PropiedadesRutas) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        { paddingBottom: 130, paddingTop: margenes.top + espacios.ocho },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <View style={estilos.cabecera}>
        <View style={estilos.titular}>
          <Text style={[tipografia.display, { color: colores.tinta }]}>
            {t('rutas.titulo')}
            <Text style={{ color: colores.ambarTitular }}>.</Text>
          </Text>
          <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
            {t('rutas.detalle')}
          </Text>
        </View>
        <Bloque estiloContenido={estilos.cantidad} hundido radio="pildora">
          <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
            {t('rutas.cuatroSentidos')}
          </Text>
        </Bloque>
      </View>

      <View style={estilos.corredores}>
        {CORREDORES_INICIALES.map((corredor) => (
          <TarjetaCorredor
            alPresionar={(id) => alAbrirRuta?.(id)}
            corredor={corredor}
            key={corredor.id}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  cabecera: { gap: espacios.dieciseis },
  cantidad: { alignSelf: 'flex-start', padding: espacios.doce },
  contenido: {
    gap: espacios.veinticuatro,
    paddingHorizontal: espacios.lateral,
  },
  corredores: { gap: espacios.dieciseis },
  titular: { gap: espacios.ocho },
});
