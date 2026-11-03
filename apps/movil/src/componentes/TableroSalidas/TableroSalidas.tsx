import { StyleSheet, Text, View } from 'react-native';

import { BloqueNegro } from '@/componentes/BloqueNegro';
import { formatoHora } from '@/datos/formato';
import type { Salida } from '@/datos/salidas';
import { coloresOscuros as negro } from '@/tema/colores';
import { tipografia } from '@/tema/tipografia';
import { t } from '@/textos/t';

import { FichaFlap } from './FichaFlap';

export interface PropiedadesTableroSalidas {
  salidas: readonly Salida[];
}

type FormaEstado = 'anillo' | 'punto' | 'raya' | 'rombo';

interface EstadoTablero {
  color: string;
  forma: FormaEstado;
  texto: string;
}

/** el texto, el color y la forma de cada estado; nunca se comunica solo con color */
export function estadoTablero(salida: Salida): EstadoTablero {
  switch (salida.estado) {
    case 'en-ruta':
      return {
        color: negro.tintaSuave,
        forma: 'raya',
        texto: t('estados.salio'),
      };
    case 'llego':
      return {
        color: negro.tintaSuave,
        forma: 'raya',
        texto: t('estados.llego'),
      };
    case 'abordando':
      return {
        color: negro.ambar,
        forma: 'punto',
        texto: t('estados.abordando'),
      };
    case 'atrasado':
      return {
        color: negro.atrasado,
        forma: 'rombo',
        texto: `+${salida.minutosAtraso} ${t('viajar.minutos')}`,
      };
    case 'cancelado':
      return {
        color: negro.cancelado,
        forma: 'rombo',
        texto: t('estados.cancelado'),
      };
    default:
      return {
        color: negro.aTiempo,
        forma: 'anillo',
        texto: t('estados.aTiempo'),
      };
  }
}

function Forma({ color, forma }: { color: string; forma: FormaEstado }) {
  if (forma === 'raya') {
    return <View style={[estilos.raya, { backgroundColor: color }]} />;
  }
  if (forma === 'rombo') {
    return (
      <View
        style={[
          estilos.marca,
          { backgroundColor: color, transform: [{ rotate: '45deg' }] },
        ]}
      />
    );
  }
  if (forma === 'anillo') {
    return (
      <View style={[estilos.marca, estilos.anillo, { borderColor: color }]} />
    );
  }
  return (
    <View style={[estilos.marca, estilos.punto, { backgroundColor: color }]} />
  );
}

function Hora({ salida, pasada }: { pasada: boolean; salida: Salida }) {
  return (
    <View style={estilos.fichas}>
      {[...formatoHora(salida.salida)].map((caracter, indice) => (
        <FichaFlap
          caracter={caracter}
          color={pasada ? negro.tintaSuave : negro.ambar}
          key={`${caracter}${indice}`}
        />
      ))}
    </View>
  );
}

/** el tablero de andén: filas con la hora en fichas, el destino, el andén y el estado */
export function TableroSalidas({ salidas }: PropiedadesTableroSalidas) {
  return (
    <BloqueNegro estiloContenido={estilos.contenido} testID="tablero-salidas">
      <View style={[estilos.fila, estilos.encabezado]}>
        {(
          [
            ['columnaHora', estilos.colHora],
            ['columnaDestino', estilos.colDestino],
            ['columnaAnden', estilos.colAnden],
            ['columnaEstado', estilos.colEstado],
          ] as const
        ).map(([clave, columna]) => (
          <Text
            key={clave}
            style={[tipografia.etiqueta, columna, { color: negro.tintaSuave }]}
          >
            {t(`horarios.${clave}`)}
          </Text>
        ))}
      </View>
      {salidas.map((salida) => {
        const estado = estadoTablero(salida);
        const pasada = salida.estado === 'en-ruta' || salida.estado === 'llego';
        return (
          <View
            accessible
            accessibilityLabel={`${salida.destino}, ${formatoHora(salida.salida)}, ${estado.texto}`}
            key={salida.viajeId}
            style={[estilos.fila, estilos.separacion]}
          >
            <View style={estilos.colHora}>
              <Hora pasada={pasada} salida={salida} />
            </View>
            <View style={estilos.colDestino}>
              <Text
                numberOfLines={1}
                style={[
                  estilos.destino,
                  { color: pasada ? negro.tintaSuave : negro.sobreNegro },
                ]}
              >
                {salida.destino.toUpperCase()}
              </Text>
              <Text style={[tipografia.etiqueta, { color: negro.tintaSuave }]}>
                {t(`servicios.${salida.servicio}`)}
              </Text>
            </View>
            <View style={estilos.colAnden}>
              <View style={estilos.caja}>
                <Text style={[tipografia.dato, { color: negro.sobreNegro }]}>
                  {salida.anden}
                </Text>
              </View>
            </View>
            <View style={[estilos.colEstado, estilos.estado]}>
              <Forma color={estado.color} forma={estado.forma} />
              <Text
                numberOfLines={1}
                style={[tipografia.etiqueta, { color: estado.color }]}
              >
                {estado.texto}
              </Text>
            </View>
          </View>
        );
      })}
    </BloqueNegro>
  );
}

const estilos = StyleSheet.create({
  anillo: {
    backgroundColor: 'transparent',
    borderRadius: 999,
    borderWidth: 1.5,
  },
  caja: {
    alignItems: 'center',
    borderColor: negro.linea,
    borderRadius: 8,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 34,
  },
  colAnden: { width: 38 },
  colDestino: { flex: 1 },
  colEstado: { width: 88 },
  colHora: { width: 72 },
  contenido: { paddingHorizontal: 14, paddingVertical: 8 },
  destino: {
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 23,
    lineHeight: 24,
  },
  encabezado: { height: 34 },
  estado: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  fichas: { flexDirection: 'row', gap: 2 },
  fila: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  marca: { height: 7, width: 7 },
  punto: { borderRadius: 999 },
  raya: { height: 1.5, width: 8 },
  separacion: { borderTopColor: negro.linea, borderTopWidth: 1, height: 56 },
});
