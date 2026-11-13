import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BotonFavorito } from '@/componentes/BotonFavorito';
import { Bloque } from '@/componentes/Bloque';
import { DeslizarParaEmpezar } from '@/componentes/DeslizarParaEmpezar';
import { Icono } from '@/componentes/Icono';
import type { CorredorInterlocal } from '@/datos/corredores';
import { formatoHora, sufijoHora } from '@/datos/formato';
import { useFavoritos } from '@/datos/useFavoritos';
import { useResumenCorredor } from '@/datos/useResumenCorredor';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

/** duración compacta para una columna angosta: 1:23 (horas y minutos) */
function duracionCorta(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return `${horas}:${String(resto).padStart(2, '0')}`;
}

const CODIGOS = { Boaco: 'BOA', Juigalpa: 'JUI', Managua: 'MAN' } as const;

export interface PropiedadesPanelCorredor {
  alAbrir: (corredorId: string) => void;
  alInvertir: () => void;
  /** ancho útil para el control de deslizar */
  anchoControl: number;
  corredor: CorredorInterlocal;
}

function Extremo({ nombre }: { nombre: CorredorInterlocal['origen'] }) {
  const { colores } = useTema();
  return (
    <View style={estilos.extremo}>
      <View style={[estilos.codigo, { backgroundColor: colores.bloqueNegro }]}>
        <Text style={[tipografia.dato, { color: colores.ambar }]}>
          {CODIGOS[nombre]}
        </Text>
      </View>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        numberOfLines={1}
        style={[tipografia.subtitulo, { color: colores.tinta }]}
      >
        {nombre}
      </Text>
    </View>
  );
}

function Cifra({
  etiqueta,
  pie,
  valor,
}: {
  etiqueta: string;
  pie?: string;
  valor: string;
}) {
  const { colores } = useTema();
  return (
    <View style={estilos.cifra}>
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {etiqueta}
      </Text>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        numberOfLines={1}
        style={[tipografia.datoGrande, { color: colores.tinta }]}
      >
        {valor}
      </Text>
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {pie ?? ' '}
      </Text>
    </View>
  );
}

/**
 * el corredor elegido en la red, todo en dos mitades iguales: origen y destino enfrentados con el
 * botón de invertir al centro, tres cifras del mismo ancho y, al pie, el control de deslizar para abrirlo
 */
