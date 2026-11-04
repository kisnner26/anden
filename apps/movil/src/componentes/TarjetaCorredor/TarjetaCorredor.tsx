import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Autobus } from '@/componentes/Autobus';
import { BloqueNegro } from '@/componentes/BloqueNegro';
import { Icono } from '@/componentes/Icono';
import {
  OPERACION_MUESTRA_POR_CORREDOR,
  type CorredorInterlocal,
} from '@/datos/corredores';
import {
  espacios,
  radios,
  tamanosControl,
  tamanosIlustracion,
} from '@/tema/espacios';
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

  return (
    <Pressable
      accessibilityHint={t('rutas.datosPendientes')}
      accessibilityLabel={etiqueta}
      accessibilityRole="button"
      onPress={() => alPresionar(corredor.id)}
    >
      <BloqueNegro estiloContenido={estilos.contenido}>
        <View style={estilos.ilustracion}>
          <View style={[estilos.punto, { backgroundColor: colores.ambar }]} />
          <View style={[estilos.linea, { backgroundColor: colores.ambar }]} />
          <Autobus
            ancho={tamanosIlustracion.autobusCorredor}
            letrero={corredor.destino.toUpperCase()}
          />
        </View>
        <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
          {t('rutas.corredor')}
        </Text>
        <View style={estilos.trayecto}>
          <Text style={[tipografia.titulo, { color: colores.sobreNegro }]}>
            {corredor.origen}
          </Text>
          <Text
            style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
          >
            {t('rutas.hacia')}
          </Text>
          <Text style={[tipografia.titulo, { color: colores.ambar }]}>
            {corredor.destino}
          </Text>
        </View>
        <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
          {t('rutas.operacionMuestra')}
        </Text>
        {operacion.estado === 'proxima' ? (
          <View style={estilos.operacion}>
            <View style={estilos.datoOperacion}>
              <Text
                style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
              >
                {t('rutas.proximaUnidad')}
              </Text>
              <Text
                style={[tipografia.datoGrande, { color: colores.sobreNegro }]}
              >
                {operacion.proximaSalida}
              </Text>
            </View>
            <View style={estilos.datoOperacionDerecha}>
              <Text
                style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
              >
                {t('rutas.llegadaEstimada')}
              </Text>
              <Text style={[tipografia.datoGrande, { color: colores.ambar }]}>
                {t('rutas.minutosEstimados').replace(
                  '{{minutos}}',
                  String(operacion.etaMinutos),
                )}
              </Text>
            </View>
          </View>
        ) : (
          <View style={estilos.sinServicio}>
            <Text style={[tipografia.subtitulo, { color: colores.sobreNegro }]}>
              {t('rutas.sinServicio')}
            </Text>
            <Text
              style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
            >
              {t('rutas.sinServicioDetalle')}
            </Text>
          </View>
        )}
        <View style={estilos.estado}>
          <View>
            <Text style={[tipografia.pequeno, { color: colores.sobreNegro }]}>
              {t('rutas.datosPendientes')}
            </Text>
            <Text
              style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
            >
              {t('rutas.datosPendientesDetalle')}
            </Text>
          </View>
          <View style={[estilos.avance, { backgroundColor: colores.ambar }]}>
            <Icono nombre="siguiente" tamano="mediano" />
          </View>
        </View>
      </BloqueNegro>
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
  contenido: { gap: espacios.doce, padding: espacios.veinticuatro },
  datoOperacion: { flex: 1, gap: espacios.cuatro },
  datoOperacionDerecha: {
    alignItems: 'flex-end',
    flex: 1,
    gap: espacios.cuatro,
  },
  estado: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'space-between',
  },
  ilustracion: { alignItems: 'center', flexDirection: 'row' },
  linea: { flex: 1, height: espacios.cuatro },
  operacion: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'space-between',
  },
  punto: {
    borderRadius: radios.pildora,
    height: espacios.dieciseis,
    width: espacios.dieciseis,
  },
  sinServicio: { gap: espacios.cuatro },
  trayecto: { gap: espacios.cuatro },
});
