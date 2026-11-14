import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BoletoFlotante } from '@/componentes/BoletoFlotante';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { EstadoVacio } from '@/componentes/EstadoVacio';
import { ExplosionConfirmacion } from '@/componentes/ExplosionConfirmacion';
import { Presionable } from '@/componentes/Presionable';
import { formatoHoraCompleta } from '@/datos/formato';
import { reproducirSonido } from '@/datos/sonidos';
import {
  codigoLegible,
  mensajeDeTransferencia,
  MINUTOS_DE_OFERTA,
} from '@/datos/transferencia';
import { useBoletos } from '@/datos/useBoletos';
import { useSensaciones } from '@/datos/useSensaciones';
import {
  cancelarTransferencia,
  crearTransferencia,
  leerEstadoDeTransferencia,
} from '@/servicios/supabase/transferenciasSupabase';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

/** cada cuánto se pregunta si ya lo recibieron */
export const CADA_CUANTO_MS = 2500;

type Fase = 'fallo' | 'preparando' | 'esperando' | 'recibido' | 'vencida';

export interface PropiedadesTransferir {
  alTerminar?: () => void;
  alVolver: () => void;
  boletoId: string;
}

/** una letra del código que aparece con un resorte, una tras otra */
function LetraDelCodigo({ indice, letra }: { indice: number; letra: string }) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const entrada = useRef(new Animated.Value(reducido ? 1 : 0)).current;

  useEffect(() => {
    if (reducido) return;
    Animated.spring(entrada, {
      delay: indice * 90,
      friction: 5,
      tension: 140,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [entrada, indice, reducido]);

  return (
    <Animated.View
      style={[
        estilos.casilla,
        {
          backgroundColor: conAlfa(colores.tinta, 0.07),
          borderColor: colores.linea,
          opacity: entrada,
          transform: [
            {
              scale: entrada.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
            },
            {
              translateY: entrada.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={[tipografia.display, { color: colores.tinta }]}>
        {letra}
      </Text>
    </Animated.View>
  );
}

/** ondas que salen del boleto hacia afuera mientras espera, como buscando al otro teléfono */
function Ondas() {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const avances = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (reducido) return;
    const bucles = avances.map((avance, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 800),
          Animated.timing(avance, {
            duration: 2400,
            easing: Easing.out(Easing.quad),
            toValue: 1,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    bucles.forEach((b) => b.start());
    return () => bucles.forEach((b) => b.stop());
  }, [avances, reducido]);

  return (
    <View pointerEvents="none" style={estilos.ondas}>
      {avances.map((avance, i) => (
        <Animated.View
          key={i}
          style={[
            estilos.onda,
            {
              borderColor: colores.ambar,
              opacity: avance.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 0],
              }),
              transform: [
                {
                  scale: avance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 2.4],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

/**
 * pasar un boleto vigente a otra persona: se genera un código que vale 30 minutos y se comparte con el menú
 * del sistema (AirDrop, Quick Share, mensajes) o se dicta en persona. Cuando la otra persona lo canjea, el
 * boleto vuela hacia arriba con chispas y sale de este teléfono
 */
export function Transferir({
  alTerminar,
  alVolver,
  boletoId,
}: PropiedadesTransferir) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const reducido = useMovimientoReducido();
  const sentir = useSensaciones();
  const { boletos, quitar } = useBoletos();
  const guardado = boletos.find(({ boleto }) => boleto.id === boletoId);
  const [fase, establecerFase] = useState<Fase>('preparando');
  const [codigo, establecerCodigo] = useState('');
  const [nombre, establecerNombre] = useState('');
  const [segundos, establecerSegundos] = useState(MINUTOS_DE_OFERTA * 60);
  const vuelo = useRef(new Animated.Value(0)).current;
  const terminando = useRef(false);

  const preparar = useCallback(async () => {
    establecerFase('preparando');
    const nuevo = await crearTransferencia(boletoId);
    if (nuevo === null) {
      establecerFase('fallo');
      return;
    }
    establecerCodigo(nuevo);
    establecerSegundos(MINUTOS_DE_OFERTA * 60);
    establecerFase('esperando');
  }, [boletoId]);

  useEffect(() => {
    void preparar();
  }, [preparar]);

  // pregunta cada tanto si ya lo recibieron
  useEffect(() => {
    if (fase !== 'esperando' || codigo === '') return;
    const sondeo = setInterval(() => {
      void leerEstadoDeTransferencia(codigo).then((oferta) => {
        if (!oferta || terminando.current) return;
        if (oferta.estado === 'reclamada') {
          terminando.current = true;
          establecerNombre(oferta.paraNombre);
          establecerFase('recibido');
        } else if (
          oferta.estado === 'vencida' ||
          oferta.estado === 'cancelada'
        ) {
          establecerFase('vencida');
        }
      });
    }, CADA_CUANTO_MS);
    return () => clearInterval(sondeo);
  }, [codigo, fase]);

  // la cuenta regresiva de la oferta
  useEffect(() => {
    if (fase !== 'esperando') return;
    const reloj = setInterval(() => {
      establecerSegundos((s) => {
        if (s <= 1) {
          establecerFase('vencida');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(reloj);
  }, [fase]);

  // el vuelo: el boleto sale hacia arriba, gira un poco y se desvanece; después el boleto sale de este teléfono
  useEffect(() => {
    if (fase !== 'recibido') return;
    sentir('exito');
    void reproducirSonido('envio');
    const terminar = () => {
      void quitar(boletoId);
      setTimeout(() => alTerminar?.(), reducido ? 0 : 1600);
    };
    if (reducido) {
      vuelo.setValue(1);
      terminar();
      return;
    }
    Animated.timing(vuelo, {
      duration: 1100,
      easing: Easing.in(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    }).start(terminar);
  }, [alTerminar, boletoId, fase, quitar, reducido, sentir, vuelo]);

  async function compartir() {
    if (!guardado || codigo === '') return;
    await Share.share({
      message: mensajeDeTransferencia({
        codigo,
        destino: guardado.resumen.destino,
        salida: formatoHoraCompleta(new Date(guardado.resumen.salida)),
      }),
    });
  }

  async function cancelar() {
    if (codigo !== '') await cancelarTransferencia(codigo);
    alVolver();
  }

  const minutosRestantes = Math.ceil(segundos / 60);

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: espacios.cuarentaYOcho,
          paddingTop: margenes.top + espacios.ocho,
        },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <CabeceraPantalla alVolver={alVolver} titulo={t('transferir.titulo')} />

      {!guardado ? (
        <EstadoVacio tipo="error" titulo={t('boleto.noExiste')} />
      ) : fase === 'fallo' ? (
        <View style={estilos.centro}>
          <EstadoVacio tipo="error" titulo={t('transferir.ofertaFallo')} />
          <BotonAccion
            alPresionar={() => void preparar()}
            etiqueta={t('transferir.reintentar')}
          />
        </View>
      ) : (
        <>
          <View style={estilos.escenario}>
            {fase === 'esperando' || fase === 'preparando' ? <Ondas /> : null}
            <Animated.View
              style={{
                opacity: vuelo.interpolate({
                  inputRange: [0, 0.8, 1],
                  outputRange: [1, 0.9, 0],
                }),
                transform: [
                  {
                    translateY: vuelo.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -520],
                    }),
                  },
                  {
                    rotate: vuelo.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '-14deg'],
                    }),
                  },
                  {
                    scale: vuelo.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.55],
                    }),
                  },
                ],
              }}
            >
              <BoletoFlotante guardado={guardado} />
            </Animated.View>
            {fase === 'recibido' ? (
              <View pointerEvents="none" style={estilos.chispas}>
                <ExplosionConfirmacion />
              </View>
            ) : null}
          </View>

          {fase === 'recibido' ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[
                tipografia.titulo,
                estilos.centrado,
                { color: colores.tinta },
              ]}
            >
              {nombre
                ? rellenar(t('transferir.recibido'), { nombre })
                : t('transferir.recibidoSinNombre')}
            </Text>
          ) : fase === 'vencida' ? (
            <View style={estilos.centro}>
              <Text
                style={[
                  tipografia.cuerpo,
                  estilos.centrado,
                  { color: colores.tintaSuave },
                ]}
              >
                {t('transferir.vencida')}
              </Text>
              <BotonAccion
                alPresionar={() => void preparar()}
                etiqueta={t('transferir.reintentar')}
              />
            </View>
          ) : (
            <>
              <Text
                style={[
                  tipografia.etiqueta,
                  estilos.centrado,
                  { color: colores.tintaSuave },
                ]}
              >
                {t('transferir.codigo')}
              </Text>
              <View
                accessibilityLabel={`${t('transferir.codigo')} ${codigoLegible(codigo)}`}
                accessible
                style={estilos.codigo}
              >
                {codigo.split('').map((letra, i) => (
                  <View
                    key={`${letra}${i}`}
                    style={i === 4 ? estilos.separado : undefined}
                  >
                    <LetraDelCodigo indice={i} letra={letra} />
                  </View>
                ))}
              </View>
              <View style={estilos.expira}>
                <View
                  style={[estilos.pista, { backgroundColor: colores.linea }]}
                >
                  <View
                    style={[
                      estilos.relleno,
                      {
                        backgroundColor: colores.ambar,
                        width: `${Math.round((segundos / (MINUTOS_DE_OFERTA * 60)) * 100)}%`,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
                >
                  {rellenar(t('transferir.expira'), {
                    minutos: minutosRestantes,
                  })}
                </Text>
              </View>
              <BotonAccion
                alPresionar={() => void compartir()}
                deshabilitado={codigo === ''}
                etiqueta={t('transferir.compartir')}
              />
              <Text
                style={[
                  tipografia.pequeno,
                  estilos.centrado,
                  { color: colores.tintaSuave },
                ]}
              >
                {t('transferir.enPersona')}
              </Text>
              <Presionable
                accessibilityRole="button"
                onPress={() => void cancelar()}
                style={estilos.cancelar}
              >
                <Text
                  style={[tipografia.pequeno, { color: colores.cancelado }]}
                >
                  {t('transferir.cancelar')}
                </Text>
              </Presionable>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  cancelar: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  casilla: {
    alignItems: 'center',
    borderRadius: radios.casilla,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 34,
  },
  centrado: { textAlign: 'center' },
  centro: { alignItems: 'stretch', gap: espacios.dieciseis },
  chispas: {
    alignItems: 'center',
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
  },
  codigo: {
    flexDirection: 'row',
    gap: espacios.cuatro,
    justifyContent: 'center',
  },
  contenido: {
    gap: espacios.veinticuatro,
    paddingHorizontal: espacios.lateral,
  },
  escenario: { justifyContent: 'center', minHeight: 230 },
  expira: { alignItems: 'center', gap: espacios.ocho },
  onda: {
    borderRadius: 999,
    borderWidth: 2,
    height: 180,
    position: 'absolute',
    width: 180,
  },
  ondas: {
    alignItems: 'center',
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
  },
  pista: { borderRadius: 3, height: 5, overflow: 'hidden', width: '70%' },
  relleno: { height: 5 },
  separado: { marginLeft: espacios.ocho },
});