export function PanelCorredor({
  alAbrir,
  alInvertir,
  anchoControl,
  corredor,
}: PropiedadesPanelCorredor) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const { alternar, esFavorito } = useFavoritos();
  const resumen = useResumenCorredor(corredor);
  const entrada = useRef(new Animated.Value(1)).current;
  const giro = useRef(new Animated.Value(0)).current;
  const vueltas = useRef(0);
  const primera = useRef(true);

  // cada vez que cambia el corredor el panel se vuelve a asentar, y el botón gira
  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    if (reducido) return;
    entrada.setValue(0);
    Animated.timing(entrada, {
      duration: 380,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [corredor.id, entrada, reducido]);

  function invertir() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
      () => undefined,
    );
    if (!reducido) {
      vueltas.current += 1;
      Animated.timing(giro, {
        duration: 420,
        easing: Easing.out(Easing.back(1.4)),
        toValue: vueltas.current,
        useNativeDriver: true,
      }).start();
    }
    alInvertir();
  }

  const favorito = esFavorito(corredor.id);
  const etiquetaFavorito = rellenar(
    t(favorito ? 'rutas.quitarFavorita' : 'rutas.marcarFavorita').replace(
      /\{\{(\w+)\}\}/g,
      '{$1}',
    ),
    { destino: corredor.destino, origen: corredor.origen },
  );
  const proxima = resumen.proxima;
  const hora = proxima ? formatoHora(proxima.salida) : '—';
  const pieHora = proxima
    ? sufijoHora(proxima.salida)
    : t('rutas.sinSalidaCorta');

  return (
    <Animated.View
      style={{
        opacity: entrada,
        transform: [
          {
            translateY: entrada.interpolate({
              inputRange: [0, 1],
              outputRange: [14, 0],
            }),
          },
        ],
      }}
    >
      <Bloque estiloContenido={estilos.tarjeta}>
        <View style={estilos.fila}>
          <Extremo nombre={corredor.origen} />
          <View style={estilos.centro}>
            <Pressable
              accessibilityLabel={rellenar(t('rutas.cambiarSentido'), {
                destino: corredor.destino,
                origen: corredor.origen,
              })}
              accessibilityRole="button"
              hitSlop={8}
              onPress={invertir}
            >
              <Animated.View
                style={[
                  estilos.invertir,
                  {
                    backgroundColor: colores.bloqueNegro,
                    transform: [
                      {
                        rotate: giro.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '180deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Icono
                  color={colores.ambar}
                  nombre="siguiente"
                  tamano="mediano"
                />
                <View style={estilos.espejo}>
                  <Icono
                    color={colores.sobreNegro}
                    nombre="siguiente"
                    tamano="mediano"
                  />
                </View>
              </Animated.View>
            </Pressable>
          </View>
          <Extremo nombre={corredor.destino} />
        </View>

        {proxima && (
          <View style={[estilos.pildora, { backgroundColor: colores.ambar }]}>
            <Text style={[tipografia.etiqueta, { color: colores.sobreAmbar }]}>
              {rellenar(
                t('rutas.proximaSaleEn').replace(/\{\{(\w+)\}\}/g, '{$1}'),
                {
                  minutos: resumen.minutosParaSalir ?? 0,
                },
              )}
            </Text>
          </View>
        )}

        <View style={[estilos.regla, { backgroundColor: colores.linea }]} />

        <View style={estilos.fila}>
          <Cifra etiqueta={t('rutas.sale')} pie={pieHora} valor={hora} />
          <View style={[estilos.divisor, { backgroundColor: colores.linea }]} />
          <Cifra
            etiqueta={t('rutas.etaCorto')}
            pie={
              resumen.distanciaKm !== null
                ? `${Math.round(resumen.distanciaKm)} ${t('rutas.km')}`
                : undefined
            }
            valor={
              resumen.duracionMin !== null
                ? duracionCorta(resumen.duracionMin)
                : '—'
            }
          />
          <View style={[estilos.divisor, { backgroundColor: colores.linea }]} />
          <Cifra
            etiqueta={t('rutas.libres')}
            pie={resumen.libres !== null ? t('rutas.asientos') : undefined}
            valor={resumen.libres !== null ? String(resumen.libres) : '—'}
          />
        </View>

        <Text
          style={[
            tipografia.pequeno,
            estilos.nota,
            { color: colores.tintaSuave },
          ]}
        >
          {t('detalle.notaEta')}
        </Text>

        <DeslizarParaEmpezar
          accion={t('rutas.abrir')}
          alCompletar={() => alAbrir(corredor.id)}
          ancho={anchoControl}
          ayuda={t('rutas.deslizarAyuda')}
          etiqueta={t('rutas.deslizar')}
        />
        <View style={estilos.estrella}>
          <BotonFavorito
            activo={favorito}
            alCambiar={() => void alternar(corredor.id)}
            etiqueta={etiquetaFavorito}
          />
        </View>
      </Bloque>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  centro: { alignItems: 'center', justifyContent: 'center', width: 64 },
  cifra: { alignItems: 'center', flex: 1, gap: espacios.cuatro },
  codigo: {
    alignItems: 'center',
    borderRadius: radios.loseta,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  divisor: { alignSelf: 'stretch', width: 1 },
  espejo: { transform: [{ scaleX: -1 }] },
  estrella: { position: 'absolute', right: espacios.ocho, top: espacios.ocho },
  extremo: { alignItems: 'center', flex: 1, gap: espacios.ocho },
  fila: { alignItems: 'center', flexDirection: 'row' },
  invertir: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    gap: 2,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  nota: { textAlign: 'center' },
  pildora: {
    alignSelf: 'center',
    borderRadius: radios.pildora,
    paddingHorizontal: espacios.dieciseis,
    paddingVertical: espacios.ocho,
  },
  regla: { height: 1 },
  tarjeta: { gap: espacios.dieciseis, padding: espacios.lateral },
});
