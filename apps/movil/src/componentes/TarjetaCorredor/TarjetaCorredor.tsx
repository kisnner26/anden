import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Autobus } from '@/componentes/Autobus';
import { BloqueNegro } from '@/componentes/BloqueNegro';
import { Icono } from '@/componentes/Icono';
import type { CorredorInterlocal } from '@/datos/corredores';
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
  const etiqueta = t('rutas.abrirCorredor').replace(
    '{{origen}}',
    corredor.origen,
  );

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
  estado: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'space-between',
  },
  ilustracion: { alignItems: 'center', flexDirection: 'row' },
  linea: { flex: 1, height: espacios.cuatro },
  punto: {
    borderRadius: radios.pildora,
    height: espacios.dieciseis,
    width: espacios.dieciseis,
  },
  trayecto: { gap: espacios.cuatro },
});
