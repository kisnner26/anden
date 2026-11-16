import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Chip } from '@/componentes/Chip';
import { ExplosionConfirmacion } from '@/componentes/ExplosionConfirmacion';
import { Presionable } from '@/componentes/Presionable';
import {
  comentarioDeCalificacion,
  etiquetasRapidas,
  palabraDeNota,
} from '@/datos/calificarViaje';
import { guardarOpinion, leerOpiniones } from '@/datos/opiniones';
import type { BoletoGuardado } from '@/datos/reserva';
import { useSensaciones } from '@/datos/useSensaciones';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesCalificarViaje {
  /** el viaje que se califica */
  guardado: BoletoGuardado;
  /** avisa cuando la opinión quedó guardada */
  alCalificar?: () => void;
}

export const TRAZO_ESTRELLA =
  'M24 5L29.800 17.200L43 19L33.400 28.200L35.800 41.400L24 35.200L12.200 41.400L14.600 28.200L5 19L18.200 17.200Z';

/** el agradecimiento: las estrellas elegidas saltan una tras otra, un anillo se expande y el texto sube */
function Agradecimiento({ estrellas }: { estrellas: number }) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const pops = useRef(
    [0, 1, 2, 3, 4].map(() => new Animated.Value(reducido ? 1 : 0)),
  ).current;
  const anillo = useRef(new Animated.Value(reducido ? 1 : 0)).current;
  const texto = useRef(new Animated.Value(reducido ? 1 : 0)).current;

  useEffect(() => {
    if (reducido) return;
    Animated.parallel([
      Animated.stagger(
        110,
        pops.slice(0, estrellas).map((pop) =>
          Animated.spring(pop, {
            friction: 3.5,
            tension: 170,
            toValue: 1,
            useNativeDriver: true,
          }),
        ),
      ),
      Animated.timing(anillo, {
        duration: 1100,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(texto, {
        delay: 450,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [anillo, estrellas, pops, reducido, texto]);

  return (
    <View style={estilos.agradece}>
      <View style={estilos.escenarioGracias}>
        <Animated.View
          pointerEvents="none"
          style={[
            estilos.anilloGracias,
            {
              borderColor: colores.ambar,
              opacity: anillo.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 0],
              }),
              transform: [
                {
                  scale: anillo.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 2.6],
                  }),
                },
              ],
            },
          ]}
        />
        <View style={estilos.estrellasGracias}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Animated.View
              key={i}
              style={{
                opacity: i < estrellas ? pops[i] : 0.25,
                transform: [
                  {
                    scale:
                      i < estrellas
                        ? (pops[i] as Animated.Value).interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1],
                          })
                        : 1,
                  },
                  {
                    translateY:
                      i < estrellas
                        ? (pops[i] as Animated.Value).interpolate({
                            inputRange: [0, 1],
                            outputRange: [14, 0],
                          })
                        : 0,
                  },
                ],
              }}
            >
              <Svg height={34} viewBox="0 0 48 48" width={34}>
                <Path
                  d={TRAZO_ESTRELLA}
                  fill={i < estrellas ? colores.ambar : 'none'}
                  stroke={i < estrellas ? colores.ambar : colores.tintaSuave}
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                />
              </Svg>
            </Animated.View>
          ))}
        </View>
        <View pointerEvents="none" style={estilos.chispasGracias}>
          <ExplosionConfirmacion />
        </View>
      </View>
      <Animated.Text
        accessibilityLiveRegion="polite"
        style={[
          tipografia.subtitulo,
          estilos.centrado,
          {
            color: colores.tinta,
            opacity: texto,
            transform: [
              {
                translateY: texto.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          },
        ]}
      >
        {t('calificarViaje.gracias')}
      </Animated.Text>
    </View>
  );
}

function Estrella({
  alElegir,
  activa,
  indice,
}: {
  activa: boolean;
  alElegir: () => void;
  indice: number;
}) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const salto = useRef(new Animated.Value(activa ? 1 : 0)).current;

  useEffect(() => {
    if (reducido) {
      salto.setValue(activa ? 1 : 0);
      return;
    }
    Animated.spring(salto, {
      delay: activa ? indice * 40 : 0,
      friction: 4,
      tension: 160,
      toValue: activa ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [activa, indice, reducido, salto]);

  return (
    <Presionable
      accessibilityLabel={`${indice + 1} ${t('opiniones.estrellas')}`}
      accessibilityRole="button"
      accessibilityState={{ selected: activa }}
      escala={0.85}
      hitSlop={6}
      onPress={alElegir}
      sensacion="seleccion"
    >
      <Animated.View
        style={{
          transform: [
            {
              scale: salto.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.18],
              }),
            },
            {
              rotate: salto.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '-8deg'],
              }),
            },
          ],
        }}
      >
        <Svg height={40} viewBox="0 0 48 48" width={40}>
          <Path
            d={TRAZO_ESTRELLA}
            fill={activa ? colores.ambar : 'none'}
            stroke={activa ? colores.ambar : colores.tintaSuave}
            strokeLinejoin="round"
            strokeWidth={2.5}
          />
        </Svg>
      </Animated.View>
    </Presionable>
  );
}

/**
 * la tarjeta que pide calificar el viaje al terminar: cinco estrellas que se encienden una tras otra, etiquetas
 * rápidas según la nota, un comentario corto si quiere y un solo botón; al enviar se agradece con una
 * explosión de chispas y queda guardada en el teléfono
 */
