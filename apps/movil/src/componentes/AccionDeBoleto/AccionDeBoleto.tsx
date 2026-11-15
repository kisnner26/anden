import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Bloque } from '@/componentes/Bloque';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export type TipoAccionDeBoleto = 'compartir' | 'pantalla' | 'recordatorio';

export interface PropiedadesAccionDeBoleto {
  /** ya está puesta: el recordatorio o la actividad en la pantalla de bloqueo */
  activa?: boolean;
  alPresionar: () => void;
  etiqueta: string;
  /** lo que lee el lector de pantalla; sin esto se lee la etiqueta */
  etiquetaAccesible?: string;
  tipo: TipoAccionDeBoleto;
}

function Dibujo({
  activa,
  tipo,
}: {
  activa: boolean;
  tipo: TipoAccionDeBoleto;
}) {
  const { colores } = useTema();
  const trazo = activa ? colores.sobreAmbar : colores.tinta;
  const relleno = activa ? colores.sobreAmbar : colores.ambar;
  return (
    <Svg height={30} viewBox="0 0 30 30" width={30}>
      {tipo === 'compartir' ? (
        <>
          <Path
            d="M15 19 V5 M9.5 10 L15 4.5 L20.5 10"
            fill="none"
            stroke={trazo}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.4}
          />
          <Path
            d="M8 14 H6.5 a2 2 0 0 0 -2 2 v8 a2 2 0 0 0 2 2 h17 a2 2 0 0 0 2 -2 v-8 a2 2 0 0 0 -2 -2 H22"
            fill="none"
            stroke={trazo}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.4}
          />
        </>
      ) : null}
      {tipo === 'recordatorio' ? (
        <>
          <Path
            d="M15 4.5 c-4.6 0 -7.5 3.3 -7.5 7.8 v4.2 L5 20.5 h20 l-2.5 -4 v-4.2 c0 -4.5 -2.9 -7.8 -7.5 -7.8 z"
            fill={
              activa
                ? conAlfa(colores.sobreAmbar, 0.18)
                : conAlfa(colores.ambar, 0.2)
            }
            stroke={trazo}
            strokeLinejoin="round"
            strokeWidth={2.4}
          />
          <Path
            d="M12 24 a3.2 3.2 0 0 0 6 0"
            fill="none"
            stroke={trazo}
            strokeLinecap="round"
            strokeWidth={2.4}
          />
          <Circle cx={22.5} cy={7} fill={relleno} r={3} />
        </>
      ) : null}
      {tipo === 'pantalla' ? (
        <>
          <Rect
            fill="none"
            height={23}
            rx={4.5}
            stroke={trazo}
            strokeWidth={2.4}
            width={15}
            x={7.5}
            y={3.5}
          />
          <Rect fill={trazo} height={2.4} rx={1.2} width={6} x={12} y={6.5} />
          <Path
            d="M11 17 H19"
            stroke={relleno}
            strokeLinecap="round"
            strokeWidth={3}
          />
          <Path
            d="M11 21.5 H16"
            stroke={trazo}
            strokeLinecap="round"
            strokeWidth={2.4}
          />
        </>
      ) : null}
    </Svg>
  );
}

/**
 * una acción del boleto: un mosaico cuadrado con su dibujo arriba y una etiqueta corta abajo; tres iguales en fila quedan
 * simétricos y nada se aplasta ni se corta. Cuando ya está puesta se pinta de ámbar
 */
export function AccionDeBoleto({
  activa = false,
  alPresionar,
  etiqueta,
  etiquetaAccesible,
  tipo,
}: PropiedadesAccionDeBoleto) {
  const { colores } = useTema();
  const contenido = (
    <View style={estilos.contenido}>
      <View
        style={[
          estilos.insignia,
          {
            backgroundColor: activa
              ? conAlfa(colores.sobreAmbar, 0.12)
              : conAlfa(colores.tinta, 0.06),
          },
        ]}
      >
        <Dibujo activa={activa} tipo={tipo} />
      </View>
      <Text
        adjustsFontSizeToFit
        numberOfLines={2}
        style={[
          tipografia.etiqueta,
          estilos.etiqueta,
          { color: activa ? colores.sobreAmbar : colores.tinta },
        ]}
      >
        {etiqueta}
      </Text>
    </View>
  );
  return (
    <Pressable
      accessibilityLabel={etiquetaAccesible ?? etiqueta}
      accessibilityRole="button"
      accessibilityState={{ selected: activa }}
      onPress={alPresionar}
      style={estilos.raiz}
      testID={`accion-boleto-${tipo}`}
    >
      {activa ? (
        <View style={[estilos.tarjeta, { backgroundColor: colores.ambar }]}>
          {contenido}
        </View>
      ) : (
        <Bloque estilo={estilos.bloque} estiloContenido={estilos.tarjeta}>
          {contenido}
        </Bloque>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  bloque: { flex: 1 },
  contenido: {
    alignItems: 'center',
    gap: espacios.ocho,
    justifyContent: 'center',
  },
  etiqueta: { textAlign: 'center' },
  insignia: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  raiz: { flex: 1 },
  tarjeta: {
    borderRadius: radios.bloque,
    justifyContent: 'center',
    minHeight: 108,
    paddingHorizontal: espacios.ocho,
    paddingVertical: espacios.doce,
  },
});
