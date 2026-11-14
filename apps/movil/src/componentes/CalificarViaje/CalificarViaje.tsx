import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Chip } from '@/componentes/Chip';
import { ExplosionConfirmacion } from '@/componentes/ExplosionConfirmacion';
import { Icono } from '@/componentes/Icono';
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
        <Icono
          color={activa ? undefined : colores.linea}
          nombre="estrella"
          tamano="ilustracion"
        />
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
  const [yaCalificado, establecerYaCalificado] = useState<boolean | null>(null);
  const { boleto, resumen } = guardado;

  useEffect(() => {
    void leerOpiniones().then((lista) =>
      establecerYaCalificado(lista.some((o) => o.boletoId === boleto.id)),
    );
  }, [boleto.id]);

  if (yaCalificado === null || (yaCalificado && !enviada)) return null;

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
        <View style={estilos.chispas}>
          <ExplosionConfirmacion />
          <Icono nombre="confirmar" tamano="ilustracion" />
        </View>
        <Text
          accessibilityLiveRegion="polite"
          style={[
            tipografia.subtitulo,
            estilos.centrado,
            { color: colores.tinta },
          ]}
        >
          {t('calificarViaje.gracias')}
        </Text>
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
      <View style={estilos.estrellas}>
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
          <CampoTexto
            alCambiar={establecerComentario}
            etiqueta={t('opiniones.comentario')}
            marcador={t('opiniones.marcador')}
            valor={comentario}
          />
          <BotonAccion
            alPresionar={() => void enviar()}
            etiqueta={t('opiniones.enviar')}
          />
        </>
      )}
    </Bloque>
  );
}

const estilos = StyleSheet.create({
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