export function CalificarViaje({
  alCalificar,
  guardado,
}: PropiedadesCalificarViaje) {
  const { colores } = useTema();
  const sentir = useSensaciones();
  const [estrellas, establecerEstrellas] = useState(0);
  const [etiquetas, establecerEtiquetas] = useState<string[]>([]);
  const [comentario, establecerComentario] = useState('');
  const [enviada, establecerEnviada] = useState(false);
  // la tarjeta se va sola un momento después de agradecer, o al elegir "Ahora no"
  const [oculta, establecerOculta] = useState(false);
  const [conComentario, establecerConComentario] = useState(false);
  const anchoEstrellas = useRef(0);
  const ultimaDeslizada = useRef(0);
  const deslizar = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 8,
      onPanResponderMove: (evento) => {
        if (anchoEstrellas.current === 0) return;
        const n = Math.min(
          5,
          Math.max(
            1,
            Math.ceil(
              (evento.nativeEvent.locationX / anchoEstrellas.current) * 5,
            ),
          ),
        );
        if (n === ultimaDeslizada.current) return;
        ultimaDeslizada.current = n;
        establecerEstrellas(n);
        establecerEtiquetas([]);
      },
      onStartShouldSetPanResponder: () => false,
    }),
  ).current;
  const [yaCalificado, establecerYaCalificado] = useState<boolean | null>(null);
  const { boleto, resumen } = guardado;

  useEffect(() => {
    void leerOpiniones().then((lista) =>
      establecerYaCalificado(lista.some((o) => o.boletoId === boleto.id)),
    );
  }, [boleto.id]);

  useEffect(() => {
    if (!enviada) return;
    const espera = setTimeout(() => establecerOculta(true), 3200);
    return () => clearTimeout(espera);
  }, [enviada]);

  if (oculta || yaCalificado === null || (yaCalificado && !enviada)) {
    return null;
  }

  function elegirEtiqueta(etiqueta: string) {
    establecerEtiquetas((actuales) =>
      actuales.includes(etiqueta)
        ? actuales.filter((e) => e !== etiqueta)
        : [...actuales, etiqueta],
    );
  }

  async function enviar() {
    if (estrellas < 1 || estrellas > 5) return;
    await guardarOpinion({
      boletoId: boleto.id,
      choferId: resumen.choferId,
      comentario: comentarioDeCalificacion(etiquetas, comentario),
      estrellas: estrellas as 1 | 2 | 3 | 4 | 5,
    });
    sentir('exito');
    establecerEnviada(true);
    alCalificar?.();
  }

  if (enviada) {
    return (
      <Bloque estiloContenido={estilos.gracias} testID="calificacion-enviada">
        <Agradecimiento estrellas={estrellas} />
      </Bloque>
    );
  }

  return (
    <Bloque estiloContenido={estilos.tarjeta} testID="calificar-viaje">
      <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
        {rellenar(t('calificarViaje.titulo'), {
          chofer: resumen.choferNombre.split(' ')[0] ?? '',
        })}
      </Text>
      <View
        {...deslizar.panHandlers}
        onLayout={(e) => {
          anchoEstrellas.current = e.nativeEvent.layout.width;
        }}
        style={estilos.estrellas}
      >
        {[0, 1, 2, 3, 4].map((indice) => (
          <Estrella
            activa={indice < estrellas}
            alElegir={() => {
              establecerEstrellas(indice + 1);
              establecerEtiquetas([]);
            }}
            indice={indice}
            key={indice}
          />
        ))}
      </View>
      <Text
        accessibilityLiveRegion="polite"
        style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
      >
        {palabraDeNota(estrellas)}
      </Text>
      {estrellas > 0 && (
        <>
          <View style={estilos.etiquetas}>
            {etiquetasRapidas(estrellas).map((etiqueta) => (
              <Chip
                alCambiar={() => elegirEtiqueta(etiqueta)}
                etiqueta={etiqueta}
                key={etiqueta}
                seleccionado={etiquetas.includes(etiqueta)}
              />
            ))}
          </View>
          {conComentario ? (
            <CampoTexto
              alCambiar={establecerComentario}
              etiqueta={t('opiniones.comentario')}
              marcador={t('opiniones.marcador')}
              valor={comentario}
            />
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => establecerConComentario(true)}
              style={estilos.ahoraNo}
            >
              <Text
                style={[tipografia.subtitulo, { color: colores.ambarTexto }]}
              >
                {t('calificarViaje.agregarComentario')}
              </Text>
            </Pressable>
          )}
          <BotonAccion
            alPresionar={() => void enviar()}
            etiqueta={t('opiniones.enviar')}
          />
        </>
      )}
      <Pressable
        accessibilityRole="button"
        onPress={() => establecerOculta(true)}
        style={estilos.ahoraNo}
      >
        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {t('calificarViaje.ahoraNo')}
        </Text>
      </Pressable>
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  agradece: { alignItems: 'center', gap: espacios.dieciseis },
  anilloGracias: {
    borderRadius: 999,
    borderWidth: 3,
    height: 80,
    position: 'absolute',
    width: 80,
  },
  chispasGracias: {
    alignItems: 'center',
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
  },
  escenarioGracias: {
    alignItems: 'center',
    height: 90,
    justifyContent: 'center',
    width: '100%',
  },
  estrellasGracias: { flexDirection: 'row', gap: espacios.ocho },
  ahoraNo: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  centrado: { textAlign: 'center' },
  chispas: { alignItems: 'center', height: 56, justifyContent: 'center' },
  estrellas: { flexDirection: 'row', gap: espacios.ocho },
  etiquetas: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
  gracias: {
    alignItems: 'center',
    gap: espacios.doce,
    padding: espacios.veinticuatro,
  },
  tarjeta: { gap: espacios.doce, padding: espacios.veinticuatro },
});
