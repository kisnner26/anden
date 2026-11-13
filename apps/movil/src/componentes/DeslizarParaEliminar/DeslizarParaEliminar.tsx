import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

import {
  ANCHO_ACCION,
  limitarDeslizado,
  resolverDeslizado,
} from './resolverDeslizado';

const DURACION_MS = 220;
const UMBRAL_INICIO = 8;

export interface PropiedadesDeslizarParaEliminar {
  /** lo que lee el lector de pantalla como nombre de la acción */
  accion?: string;
  alEliminar: () => void;
  children: ReactNode;
}

/** como en iOS: se desliza a la izquierda para ver "Eliminar" o se sigue hasta el final para eliminar; el lector de pantalla recibe la acción aparte */
export function DeslizarParaEliminar({
  accion = t('comun.eliminar'),
  alEliminar,
  children,
}: PropiedadesDeslizarParaEliminar) {
  const { colores } = useTema();
  const reducir = useMovimientoReducido();
  const desplazamiento = useRef(new Animated.Value(0)).current;
  const opacidad = useRef(new Animated.Value(1)).current;
  const base = useRef(0);
  const ancho = useRef(0);
  const [abierto, establecerAbierto] = useState(false);
  const eliminando = useRef(false);

  useEffect(() => {
    const oyente = desplazamiento.addListener(({ value }) => {
      base.current = value;
    });
    return () => desplazamiento.removeListener(oyente);
  }, [desplazamiento]);

  const llevarA = useCallback(
    (valor: number, alFinal?: () => void) => {
      Animated.timing(desplazamiento, {
        duration: reducir ? 0 : DURACION_MS,
        toValue: valor,
        useNativeDriver: true,
      }).start(alFinal);
    },
    [desplazamiento, reducir],
  );

  const eliminar = useCallback(() => {
    if (eliminando.current) return;
    eliminando.current = true;
    llevarA(-ancho.current, () => {
      Animated.timing(opacidad, {
        duration: reducir ? 0 : DURACION_MS / 2,
        toValue: 0,
        useNativeDriver: true,
      }).start(alEliminar);
    });
  }, [alEliminar, llevarA, opacidad, reducir]);

  const inicio = useRef(0);
  const gesto = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evento, estado) =>
        Math.abs(estado.dx) > UMBRAL_INICIO &&
        Math.abs(estado.dx) > Math.abs(estado.dy) * 1.5,
      onPanResponderGrant: () => {
        inicio.current = base.current;
      },
      onPanResponderMove: (_evento, estado) => {
        desplazamiento.setValue(
          limitarDeslizado(inicio.current + estado.dx, ancho.current),
        );
      },
      onPanResponderRelease: (_evento, estado) => {
        const final = limitarDeslizado(
          inicio.current + estado.dx,
          ancho.current,
        );
        const resultado = resolverDeslizado(final, ancho.current);
        if (resultado === 'eliminar') eliminar();
        else if (resultado === 'abrir') {
          establecerAbierto(true);
          llevarA(-ANCHO_ACCION);
        } else {
          establecerAbierto(false);
          llevarA(0);
        }
      },
      onPanResponderTerminate: () => {
        establecerAbierto(false);
        llevarA(0);
      },
    }),
  ).current;

  return (
    <Animated.View
      accessibilityActions={[{ label: accion, name: 'delete' }]}
      onAccessibilityAction={(evento) => {
        if (evento.nativeEvent.actionName === 'delete') eliminar();
      }}
      onLayout={(evento) => {
        ancho.current = evento.nativeEvent.layout.width;
      }}
      style={{ opacity: opacidad }}
    >
      <View style={[estilos.accion, { backgroundColor: colores.cancelado }]}>
        <Pressable
          accessibilityElementsHidden={!abierto}
          accessibilityLabel={accion}
          accessibilityRole="button"
          importantForAccessibility={abierto ? 'yes' : 'no-hide-descendants'}
          onPress={eliminar}
          style={estilos.boton}
          testID="deslizar-eliminar"
        >
          <Text style={[tipografia.subtitulo, { color: colores.sobreNegro }]}>
            {accion}
          </Text>
        </Pressable>
      </View>
      <Animated.View
        {...gesto.panHandlers}
        style={{ transform: [{ translateX: desplazamiento }] }}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  accion: {
    alignItems: 'flex-end',
    borderRadius: radios.bloque,
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
  },
  boton: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: espacios.dieciseis,
    width: ANCHO_ACCION,
  },
});
