import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import {
  OPERACION_MUESTRA_POR_CORREDOR,
  type CorredorInterlocal,
} from '@/datos/corredores';
import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

interface PropiedadesTarjetaCorredor {
  alPresionar: (id: CorredorInterlocal['id']) => void;
  corredor: CorredorInterlocal;
}

export function TarjetaCorredor({
  alPresionar,
  corredor,
}: PropiedadesTarjetaCorredor) {
  const { colores } = useTema();
  const etiqueta = t('rutas.abrirCorredor')
    .replace('{{origen}}', corredor.origen)
    .replace('{{destino}}', corredor.destino);
  const operacion = OPERACION_MUESTRA_POR_CORREDOR[corredor.id];
  const codigoOrigen = corredor.origen.slice(0, 3).toUpperCase();
  const codigoDestino = corredor.destino.slice(0, 3).toUpperCase();

  return (
    <Pressable
      accessibilityHint={t('rutas.datosPendientes')}
      accessibilityLabel={etiqueta}
      accessibilityRole="button"
      onPress={() => alPresionar(corredor.id)}
    >
      <Bloque estiloContenido={estilos.contenido} radio="tarjeta">
        <View style={estilos.cabecera}>
          <View style={estilos.trayecto}>
            <View
              style={[estilos.codigo, { backgroundColor: colores.bloqueNegro }]}
            >
              <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
                {codigoOrigen}
              </Text>
            </View>
            <View style={estilos.sentido}>
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {corredor.origen}
              </Text>
              <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
                {t('rutas.hacia')}
              </Text>
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {corredor.destino}
              </Text>
            </View>
          </View>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {codigoDestino}
          </Text>
        </View>

        <View style={[estilos.separador, { backgroundColor: colores.linea }]} />

        <View style={estilos.pie}>
          <View style={estilos.operacion}>
            <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
              {t('rutas.operacionMuestra')}
            </Text>
            {operacion.estado === 'proxima' ? (
              <View style={estilos.horario}>
                <Text style={[tipografia.dato, { color: colores.tinta }]}>
                  {operacion.proximaSalida}
                </Text>
                <Text
                  style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                >
                  {t('rutas.horarioReferencial')}
                </Text>
              </View>
            ) : (
              <View style={estilos.sinServicio}>
                <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
                  {t('rutas.sinServicio')}
                </Text>
                <Text
                  style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                >
                  {t('rutas.sinServicioDetalle')}
                </Text>
              </View>
            )}
          </View>
          <View
            style={[estilos.avance, { backgroundColor: colores.bloqueNegro }]}
          >
            <Icono color={colores.ambar} nombre="siguiente" tamano="mediano" />
          </View>
        </View>
      </Bloque>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  avance: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    height: tamanosControl.toqueMinimo,
    justifyContent: 'center',
    width: tamanosControl.toqueMinimo,
  },
  cabecera: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codigo: {
    alignItems: 'center',
    borderRadius: radios.loseta,
    height: tamanosControl.toqueMinimo,
    justifyContent: 'center',
    width: tamanosControl.toqueMinimo,
  },
  contenido: { gap: espacios.doce, padding: espacios.dieciseis },
  horario: { gap: espacios.cuatro },
  operacion: {
    flex: 1,
    gap: espacios.cuatro,
  },
  pie: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'space-between',
  },
  sentido: { gap: espacios.cuatro },
  separador: { height: espacios.trazo },
  sinServicio: { gap: espacios.cuatro },
  trayecto: { alignItems: 'center', flexDirection: 'row', gap: espacios.doce },
});
