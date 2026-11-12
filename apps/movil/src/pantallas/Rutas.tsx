import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { MarcoPestana } from '@/componentes/MarcoPestana';
import { Aparece } from '@/componentes/Aparece';
import { TarjetaCorredor } from '@/componentes/TarjetaCorredor';
import {
  CORREDORES_INICIALES,
  type CorredorInterlocal,
} from '@/datos/corredores';
import { useFavoritos } from '@/datos/useFavoritos';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesRutas {
  alAbrirRuta?: (id: string) => void;
  /** abre la solicitud de una encomienda */
  alAbrirEncomiendas?: () => void;
}

const GRUPOS_CORREDOR: readonly {
  ids: readonly CorredorInterlocal['id'][];
  titulo: 'rutas.boacoManagua' | 'rutas.juigalpaManagua';
}[] = [
  {
    ids: ['cor_boa_man', 'cor_man_boa'],
    titulo: 'rutas.boacoManagua',
  },
  {
    ids: ['cor_jui_man', 'cor_man_jui'],
    titulo: 'rutas.juigalpaManagua',
  },
];

/** los dos corredores que opera Andén; sin geometría falsa mientras faltan datos verificados */
export function Rutas({ alAbrirEncomiendas, alAbrirRuta }: PropiedadesRutas) {
  const { colores } = useTema();
  const { esFavorito } = useFavoritos();

  return (
    <MarcoPestana estiloContenido={estilos.contenido}>
      <View style={estilos.cabecera}>
        <View style={estilos.titular}>
          <Text style={[tipografia.display, { color: colores.tinta }]}>
            {t('rutas.titulo')}.
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

      <View style={estilos.estadoDatos}>
        <View
          style={[estilos.marcaEstado, { borderColor: colores.ambarTexto }]}
        />
        <View style={estilos.textoEstado}>
          <Text style={[tipografia.etiqueta, { color: colores.tinta }]}>
            {t('rutas.datosPendientes')}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('rutas.datosPendientesDetalle')}
          </Text>
        </View>
      </View>

      <View style={estilos.corredores}>
        {GRUPOS_CORREDOR.map((grupo) => (
          <View key={grupo.titulo} style={estilos.grupo}>
            <Text style={[tipografia.titulo, { color: colores.tinta }]}>
              {t(grupo.titulo)}
            </Text>
            <View style={estilos.sentidos}>
              {CORREDORES_INICIALES.filter((corredor) =>
                grupo.ids.includes(corredor.id),
              )
                .sort(
                  (a, b) => Number(esFavorito(b.id)) - Number(esFavorito(a.id)),
                )
                .map((corredor, indice) => (
                  <Aparece indice={indice} key={corredor.id}>
                    <TarjetaCorredor
                      alPresionar={(id) => alAbrirRuta?.(id)}
                      corredor={corredor}
                    />
                  </Aparece>
                ))}
            </View>
          </View>
        ))}
      </View>
      <Pressable accessibilityRole="button" onPress={alAbrirEncomiendas}>
        <Bloque estiloContenido={estilos.encomienda}>
          <View style={estilos.textoEncomienda}>
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {t('encomiendas.entrada')}
            </Text>
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {t('encomiendas.entradaDetalle')}
            </Text>
          </View>
          <Icono nombre="siguiente" tamano="mediano" />
        </Bloque>
      </Pressable>
    </MarcoPestana>
  );
}

const estilos = StyleSheet.create({
  encomienda: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
    padding: espacios.dieciseis,
  },
  textoEncomienda: { flex: 1, gap: espacios.cuatro },
  cabecera: { gap: espacios.dieciseis },
  cantidad: { alignSelf: 'flex-start', padding: espacios.doce },
  contenido: {
    gap: espacios.veinticuatro,
  },
  corredores: { gap: espacios.veinticuatro },
  estadoDatos: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: espacios.doce,
  },
  grupo: { gap: espacios.doce },
  marcaEstado: {
    borderRadius: radios.pildora,
    borderWidth: espacios.trazo,
    height: espacios.doce,
    marginTop: espacios.cuatro,
    width: espacios.doce,
  },
  sentidos: { gap: espacios.doce },
  textoEstado: { flex: 1, gap: espacios.cuatro },
  titular: { gap: espacios.ocho },
});
