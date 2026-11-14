import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { MascotaPito } from '@/componentes/MascotaPito';
import {
  consejoDeLaMascota,
  yaSeVioHoy,
  type Humor,
  type PantallaMascota,
} from '@/datos/mascota';
import { nombrePropio } from '@/datos/perfil';
import { useBoletoPorCalificar } from '@/datos/useBoletoPorCalificar';
import { useBoletos } from '@/datos/useBoletos';
import { useMascota } from '@/datos/useMascota';
import { usePerfil } from '@/datos/usePerfil';
import { useSalidas } from '@/datos/useSalidas';
import { useSensaciones } from '@/datos/useSensaciones';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

/** cuánto tarda un consejo en irse solo si nadie lo toca */
export const SEGUNDOS_DEL_CONSEJO = 14;

export interface PropiedadesGuiaMascota {
  pantalla: PantallaMascota;
}

/**
 * Pito, la mascota guía: aparece abajo a la izquierda con un globo cuando tiene algo útil que decir en esta
 * pantalla (un bus por salir, un truco, un saludo), sube con un resorte, se puede tocar para despedirlo y
 * se va solo. Si la persona no la activó en los ajustes, no se dibuja nada
 */
export function GuiaMascota({ pantalla }: PropiedadesGuiaMascota) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const reducido = useMovimientoReducido();
  const sentir = useSensaciones();
  const { activa, marcar, vistos } = useMascota();
  const { boletos } = useBoletos();
  const { ahora, salidas } = useSalidas();
  const { perfil } = usePerfil();
  const porCalificar = useBoletoPorCalificar();
  const [despedido, establecerDespedido] = useState<string | null>(null);
  const entrada = useRef(new Animated.Value(0)).current;

  const consejo = useMemo(() => {
    const proximo = boletos
      .filter(
        ({ boleto, resumen }) =>
          boleto.estado === 'vigente' && new Date(resumen.salida) >= ahora,
      )
      .sort(
        (a, b) =>
          new Date(a.resumen.salida).getTime() -
          new Date(b.resumen.salida).getTime(),
      )[0];
    return consejoDeLaMascota({
      ahora,
      boletoProximo: proximo
        ? {
            destino: proximo.resumen.destino,
            minutos: Math.round(
              (new Date(proximo.resumen.salida).getTime() - ahora.getTime()) /
                60_000,
            ),
            punto: proximo.resumen.puntoEncuentro,
          }
        : null,
      haySalidasHoy: salidas.some(
        (s) =>
          s.salida.toDateString() === ahora.toDateString() &&
          s.salida.getTime() >= ahora.getTime(),
      ),
      nombre: nombrePropio(perfil.nombre).split(' ')[0] ?? '',
      pantalla,
      porCalificar: porCalificar !== null,
      sinBoletos: boletos.length === 0,
    });
  }, [ahora, boletos, pantalla, perfil.nombre, porCalificar, salidas]);

  const visible =
    activa &&
    consejo !== null &&
    despedido !== consejo.id &&
    !yaSeVioHoy(vistos, consejo.id, ahora);

  useEffect(() => {
    if (!visible) {
      entrada.setValue(0);
      return;
    }
    if (reducido) {
      entrada.setValue(1);
    } else {
      Animated.spring(entrada, {
        friction: 6,
        tension: 90,
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
    const id = consejo.id;
    const temporizador = setTimeout(
      () => despedir(id),
      SEGUNDOS_DEL_CONSEJO * 1000,
    );
    return () => clearTimeout(temporizador);
  }, [visible, consejo?.id]);

  function despedir(id: string) {
    marcar(id);
    establecerDespedido(id);
  }

  if (!visible || !consejo) return null;
  const humor: Humor = consejo.humor;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        estilos.contenedor,
        {
          bottom: Math.max(margenes.bottom, espacios.doce) + espacios.cuatro,
          opacity: entrada,
          transform: [
            {
              translateY: entrada.interpolate({
                inputRange: [0, 1],
                outputRange: [90, 0],
              }),
            },
          ],
        },
      ]}
      testID="guia-mascota"
    >
      <Pressable
        accessibilityHint={t('mascota.descartar')}
        accessibilityLabel={consejo.texto}
        accessibilityRole="button"
        onPress={() => {
          sentir(humor === 'alerta' ? 'aviso' : 'toque');
          despedir(consejo.id);
        }}
        style={estilos.fila}
      >
        <MascotaPito humor={humor} tamano={74} />
        <View style={estilos.globo}>
          <Bloque estiloContenido={estilos.textoGlobo}>
            <Text style={[tipografia.pequeno, { color: colores.tinta }]}>
              {consejo.texto}
            </Text>
          </Bloque>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    left: espacios.doce,
    position: 'absolute',
    right: espacios.doce,
    zIndex: 40,
  },
  fila: { alignItems: 'flex-end', flexDirection: 'row', gap: espacios.cuatro },
  globo: { flex: 1, marginBottom: espacios.doce, maxWidth: 270 },
  textoGlobo: { padding: espacios.doce },
});
