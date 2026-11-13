import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { avanceDeGuia, type PasoDeGuia } from '@/datos/guiaConductor';
import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

const CLAVE_GUIA_CERRADA = 'anden.guiaConductorCerrada';

export interface PropiedadesGuiaConductor {
  pasos: readonly PasoDeGuia[];
}

/** primeros pasos para quien empieza como conductor: se va marcando sola y se puede cerrar cuando ya no hace falta */
export function GuiaConductor({ pasos }: PropiedadesGuiaConductor) {
  const { colores } = useTema();
  const reducir = useMovimientoReducido();
  const avance = useRef(new Animated.Value(0)).current;
  const [cerrada, establecerCerrada] = useState<boolean | null>(null);
  const progreso = avanceDeGuia(pasos);

  useEffect(() => {
    void AsyncStorage.getItem(CLAVE_GUIA_CERRADA)
      .then((valor) => establecerCerrada(valor === '1'))
      .catch(() => establecerCerrada(false));
  }, []);

  useEffect(() => {
    if (reducir) {
      avance.setValue(progreso);
      return;
    }
    Animated.timing(avance, {
      duration: movimiento.crecimientoBarra,
      easing: Easing.out(Easing.cubic),
      toValue: progreso,
      useNativeDriver: false,
    }).start();
  }, [avance, progreso, reducir]);

  if (cerrada !== false) return null;

  return (
    <Bloque estiloContenido={estilos.tarjeta}>
      <View style={estilos.cabecera}>
        <Text
          style={[
            tipografia.subtitulo,
            estilos.titulo,
            { color: colores.tinta },
          ]}
        >
          {t('guiaConductor.titulo')}
        </Text>
        <Pressable
          accessibilityLabel={t('guiaConductor.cerrar')}
          accessibilityRole="button"
          onPress={() => {
            establecerCerrada(true);
            void AsyncStorage.setItem(CLAVE_GUIA_CERRADA, '1');
          }}
          style={estilos.cerrar}
        >
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('guiaConductor.cerrar')}
          </Text>
        </Pressable>
      </View>
      <View style={[estilos.pista, { backgroundColor: colores.linea }]}>
        <Animated.View
          style={[
            estilos.relleno,
            {
              backgroundColor: colores.ambar,
              width: avance.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {rellenar(t('guiaConductor.avance'), {
          hechos: pasos.filter((paso) => paso.hecho).length,
          total: pasos.length,
        })}
      </Text>
      {pasos.map((paso) => (
        <View key={paso.clave} style={estilos.fila}>
          <View
            style={[
              estilos.marca,
              paso.hecho
                ? { backgroundColor: colores.aTiempo }
                : { borderColor: colores.linea, borderWidth: 2 },
            ]}
          >
            {paso.hecho && (
              <Icono
                color={colores.sobreNegro}
                nombre="confirmar"
                tamano="pequeno"
              />
            )}
          </View>
          <View style={estilos.texto}>
            <Text
              style={[
                tipografia.nombreFila,
                {
                  color: paso.hecho ? colores.tintaSuave : colores.tinta,
                  textDecorationLine: paso.hecho ? 'line-through' : 'none',
                },
              ]}
            >
              {t(`guiaConductor.${paso.clave}`)}
            </Text>
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {t(`guiaConductor.${paso.clave}Detalle`)}
            </Text>
          </View>
        </View>
      ))}
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  cabecera: { alignItems: 'center', flexDirection: 'row', gap: espacios.doce },
  cerrar: { justifyContent: 'center', minHeight: tamanosControl.toqueMinimo },
  fila: { alignItems: 'center', flexDirection: 'row', gap: espacios.doce },
  marca: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  pista: { borderRadius: radios.pildora, height: 6, overflow: 'hidden' },
  relleno: { borderRadius: radios.pildora, height: 6 },
  tarjeta: { gap: espacios.ocho, padding: espacios.dieciseis },
  texto: { flex: 1, gap: 2 },
  titulo: { flex: 1 },
});
