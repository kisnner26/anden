import {
  asientosDe,
  PLANOS,
  type Asiento,
  type ConfiguracionBus,
  type EstadoAsiento,
} from '@anden/dominio';
import { LinearGradient } from 'expo-linear-gradient';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesMapaAsientos {
  alElegir: (numero: number) => void;
  configuracion: ConfiguracionBus;
  elegidos: readonly number[];
  estados: ReadonlyMap<number, EstadoAsiento>;
}

const LADO = 38;
const SEPARACION = 8;

function etiquetaDe(asiento: Asiento, estado: EstadoAsiento, elegido: boolean) {
  const lugar =
    asiento.tipo === 'ventana'
      ? 'ventana'
      : asiento.tipo === 'pasillo'
        ? 'pasillo'
        : 'preferencial';
  const situacion = elegido
    ? t('asientos.tuyo').toLowerCase()
    : estado === 'libre'
      ? t('asientos.libre').toLowerCase()
      : estado === 'retenido'
        ? t('asientos.apartado').toLowerCase()
        : t('asientos.vendido').toLowerCase();
  return `${t('asientos.asiento')} ${asiento.numero}, ${lugar}, ${situacion}`;
}

/** el plano del bus visto desde arriba, dibujado desde la matriz de la configuración del dominio */
export function MapaAsientos({
  alElegir,
  configuracion,
  elegidos,
  estados,
}: PropiedadesMapaAsientos) {
  const { colores } = useTema();
  const plano = PLANOS[configuracion];
  const asientos = new Map(
    asientosDe(configuracion).map((asiento) => [
      `${asiento.fila}:${asiento.columna}`,
      asiento,
    ]),
  );

  return (
    <Bloque
      estilo={estilos.carcasa}
      estiloContenido={estilos.plano}
      radio="carcasa"
      testID="mapa-asientos"
    >
      {plano.map((celdas, fila) => (
        <View key={fila} style={estilos.fila}>
          {celdas.map((celda, columna) => {
            const clave = `${fila}:${columna}`;
            const asiento = asientos.get(clave);

            if (celda === 'volante') {
              return (
                <View key={clave} style={estilos.celda}>
                  <Icono nombre="volante" tamano="ilustracion" />
                </View>
              );
            }
            if (celda === 'puerta') {
              if (celdas[columna - 1] === 'puerta') return null;
              let ancho = 1;
              while (celdas[columna + ancho] === 'puerta') ancho += 1;
              return (
                <View
                  key={clave}
                  style={[
                    estilos.puerta,
                    {
                      borderLeftColor: colores.linea,
                      width: ancho * LADO + (ancho - 1) * SEPARACION,
                    },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
                  >
                    {t('asientos.puerta')}
                  </Text>
                </View>
              );
            }
            if (celda !== 'asiento' || !asiento) {
              return <View key={clave} style={estilos.celda} />;
            }

            const estado = estados.get(asiento.numero) ?? 'libre';
            const elegido = elegidos.includes(asiento.numero);
            const ocupado = estado !== 'libre';

            return (
              <Pressable
                accessibilityLabel={etiquetaDe(asiento, estado, elegido)}
                accessibilityRole="button"
                accessibilityState={{ disabled: ocupado, selected: elegido }}
                disabled={ocupado}
                key={clave}
                onPress={() => {
                  void impactAsync(ImpactFeedbackStyle.Light);
                  alElegir(asiento.numero);
                }}
                style={estilos.celda}
              >
                {elegido ? (
                  <LinearGradient
                    colors={[colores.ambar, colores.ambarProfundo]}
                    end={{ x: 1, y: 1 }}
                    start={{ x: 0, y: 0 }}
                    style={estilos.asiento}
                  >
                    <Text
                      style={[tipografia.dato, { color: colores.sobreAmbar }]}
                    >
                      {asiento.numero}
                    </Text>
                  </LinearGradient>
                ) : ocupado ? (
                  <View
                    style={[
                      estilos.asiento,
                      estado === 'retenido'
                        ? {
                            borderColor: colores.tintaSuave,
                            borderStyle: 'dashed',
                            borderWidth: 1.5,
                          }
                        : {
                            backgroundColor: colores.barroOscuro,
                          },
                    ]}
                  >
                    <Text
                      style={[tipografia.dato, { color: colores.tintaSuave }]}
                    >
                      {asiento.numero}
                    </Text>
                  </View>
                ) : (
                  <Bloque estiloContenido={estilos.asiento} radio="asiento">
                    <Text style={[tipografia.dato, { color: colores.tinta }]}>
                      {asiento.numero}
                    </Text>
                  </Bloque>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  asiento: {
    alignItems: 'center',
    borderRadius: radios.asiento,
    height: LADO,
    justifyContent: 'center',
    width: LADO,
  },
  carcasa: { alignSelf: 'center' },
  celda: {
    alignItems: 'center',
    height: LADO,
    justifyContent: 'center',
    width: LADO,
  },
  fila: { flexDirection: 'row', gap: SEPARACION },
  puerta: {
    alignItems: 'center',
    borderLeftWidth: 2,
    height: LADO,
    justifyContent: 'center',
  },
  plano: {
    gap: SEPARACION,
    paddingBottom: 18,
    paddingHorizontal: 18,
    paddingTop: 30,
  },
});
