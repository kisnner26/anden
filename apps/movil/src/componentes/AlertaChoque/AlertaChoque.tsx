import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  NUMERO_EMERGENCIA,
  SEGUNDOS_PARA_CONFIRMAR,
} from '@/datos/deteccionChoque';
import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export type FaseAlerta =
  | { tipo: 'ninguna' }
  | { restantes: number; tipo: 'pregunta' }
  | { tipo: 'enviando' }
  | { conContacto: boolean; enServidor: boolean; tipo: 'enviada' };

export interface PropiedadesAlertaChoque {
  alAvisarYa: () => void;
  alEstoyBien: () => void;
  alLlamar: () => void;
  fase: FaseAlerta;
}

/** pantalla completa que pregunta si la persona está bien tras un posible choque y cuenta hacia atrás */
export function AlertaChoque({
  alAvisarYa,
  alEstoyBien,
  alLlamar,
  fase,
}: PropiedadesAlertaChoque) {
  const margenes = useSafeAreaInsets();
  const reducir = useMovimientoReducido();
  const pulso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducir || fase.tipo !== 'pregunta') return;
    const animacion = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, {
          duration: 450,
          easing: Easing.inOut(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulso, {
          duration: 450,
          easing: Easing.inOut(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    animacion.start();
    return () => animacion.stop();
  }, [fase.tipo, pulso, reducir]);

  if (fase.tipo === 'ninguna') return null;
  const restantes = fase.tipo === 'pregunta' ? fase.restantes : 0;

  return (
    <Modal animationType="fade" presentationStyle="fullScreen" visible>
      <View
        accessibilityViewIsModal
        style={[
          estilos.fondo,
          {
            paddingBottom: margenes.bottom + espacios.veinticuatro,
            paddingTop: margenes.top + espacios.veinticuatro,
          },
        ]}
      >
        {fase.tipo === 'pregunta' && (
          <>
            <Text style={[tipografia.etiqueta, estilos.pequeno]}>
              {t('seguridad.detectamos')}
            </Text>
            <Text
              accessibilityLiveRegion="assertive"
              style={[tipografia.display, estilos.titulo]}
            >
              {t('seguridad.estasBien')}
            </Text>
            <Animated.View
              style={[
                estilos.cuenta,
                {
                  transform: [
                    {
                      scale: pulso.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.08],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={[tipografia.display, estilos.numero]}>
                {restantes}
              </Text>
            </Animated.View>
            <Text style={[tipografia.cuerpo, estilos.detalle]}>
              {rellenar(t('seguridad.avisaremos'), {
                segundos: SEGUNDOS_PARA_CONFIRMAR,
              })}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={alEstoyBien}
              style={[estilos.boton, estilos.botonBien]}
            >
              <Text style={[tipografia.subtitulo, estilos.textoBien]}>
                {t('seguridad.estoyBien')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={alAvisarYa}
              style={estilos.secundario}
            >
              <Text style={[tipografia.subtitulo, estilos.textoClaro]}>
                {t('seguridad.avisarYa')}
              </Text>
            </Pressable>
          </>
        )}
        {fase.tipo === 'enviando' && (
          <Text
            accessibilityLiveRegion="polite"
            style={[tipografia.titulo, estilos.titulo]}
          >
            {t('seguridad.enviando')}
          </Text>
        )}
        {fase.tipo === 'enviada' && (
          <>
            <Text
              accessibilityLiveRegion="assertive"
              style={[tipografia.titulo, estilos.titulo]}
            >
              {t('seguridad.enviada')}
            </Text>
            <Text style={[tipografia.cuerpo, estilos.detalle]}>
              {fase.conContacto
                ? t('seguridad.contactoAvisado')
                : t('seguridad.sinContacto')}
            </Text>
            <Text style={[tipografia.cuerpo, estilos.detalle]}>
              {fase.enServidor
                ? t('seguridad.cooperativaAvisada')
                : t('seguridad.cooperativaNoLlego')}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={alLlamar}
              style={[estilos.boton, estilos.botonBien]}
            >
              <Text style={[tipografia.subtitulo, estilos.textoBien]}>
                {rellenar(t('seguridad.llamar'), { numero: NUMERO_EMERGENCIA })}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={alEstoyBien}
              style={estilos.secundario}
            >
              <Text style={[tipografia.subtitulo, estilos.textoClaro]}>
                {t('seguridad.cerrar')}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </Modal>
  );
}

const ROJO_ALERTA = 'rgb(176,38,32)';
const estilos = StyleSheet.create({
  boton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: radios.pildora,
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo + 12,
  },
  botonBien: { backgroundColor: 'rgb(255,255,255)' },
  cuenta: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: 999,
    borderWidth: 4,
    height: 150,
    justifyContent: 'center',
    width: 150,
  },
  detalle: { color: 'rgba(255,255,255,0.92)', textAlign: 'center' },
  fondo: {
    alignItems: 'center',
    backgroundColor: ROJO_ALERTA,
    flex: 1,
    gap: espacios.dieciseis,
    justifyContent: 'center',
    paddingHorizontal: espacios.lateral,
  },
  numero: { color: 'rgb(255,255,255)' },
  pequeno: { color: 'rgba(255,255,255,0.85)' },
  secundario: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
  },
  textoBien: { color: ROJO_ALERTA },
  textoClaro: { color: 'rgb(255,255,255)' },
  titulo: { color: 'rgb(255,255,255)', textAlign: 'center' },
});
