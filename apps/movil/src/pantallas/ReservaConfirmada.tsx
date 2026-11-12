import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aparece } from '@/componentes/Aparece';
import { BotonAccion } from '@/componentes/BotonAccion';
import { ExplosionConfirmacion } from '@/componentes/ExplosionConfirmacion';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { PieReserva } from '@/componentes/PieReserva';
import { TalonBoleto } from '@/componentes/TalonBoleto';
import { reproducirSonido } from '@/datos/sonidos';
import { useBoletos } from '@/datos/useBoletos';
import {
  disposicionPantalla,
  espacios,
  radios,
  tamanosControl,
  tamanosIlustracion,
} from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesReservaConfirmada {
  /** abre el boleto completo */
  alVerBoleto?: () => void;
  /** vuelve a la lista de boletos */
  alListo?: () => void;
  boletoId?: string;
  codigo: string;
}

/** la reserva quedó lista: celebración, el pase de abordar a la vista y una salida clara; no se cierra sola */
export function ReservaConfirmada({
  alListo,
  alVerBoleto,
  boletoId,
  codigo,
}: PropiedadesReservaConfirmada) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const reducirMovimiento = useMovimientoReducido();
  const { boletos } = useBoletos();
  const guardado = boletos.find(({ boleto }) => boleto.id === boletoId);
  const entrada = useSharedValue(
    reducirMovimiento ? 1 : movimiento.escalaConfirmacion,
  );
  const estiloEntrada = useAnimatedStyle(() => ({
    transform: [{ scale: entrada.value }],
  }));

  useEffect(() => {
    if (reducirMovimiento) {
      entrada.value = 1;
      return;
    }
    entrada.value = withSpring(1, { damping: 7, stiffness: 120 });
  }, [entrada, reducirMovimiento]);

  // al llegar la confirmación: vibración de éxito y el sello sonoro
  useEffect(() => {
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => undefined);
    void reproducirSonido('confirmacion');
  }, []);

  return (
    <View style={[estilos.pantalla, { backgroundColor: colores.fondo }]}>
      <ScrollView
        contentContainerStyle={[
          estilos.contenido,
          {
            paddingBottom: margenes.bottom + disposicionPantalla.espacioPie,
            paddingTop: margenes.top + espacios.veinticuatro,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          accessibilityLabel={`${t('pago.confirmadaTitulo')}. ${t('pago.codigoAbordaje')}: ${codigo}`}
          accessibilityLiveRegion="assertive"
          accessible
          style={estilos.encabezado}
        >
          <View style={estilos.insignia}>
            <ExplosionConfirmacion />
            <Animated.View style={estiloEntrada}>
              <Loseta
                tamano={tamanosIlustracion.confirmacionReserva}
                variante="ambar"
              >
                <Icono
                  color={colores.sobreAmbar}
                  nombre="confirmar"
                  tamano="ilustracion"
                />
              </Loseta>
            </Animated.View>
          </View>
          <Aparece indice={2}>
            <Text style={[tipografia.display, { color: colores.tinta }]}>
              {t('pago.confirmadaTitulo')}.
            </Text>
          </Aparece>
          <Aparece indice={3}>
            <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
              {t('pago.confirmadaDetalle')}
            </Text>
          </Aparece>
        </View>

        {guardado ? (
          <Aparece indice={5}>
            <TalonBoleto guardado={guardado} />
          </Aparece>
        ) : (
          <Aparece indice={5}>
            <View
              style={[estilos.codigo, { backgroundColor: colores.bloqueNegro }]}
            >
              <Text
                style={[
                  tipografia.etiqueta,
                  { color: colores.sobreNegroSuave },
                ]}
              >
                {t('pago.codigoAbordaje')}
              </Text>
              <Text
                selectable
                style={[tipografia.datoGrande, { color: colores.ambar }]}
              >
                {codigo}
              </Text>
            </View>
          </Aparece>
        )}

        <Aparece indice={6}>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('pago.confirmadaNota')}
          </Text>
        </Aparece>
      </ScrollView>

      <PieReserva estiloContenido={estilos.pie}>
        <BotonAccion
          alPresionar={() => alVerBoleto?.()}
          etiqueta={t('pago.verBoleto')}
          icono="boleto"
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => alListo?.()}
          style={estilos.listo}
        >
          <Text style={[tipografia.subtitulo, { color: colores.sobreNegro }]}>
            {t('pago.listo')}
          </Text>
        </Pressable>
      </PieReserva>
    </View>
  );
}

const estilos = StyleSheet.create({
  codigo: {
    borderRadius: radios.bloque,
    gap: espacios.ocho,
    padding: espacios.veinticuatro,
  },
  contenido: {
    gap: espacios.veinticuatro,
    paddingHorizontal: espacios.lateral,
  },
  encabezado: { gap: espacios.ocho },
  insignia: {
    alignItems: 'center',
    height: tamanosIlustracion.confirmacionReserva,
    justifyContent: 'center',
  },
  listo: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
    paddingHorizontal: espacios.dieciseis,
  },
  pantalla: { flex: 1 },
  pie: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'space-between',
    paddingHorizontal: espacios.veinticuatro,
    paddingVertical: espacios.dieciseis,
  },
});
