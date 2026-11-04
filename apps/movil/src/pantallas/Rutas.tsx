import { StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { MarcoPestana } from '@/componentes/MarcoPestana';
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

  return (
    <MarcoPestana estiloContenido={estilos.contenido}>
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

      <Bloque estiloContenido={estilos.aviso} hundido>
        <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
          {t('rutas.datosPendientes')}
        </Text>
        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {t('rutas.datosPendientesDetalle')}
        </Text>
      </Bloque>

      <View style={estilos.corredores}>
        {CORREDORES_INICIALES.map((corredor) => (
          <TarjetaCorredor
            alPresionar={(id) => alAbrirRuta?.(id)}
            corredor={corredor}
            key={corredor.id}
          />
        ))}
      </View>
    </MarcoPestana>
  );
}

const estilos = StyleSheet.create({
  aviso: { gap: espacios.cuatro, padding: espacios.dieciseis },
  cabecera: { gap: espacios.dieciseis },
  cantidad: { alignSelf: 'flex-start', padding: espacios.doce },
  contenido: {
    gap: espacios.veinticuatro,
  },
  corredores: { gap: espacios.dieciseis },
  titular: { gap: espacios.ocho },
});
