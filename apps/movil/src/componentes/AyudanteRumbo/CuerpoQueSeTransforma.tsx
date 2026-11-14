import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import { MascotaRumbo } from '@/componentes/MascotaRumbo';
import type { Humor } from '@/datos/mascota';
import { conAlfa } from '@/tema/alfa';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

/** cada cuántos milisegundos aparece la siguiente letra mientras el texto se materializa */
export const MS_POR_LETRA = 16;

/** el texto no aparece de golpe: se va materializando letra por letra una vez que el cuerpo ya es tarjeta */
function TextoMaterializado({
  activo,
  texto,
}: {
  activo: boolean;
  texto: string;
}) {
  const { colores } = useTema();
  const [letras, establecerLetras] = useState(0);

  useEffect(() => {
    establecerLetras(0);
    if (!activo) return;
    let ritmo: ReturnType<typeof setInterval> | undefined;
    const inicio = setTimeout(() => {
      let n = 0;
      ritmo = setInterval(() => {
        n += 1;
        establecerLetras(n);
        if (n >= texto.length) clearInterval(ritmo);
      }, MS_POR_LETRA);
    }, 220);
    return () => {
      clearTimeout(inicio);
      if (ritmo) clearInterval(ritmo);
    };
  }, [activo, texto]);

  return (
    <Text
      accessibilityLabel={texto}
      style={[tipografia.pequeno, { color: colores.tinta }]}
    >
      {texto.slice(0, letras)}
      <Text style={{ color: conAlfa(colores.tinta, 0) }}>
        {texto.slice(letras)}
      </Text>
    </Text>
  );
}

export interface PropiedadesCuerpoQueSeTransforma {
  /** lo que muestra cuando es formulario en vez de texto */
  contenido?: ReactNode;
  alToque?: () => void;
  /** a dónde se corre la tarjeta respecto de la mascota para que no se salga de la pantalla */
  desplazamientoX: number;
  /** la tarjeta crece hacia arriba (true) o hacia abajo (false) */
  haciaArriba: boolean;
  humor: Humor;
  /** 0 es el microbús y 1 la tarjeta completa */
  forma: Animated.Value;
  alto: number;
  ancho: number;
  altoBus: number;
  anchoBus: number;
  salto: number;
  texto: string | null;
  /** el cuerpo ya terminó de abrirse */
  abierto: boolean;
}

/**
 * el cuerpo de Rumbo cuando se transforma: el microbús se estira, se deforma y se materializa en una tarjeta del mismo
 * color de la app, con el texto escribiéndose adentro. Al terminar hace el camino inverso y vuelve a ser bus
 */
export function CuerpoQueSeTransforma({
  abierto,
  alToque,
  alto,
  altoBus,
  ancho,
  anchoBus,
  contenido,
  desplazamientoX,
  forma,
  haciaArriba,
  humor,
  salto,
  texto,
}: PropiedadesCuerpoQueSeTransforma) {
  const { colores } = useTema();
  const recorrido = [0, 1] as const;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        estilos.base,
        {
          height: forma.interpolate({
            inputRange: [...recorrido],
            outputRange: [altoBus, alto],
          }),
          left: forma.interpolate({
            inputRange: [...recorrido],
            outputRange: [0, desplazamientoX],
          }),
          top: forma.interpolate({
            inputRange: [...recorrido],
            outputRange: [0, haciaArriba ? altoBus - alto : 0],
          }),
          width: forma.interpolate({
            inputRange: [...recorrido],
            outputRange: [anchoBus, ancho],
          }),
        },
      ]}
    >
      {/* el destello de materialización: un aro ámbar que se abre desde el cuerpo */}
      <Animated.View
        pointerEvents="none"
        style={[
          estilos.aro,
          {
            borderColor: colores.ambar,
            opacity: forma.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.7, 0],
            }),
            transform: [
              {
                scale: forma.interpolate({
                  inputRange: [...recorrido],
                  outputRange: [1, 1.18],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          estilos.cuerpo,
          {
            backgroundColor: forma.interpolate({
              inputRange: [0, 0.6, 1],
              outputRange: [
                conAlfa(colores.ambar, 0),
                conAlfa(colores.ambar, 0.85),
                colores.barroClaro,
              ],
            }),
            borderColor: forma.interpolate({
              inputRange: [...recorrido],
              outputRange: [conAlfa(colores.linea, 0), colores.linea],
            }),
            borderRadius: forma.interpolate({
              inputRange: [...recorrido],
              outputRange: [18, 24],
            }),
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          disabled={alToque === undefined}
          onPress={alToque}
          style={StyleSheet.absoluteFill}
        />
        {/* el microbús se estira como plastilina y se desvanece mientras el cuerpo se vuelve tarjeta */}
        <Animated.View
          pointerEvents="none"
          style={[
            estilos.bus,
            {
              opacity: forma.interpolate({
                inputRange: [0, 0.5],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
              transform: [
                {
                  scaleX: forma.interpolate({
                    inputRange: [0, 0.45, 1],
                    outputRange: [1, 1.5, 1.7],
                  }),
                },
                {
                  scaleY: forma.interpolate({
                    inputRange: [0, 0.45, 1],
                    outputRange: [1, 0.65, 0.5],
                  }),
                },
              ],
            },
          ]}
        >
          <MascotaRumbo humor={humor} salto={salto} tamano={anchoBus} />
        </Animated.View>
        <Animated.View
          pointerEvents="box-none"
          style={[
            estilos.contenido,
            {
              opacity: forma.interpolate({
                inputRange: [0.6, 1],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          {contenido ??
            (texto !== null ? (
              <TextoMaterializado activo={abierto} texto={texto} />
            ) : null)}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  aro: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
    borderWidth: 3,
  },
  base: { position: 'absolute' },
  bus: {
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleSheet.absoluteFill,
  },
  contenido: { padding: espacios.doce },
  cuerpo: {
    borderWidth: 2,
    flex: 1,
    overflow: 'hidden',
  },
});
