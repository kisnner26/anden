import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BoletoFlotante } from '@/componentes/BoletoFlotante';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { ExplosionConfirmacion } from '@/componentes/ExplosionConfirmacion';
import type { BoletoGuardado } from '@/datos/reserva';
import {
  codigoCompleto,
  LARGO_CODIGO,
  normalizarCodigo,
  type ErrorReclamo,
} from '@/datos/transferencia';
import { useBoletos } from '@/datos/useBoletos';
import { useSensaciones } from '@/datos/useSensaciones';
import { reclamarTransferencia } from '@/servicios/supabase/transferenciasSupabase';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesRecibir {
  alVerBoleto: (boletoId: string) => void;
  alVolver: () => void;
  /** el código que vino en el enlace anden://recibir?codigo= */
  codigoInicial?: string;
}

/** canjear el código que te pasó otra persona: el boleto cae en tu lista con un resorte */
export function Recibir({
  alVerBoleto,
  alVolver,
  codigoInicial = '',
}: PropiedadesRecibir) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const reducido = useMovimientoReducido();
  const sentir = useSensaciones();
  const { agregar } = useBoletos();
  const [codigo, establecerCodigo] = useState(normalizarCodigo(codigoInicial));
  const [error, establecerError] = useState<ErrorReclamo | null>(null);
  const [trabajando, establecerTrabajando] = useState(false);
  const [recibido, establecerRecibido] = useState<BoletoGuardado | null>(null);
  const caida = useRef(new Animated.Value(reducido ? 1 : 0)).current;
  const enCurso = useRef(false);

  async function canjear(valor: string) {
    if (enCurso.current) return;
    enCurso.current = true;
    establecerTrabajando(true);
    establecerError(null);
    const respuesta = await reclamarTransferencia(valor);
    if ('error' in respuesta) {
      sentir('error');
      establecerError(respuesta.error);
    } else {
      await agregar(respuesta.boleto);
      sentir('exito');
      establecerRecibido(respuesta.boleto);
    }
    establecerTrabajando(false);
    enCurso.current = false;
  }

  // al completar las ocho letras se canjea solo
  useEffect(() => {
    if (codigoCompleto(codigo) && !recibido && error === null)
      void canjear(codigo);
  }, [codigo]);

  useEffect(() => {
    if (!recibido || reducido) return;
    Animated.spring(caida, {
      friction: 6,
      tension: 90,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [caida, recibido, reducido]);

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: espacios.cuarentaYOcho,
          paddingTop: margenes.top + espacios.ocho,
        },
      ]}
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colores.fondo }}
    >
      <CabeceraPantalla alVolver={alVolver} titulo={t('recibir.titulo')} />
      {recibido ? (
        <>
          <View style={estilos.escenario}>
            <Animated.View
              style={{
                opacity: caida,
                transform: [
                  {
                    translateY: caida.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-420, 0],
                    }),
                  },
                  {
                    rotate: caida.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['12deg', '0deg'],
                    }),
                  },
                ],
              }}
            >
              <BoletoFlotante guardado={recibido} />
            </Animated.View>
            <View pointerEvents="none" style={estilos.chispas}>
              <ExplosionConfirmacion />
            </View>
          </View>
          <Text
            style={[
              tipografia.titulo,
              estilos.centrado,
              { color: colores.tinta },
            ]}
          >
            {t('recibir.ahoraEsTuyo')}
          </Text>
          <BotonAccion
            alPresionar={() => alVerBoleto(recibido.boleto.id)}
            etiqueta={t('recibir.verBoleto')}
          />
        </>
      ) : (
        <>
          <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
            {t('recibir.codigoAyuda')}
          </Text>
          <TextInput
            accessibilityLabel={t('recibir.campo')}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!trabajando}
            maxLength={LARGO_CODIGO + 1}
            onChangeText={(texto) => {
              establecerError(null);
              establecerCodigo(normalizarCodigo(texto));
            }}
            style={[
              tipografia.display,
              estilos.campo,
              {
                borderColor: error ? colores.cancelado : colores.linea,
                color: colores.tinta,
              },
            ]}
            value={codigo}
          />
          {error ? (
            <Text
              accessibilityLiveRegion="polite"
              accessibilityRole="alert"
              style={[tipografia.cuerpo, { color: colores.cancelado }]}
            >
              {t(`recibir.error.${error}`)}
            </Text>
          ) : null}
          <BotonAccion
            alPresionar={() => void canjear(codigo)}
            deshabilitado={!codigoCompleto(codigo) || trabajando}
            etiqueta={t('recibir.accion')}
          />
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  campo: {
    borderRadius: radios.casilla,
    borderWidth: 1,
    letterSpacing: 6,
    paddingHorizontal: espacios.dieciseis,
    paddingVertical: espacios.dieciseis,
    textAlign: 'center',
  },
  centrado: { textAlign: 'center' },
  chispas: {
    alignItems: 'center',
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
  },
  contenido: {
    gap: espacios.veinticuatro,
    paddingHorizontal: espacios.lateral,
  },
  escenario: { justifyContent: 'center', minHeight: 230 },
});
