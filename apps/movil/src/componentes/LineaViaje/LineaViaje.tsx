import { StyleSheet, Text, View } from 'react-native';

import { Icono } from '@/componentes/Icono';
import { formatoHora, sufijoHora } from '@/datos/formato';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesLineaViaje {
  destinoCodigo: string;
  llegada: Date;
  origenCodigo: string;
  salida: Date;
}

function Extremo({
  alineado,
  codigo,
  etiqueta,
  hora,
}: {
  alineado: 'derecha' | 'izquierda';
  codigo: string;
  etiqueta: string;
  hora: Date;
}) {
  const { colores } = useTema();
  const alinear = alineado === 'derecha' ? 'flex-end' : 'flex-start';
  return (
    <View style={[estilos.extremo, { alignItems: alinear }]}>
      <Text style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}>
        {etiqueta}
      </Text>
      <Text style={[tipografia.display, { color: colores.sobreNegro }]}>
        {formatoHora(hora)}
      </Text>
      <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
        {`${sufijoHora(hora)} · ${codigo}`}
      </Text>
    </View>
  );
}

/** de dónde sale y a dónde llega: las dos horas en grande y el camino entre ellas con el bus en medio */
export function LineaViaje({
  destinoCodigo,
  llegada,
  origenCodigo,
  salida,
}: PropiedadesLineaViaje) {
  const { colores } = useTema();

  return (
    <View testID="linea-viaje">
      <View style={estilos.horas}>
        <Extremo
          alineado="izquierda"
          codigo={origenCodigo}
          etiqueta={t('detalle.sale')}
          hora={salida}
        />
        <Extremo
          alineado="derecha"
          codigo={destinoCodigo}
          etiqueta={t('detalle.llega')}
          hora={llegada}
        />
      </View>
      <View style={estilos.camino}>
        <View style={[estilos.punto, { backgroundColor: colores.ambar }]} />
        <View
          style={[estilos.trazo, { backgroundColor: colores.sobreNegroSuave }]}
        />
        <View
          style={[
            estilos.insignia,
            { backgroundColor: colores.bloqueNegroClaro },
          ]}
        >
          <Icono
            color={colores.ambar}
            nombre="pestanaViajar"
            tamano="mediano"
          />
        </View>
        <View
          style={[estilos.trazo, { backgroundColor: colores.sobreNegroSuave }]}
        />
        <View style={[estilos.punto, { backgroundColor: colores.ambar }]} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  camino: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.ocho,
    marginTop: espacios.doce,
  },
  extremo: { gap: espacios.cuatro },
  horas: { flexDirection: 'row', justifyContent: 'space-between' },
  insignia: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    height: espacios.treintaYDos,
    justifyContent: 'center',
    width: espacios.treintaYDos,
  },
  punto: {
    borderRadius: radios.pildora,
    height: espacios.doce,
    width: espacios.doce,
  },
  trazo: { flex: 1, height: 2 },
});
