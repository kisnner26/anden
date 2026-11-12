import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BloqueNegro } from '@/componentes/BloqueNegro';
import { ExplosionConfirmacion } from '@/componentes/ExplosionConfirmacion';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { reproducirSonido } from '@/datos/sonidos';
import { espacios, tamanosIlustracion } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesReservaConfirmada {
  codigo: string;
}

/** confirmación breve antes de volver a la pestaña que ya contiene el boleto */
export function ReservaConfirmada({ codigo }: PropiedadesReservaConfirmada) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const reducirMovimiento = useReducedMotion();
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
    <View
      accessibilityLabel={`${t('pago.confirmadaTitulo')}. ${t('pago.codigoAbordaje')}: ${codigo}. ${t('pago.abriendoBoletos')}`}
      accessibilityLiveRegion="assertive"
      accessible
      style={[
        estilos.pantalla,
        {
          backgroundColor: colores.fondo,
          paddingBottom: margenes.bottom + espacios.veinticuatro,
          paddingTop: margenes.top + espacios.veinticuatro,
        },
      ]}
    >
      <View style={estilos.contenido}>
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
        <View style={estilos.textos}>
          <Text style={[tipografia.display, { color: colores.tinta }]}>
            {t('pago.confirmadaTitulo')}
            <Text style={{ color: colores.ambarTitular }}>.</Text>
          </Text>
          <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
            {t('pago.confirmadaDetalle')}
          </Text>
        </View>
        <BloqueNegro estiloContenido={estilos.codigo}>
          <Text
            style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
          >
            {t('pago.codigoAbordaje')}
          </Text>
          <Text
            selectable
            style={[tipografia.datoGrande, { color: colores.ambar }]}
          >
            {codigo}
          </Text>
        </BloqueNegro>
      </View>
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {t('pago.abriendoBoletos')}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  codigo: { gap: espacios.ocho, padding: espacios.veinticuatro },
  contenido: {
    alignItems: 'stretch',
    gap: espacios.veinticuatro,
    width: '100%',
  },
  insignia: {
    alignItems: 'center',
    height: tamanosIlustracion.confirmacionReserva,
    justifyContent: 'center',
  },
  pantalla: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: espacios.lateral,
  },
  textos: { gap: espacios.ocho },
});
