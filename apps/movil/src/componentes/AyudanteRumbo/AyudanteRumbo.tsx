import { usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { armarContexto } from '@/datos/contextoIA';
import {
  DIFICULTAD_INICIAL,
  registrarSenal,
  type EstadoDificultad,
} from '@/datos/dificultad';
import {
  ayudaPorDefecto,
  descripcionDelApuro,
  esRespuestaUtil,
  nombreDePantalla,
  pantallaDeRuta,
} from '@/datos/ayudaDeRumbo';
import {
  instruccionesDeAyuda,
  limpiarRespuestaDeRumbo,
} from '@/datos/mascotaIA';
import { escucharSenales, type SenalDeAyuda } from '@/datos/senalesDeAyuda';
import { useBoletos } from '@/datos/useBoletos';
import { useConexion } from '@/datos/useConexion';
import { useIA } from '@/datos/useIA';
import { useMascota } from '@/datos/useMascota';
import { useSalidas } from '@/datos/useSalidas';
import { useSonidos } from '@/datos/useSonidos';
import { useSuscripcion } from '@/datos/useSuscripcion';
import { rumboUsaIA } from '@/servicios/beneficios';

import { GloboDeAyuda } from './GloboDeAyuda';
import { ANCHO_OJOS, OjosDeRumbo, type EstadoDeOjos } from './OjosDeRumbo';

/** cuánto se quedan los ojos asomados si nadie los toca */
export const SEGUNDOS_ASOMADO = 9;
/** cuánto se queda la ayuda a la vista */
export const SEGUNDOS_DE_AYUDA = 14;
/** cuánto se le espera a la IA antes de usar la ayuda escrita */
export const SEGUNDOS_DE_ESPERA_IA = 6;

type Fase = 'asomado' | 'hablando' | 'oculto' | 'pensando';

/**
 * Rumbo solo existe cuando hace falta, y de él solo se ven los ojos: si nota que la persona se está trabando (errores
 * repetidos, una reserva que falla, toques que no responden, sin señal) asoma por el borde derecho. Al tocarlo piensa un
 * momento y, con Apple Intelligence (o Gemini) y los datos reales de la persona, dice en un globo pequeño qué hacer en esa
 * pantalla; sin IA usa una ayuda escrita para el lugar. Si nadie lo atiende, se esconde y no insiste por un rato
 */
export function AyudanteRumbo() {
  const { activa } = useMascota();
  const ruta = usePathname();
  const { height } = useWindowDimensions();
  const sonar = useSonidos();
  const ia = useIA();
  const { plus } = useSuscripcion();
  const { enLinea } = useConexion();
  const { boletos } = useBoletos();
  const { ahora, salidas } = useSalidas();

  const [fase, establecerFase] = useState<Fase>('oculto');
  const [texto, establecerTexto] = useState('');
  const detector = useRef<EstadoDificultad>(DIFICULTAD_INICIAL);
  const motivo = useRef<SenalDeAyuda>('errorFormulario');
  const pantalla = useRef(pantallaDeRuta(ruta));
  pantalla.current = pantallaDeRuta(ruta);

  // en la portada de inicio no sale: ahí nadie está trabado todavía
  const permitido = activa && ruta !== '/';
  const yOjos = Math.round(height * 0.58);

  function alimentar(senal: SenalDeAyuda) {
    const r = registrarSenal(detector.current, senal, Date.now());
    detector.current = r.estado;
    if (r.asomar) {
      motivo.current = r.asomar;
      establecerFase((actual) => (actual === 'oculto' ? 'asomado' : actual));
    }
  }

  useEffect(() => {
    if (!permitido) return;
    return escucharSenales(alimentar);
  }, [permitido]);

  const estabaEnLinea = useRef(enLinea);
  useEffect(() => {
    if (estabaEnLinea.current === enLinea) return;
    estabaEnLinea.current = enLinea;
    if (permitido && !enLinea) alimentar('sinConexion');
  }, [enLinea, permitido]);

  // si nadie atiende los ojos, se esconden solos; la ayuda también se va sola
  useEffect(() => {
    if (fase !== 'asomado' && fase !== 'hablando') return;
    const espera = setTimeout(
      () => establecerFase('oculto'),
      (fase === 'asomado' ? SEGUNDOS_ASOMADO : SEGUNDOS_DE_AYUDA) * 1000,
    );
    return () => clearTimeout(espera);
  }, [fase, texto]);

  useEffect(() => {
    if (!permitido) establecerFase('oculto');
  }, [permitido]);

  /** al tocar los ojos: piensa un momento con la IA del teléfono y dice qué hacer; si no puede, usa la ayuda escrita del lugar */
  async function ayudar() {
    sonar('mascotaHola');
    const escrita = ayudaPorDefecto(motivo.current, pantalla.current);
    if (!ia.usable || !rumboUsaIA(plus)) {
      establecerTexto(escrita);
      establecerFase('hablando');
      return;
    }
    establecerFase('pensando');
    try {
      const respuesta = await Promise.race([
        ia.preguntar(
          instruccionesDeAyuda({
            apuro: descripcionDelApuro(motivo.current),
            datos: armarContexto(salidas, boletos, ahora),
            pantalla: nombreDePantalla(pantalla.current),
          }),
          'Dame la ayuda.',
        ),
        new Promise<string>((_, rechazar) =>
          setTimeout(
            () => rechazar(new Error('espera')),
            SEGUNDOS_DE_ESPERA_IA * 1000,
          ),
        ),
      ]);
      const limpia = limpiarRespuestaDeRumbo(respuesta);
      establecerTexto(esRespuestaUtil(limpia) ? limpia : escrita);
    } catch {
      establecerTexto(escrita);
    }
    establecerFase('hablando');
  }

  if (!permitido || fase === 'oculto') return null;

  const estado: EstadoDeOjos =
    fase === 'pensando' ? 'pensando' : fase === 'hablando' ? 'habla' : 'espera';

  return (
    <View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, estilos.capa]}
      testID="ayudante-rumbo"
    >
      {fase === 'hablando' ? (
        <GloboDeAyuda
          alToque={() => establecerFase('oculto')}
          derecha={ANCHO_OJOS + 16}
          texto={texto}
          y={yOjos - 6}
        />
      ) : null}
      <OjosDeRumbo
        alToque={() => {
          if (fase === 'asomado') void ayudar();
          else if (fase === 'hablando') establecerFase('oculto');
        }}
        estado={estado}
        y={yOjos}
      />
    </View>
  );
}

const estilos = StyleSheet.create({ capa: { zIndex: 40 } });
