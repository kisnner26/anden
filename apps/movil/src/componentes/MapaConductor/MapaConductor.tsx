import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { Autobus } from '@/componentes/Autobus';
import type { Punto } from '@/datos/busSimulado';
import { regionQueEncierraTrazo } from '@/datos/busSimulado';
import type { PuntosManuales } from '@/datos/rutaManual';
import { orientacionBus } from '@/datos/orientacionBus';
import { radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export interface PropiedadesMapaConductor {
  /** cada vez que sube, el mapa vuelve a centrarse en el bus (o en todo el camino si todavía no hay posición) */
  centrar: number;
  /** cuánto del mapa tapa el panel de abajo, para que lo importante quede en la parte visible */
  espacioInferior: number;
  destino: { coordenadas: Punto; nombre: string };
  origen: { coordenadas: Punto; nombre: string };
  trazo: readonly Punto[];
  bus?: Punto | null;
  /** con esto encendido, tocar el mapa marca los puntos A y B */
  marcando?: boolean;
  /** los puntos A y B marcados a mano */
  puntos?: PuntosManuales;
  alMarcar?: (punto: Punto) => void;
  /** se arrastró uno de los dos puntos hasta otro lugar */
  alMoverPunto?: (cual: 'a' | 'b', punto: Punto) => void;
}

/** el rótulo negro con flecha que lleva cada punto: cómo se llama y que se puede tocar, como en las apps de viajes */
function Rotulo({ detalle, titulo }: { detalle: string; titulo: string }) {
  const { colores } = useTema();
  return (
    <View style={estilos.puntoCaja}>
      <View style={[estilos.rotulo, { backgroundColor: colores.bloqueNegro }]}>
        <View>
          <Text
            style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
          >
            {titulo}
          </Text>
          <Text style={[tipografia.subtitulo, { color: colores.sobreNegro }]}>
            {detalle}
          </Text>
        </View>
        <Text style={[tipografia.subtitulo, { color: colores.sobreNegro }]}>
          ›
        </Text>
      </View>
      <View
        style={[estilos.palito, { backgroundColor: colores.bloqueNegro }]}
      />
      <View
        style={[
          estilos.punto,
          { backgroundColor: colores.ambar, borderColor: colores.bloqueNegro },
        ]}
      />
    </View>
  );
}

/**
 * el mapa del viaje del conductor a pantalla completa, al estilo de las apps de transporte: el camino grueso, rótulos
 * en los extremos y el bus encima. El panel de abajo lo tapa, así que el centrado deja ese espacio libre
 */
export function MapaConductor({
  alMarcar,
  alMoverPunto,
  bus,
  centrar,
  destino,
  espacioInferior,
  marcando = false,
  origen,
  puntos,
  trazo,
}: PropiedadesMapaConductor) {
  const { colores, modo } = useTema();
  const mapa = useRef<MapView>(null);
  const orientacion = bus ? orientacionBus([...trazo], bus) : null;

  useEffect(() => {
    if (centrar === 0) return;
    if (bus) {
      mapa.current?.animateToRegion(
        {
          latitude: bus.lat,
          latitudeDelta: 0.04,
          longitude: bus.lng,
          longitudeDelta: 0.04,
        },
        450,
      );
    } else {
      mapa.current?.animateToRegion(regionQueEncierraTrazo([...trazo]), 450);
    }
  }, [centrar]);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
      testID="mapa-conductor"
    >
      <MapView
        initialRegion={regionQueEncierraTrazo([...trazo])}
        onPress={(e) => {
          if (marcando)
            alMarcar?.({
              lat: e.nativeEvent.coordinate.latitude,
              lng: e.nativeEvent.coordinate.longitude,
            });
        }}
        mapPadding={{ bottom: espacioInferior, left: 0, right: 0, top: 96 }}
        pitchEnabled={false}
        ref={mapa}
        rotateEnabled={false}
        style={StyleSheet.absoluteFill}
        toolbarEnabled={false}
        userInterfaceStyle={modo === 'oscuro' ? 'dark' : 'light'}
      >
        <Polyline
          coordinates={trazo.map((p) => ({
            latitude: p.lat,
            longitude: p.lng,
          }))}
          lineCap="round"
          strokeColor={colores.bloqueNegro}
          strokeWidth={9}
        />
        <Polyline
          coordinates={trazo.map((p) => ({
            latitude: p.lat,
            longitude: p.lng,
          }))}
          lineCap="round"
          strokeColor={colores.ambar}
          strokeWidth={5}
        />
        <Marker
          anchor={{ x: 0.5, y: 1 }}
          coordinate={{
            latitude: origen.coordenadas.lat,
            longitude: origen.coordenadas.lng,
          }}
          tracksViewChanges={false}
        >
          <Rotulo detalle={origen.nombre} titulo="SALIDA" />
        </Marker>
        <Marker
          anchor={{ x: 0.5, y: 1 }}
          coordinate={{
            latitude: destino.coordenadas.lat,
            longitude: destino.coordenadas.lng,
          }}
          tracksViewChanges={false}
        >
          <Rotulo detalle={destino.nombre} titulo="DESTINO" />
        </Marker>
        {puntos?.a && puntos.b ? (
          <Polyline
            coordinates={[
              { latitude: puntos.a.lat, longitude: puntos.a.lng },
              { latitude: puntos.b.lat, longitude: puntos.b.lng },
            ]}
            lineCap="round"
            lineDashPattern={[2, 10]}
            strokeColor={colores.sobreNegro}
            strokeWidth={5}
          />
        ) : null}
        {(['a', 'b'] as const).map((cual) => {
          const punto = puntos?.[cual];
          if (!punto) return null;
          return (
            <Marker
              anchor={{ x: 0.5, y: 0.5 }}
              coordinate={{ latitude: punto.lat, longitude: punto.lng }}
              draggable
              key={cual}
              onDragEnd={(e) =>
                alMoverPunto?.(cual, {
                  lat: e.nativeEvent.coordinate.latitude,
                  lng: e.nativeEvent.coordinate.longitude,
                })
              }
              testID={`punto-${cual}`}
              tracksViewChanges={false}
              zIndex={20}
            >
              <View
                style={[
                  estilos.letra,
                  {
                    backgroundColor:
                      cual === 'a' ? colores.ambar : colores.bloqueNegro,
                    borderColor:
                      cual === 'a' ? colores.bloqueNegro : colores.ambar,
                  },
                ]}
              >
                <Text
                  style={[
                    tipografia.subtitulo,
                    {
                      color: cual === 'a' ? colores.sobreAmbar : colores.ambar,
                    },
                  ]}
                >
                  {cual.toUpperCase()}
                </Text>
              </View>
            </Marker>
          );
        })}
        {bus ? (
          <Marker
            anchor={{ x: 0.5, y: 0.5 }}
            coordinate={{ latitude: bus.lat, longitude: bus.lng }}
            testID="bus-conductor"
            tracksViewChanges
            zIndex={10}
          >
            <View
              style={{
                transform: [{ rotate: `${orientacion?.inclinacion ?? 0}deg` }],
              }}
            >
              <Autobus
                animado
                ancho={68}
                espejo={orientacion?.haciaElOeste}
                usarMiUnidad
              />
            </View>
          </Marker>
        ) : null}
      </MapView>
    </View>
  );
}

const estilos = StyleSheet.create({
  letra: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 3,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  palito: { height: 8, width: 3 },
  punto: { borderRadius: 8, borderWidth: 3, height: 16, width: 16 },
  puntoCaja: { alignItems: 'center' },
  rotulo: {
    alignItems: 'center',
    borderRadius: radios.loseta,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
