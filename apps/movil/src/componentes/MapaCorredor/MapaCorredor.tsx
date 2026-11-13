import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import {
  Autobus,
  varianteDeClave,
  type IdVarianteBus,
} from '@/componentes/Autobus';
import { Loseta } from '@/componentes/Loseta';
import { regionQueEncierraTrazo } from '@/datos/busSimulado';
import type { Punto } from '@/datos/busSimulado';
import { orientacionBus } from '@/datos/orientacionBus';
import type { BusSimulado } from '@/datos/useBusSimulado';
import { radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

const ALTO_MAPA = 300;
const ANCHO_BUS_MAPA = 72;
const ANCHO_BUS_LETRERO = 'ANDÉN';

export interface PropiedadesMapaCorredor {
  /** el recorrido a dibujar; sin `bus` solo se ve el camino y las dos terminales */
  simulacion: Pick<BusSimulado, 'destino' | 'origen' | 'trazo'> & {
    bus?: Punto;
  };
  /** texto bajo la terminal de destino, por ejemplo "Estás acá" */
  etiquetaDestino?: string;
  /** modelo del bus; sin indicar se reparte por corredor, así cada camino tiene el suyo */
  variante?: IdVarianteBus;
}

function Terminal({ codigo }: { codigo: string }) {
  const { colores } = useTema();
  return (
    <Loseta tamano={44} variante="ambar">
      <Text style={[tipografia.dato, { color: colores.sobreAmbar }]}>
        {codigo}
      </Text>
    </Loseta>
  );
}

/** mapa del corredor: trazo entre las dos terminales y el bus simulado encima */
export function MapaCorredor({
  etiquetaDestino,
  simulacion,
  variante,
}: PropiedadesMapaCorredor) {
  const { colores, modo } = useTema();
  const { bus, destino, origen, trazo } = simulacion;
  const orientacion = bus ? orientacionBus(trazo, bus) : null;
  const modelo =
    variante ?? varianteDeClave(`${origen.codigo}-${destino.codigo}`);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[estilos.marco, { borderColor: colores.linea }]}
      testID="mapa-corredor"
    >
      <MapView
        initialRegion={regionQueEncierraTrazo(trazo)}
        pitchEnabled={false}
        rotateEnabled={false}
        style={estilos.mapa}
        toolbarEnabled={false}
        userInterfaceStyle={modo === 'oscuro' ? 'dark' : 'light'}
      >
        <Polyline
          coordinates={trazo.map((punto) => ({
            latitude: punto.lat,
            longitude: punto.lng,
          }))}
          lineCap="round"
          strokeColor={colores.ambar}
          strokeWidth={5}
        />
        <Marker
          coordinate={{
            latitude: origen.coordenadas.lat,
            longitude: origen.coordenadas.lng,
          }}
          tracksViewChanges={false}
        >
          <Terminal codigo={origen.codigo} />
        </Marker>
        <Marker
          coordinate={{
            latitude: destino.coordenadas.lat,
            longitude: destino.coordenadas.lng,
          }}
          tracksViewChanges={false}
        >
          <View style={estilos.marcaDestino}>
            <Terminal codigo={destino.codigo} />
            {etiquetaDestino ? (
              <View
                style={[
                  estilos.cartel,
                  { backgroundColor: colores.bloqueNegro },
                ]}
              >
                <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
                  {etiquetaDestino}
                </Text>
              </View>
            ) : null}
          </View>
        </Marker>
        {bus && (
          <Marker
            anchor={{ x: 0.5, y: 0.5 }}
            coordinate={{ latitude: bus.lat, longitude: bus.lng }}
            testID="bus-simulado"
            tracksViewChanges
            zIndex={10}
          >
            <View
              style={{
                transform: [{ rotate: `${orientacion?.inclinacion ?? 0}deg` }],
              }}
              testID="orientacion-bus"
            >
              <Autobus
                animado
                usarMiUnidad
                ancho={ANCHO_BUS_MAPA}
                espejo={orientacion?.haciaElOeste}
                letrero={ANCHO_BUS_LETRERO}
                variante={modelo}
              />
            </View>
          </Marker>
        )}
      </MapView>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartel: {
    borderRadius: radios.pildora,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  marcaDestino: { alignItems: 'center' },
  mapa: { height: ALTO_MAPA, width: '100%' },
  marco: {
    borderRadius: radios.bloqueNegro,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
