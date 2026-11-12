import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { Autobus } from '@/componentes/Autobus';
import { Loseta } from '@/componentes/Loseta';
import { regionQueEncierra } from '@/datos/busSimulado';
import type { BusSimulado } from '@/datos/useBusSimulado';
import { radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

const ALTO_MAPA = 300;
const ANCHO_BUS_MAPA = 72;
const ANCHO_BUS_LETRERO = 'ANDÉN';

export interface PropiedadesMapaCorredor {
  simulacion: BusSimulado;
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
export function MapaCorredor({ simulacion }: PropiedadesMapaCorredor) {
  const { colores, modo } = useTema();
  const { bus, destino, origen } = simulacion;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[estilos.marco, { borderColor: colores.linea }]}
      testID="mapa-corredor"
    >
      <MapView
        initialRegion={regionQueEncierra(
          { lat: origen.coordenadas.lat, lng: origen.coordenadas.lng },
          { lat: destino.coordenadas.lat, lng: destino.coordenadas.lng },
        )}
        pitchEnabled={false}
        rotateEnabled={false}
        style={estilos.mapa}
        toolbarEnabled={false}
        userInterfaceStyle={modo === 'oscuro' ? 'dark' : 'light'}
      >
        <Polyline
          coordinates={[
            {
              latitude: origen.coordenadas.lat,
              longitude: origen.coordenadas.lng,
            },
            {
              latitude: destino.coordenadas.lat,
              longitude: destino.coordenadas.lng,
            },
          ]}
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
          <Terminal codigo={destino.codigo} />
        </Marker>
        <Marker
          anchor={{ x: 0.5, y: 0.5 }}
          coordinate={{ latitude: bus.lat, longitude: bus.lng }}
          testID="bus-simulado"
          tracksViewChanges
          zIndex={10}
        >
          <Autobus ancho={ANCHO_BUS_MAPA} letrero={ANCHO_BUS_LETRERO} />
        </Marker>
      </MapView>
    </View>
  );
}

const estilos = StyleSheet.create({
  mapa: { height: ALTO_MAPA, width: '100%' },
  marco: {
    borderRadius: radios.bloqueNegro,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
