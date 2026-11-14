import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { BarridoDeLuz } from '@/componentes/BarridoDeLuz';
import { FotoDestino } from '@/componentes/FotoDestino';
import { minutosHastaSalida } from '@/datos/estadoBoleto';
import { progresoHaciaSalida } from '@/datos/progresoBoleto';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import {
  formatoDuracion,
  formatoFechaCorta,
  formatoHoraCompleta,
} from '@/datos/formato';
import type { BoletoGuardado } from '@/datos/reserva';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';
import { puntoCorto } from '@/datos/puntoEncuentro';

export interface PropiedadesTarjetaBoleto {
  ahora: Date;
  alPresionar: (boletoId: string) => void;
  ancho: number;
  guardado: BoletoGuardado;
  /** un viaje ya hecho: en lugar de la cuenta regresiva dice que se hizo */
  pasado?: boolean;
}

/** un boleto vigente como tarjeta con talón: destino, hora, bus, asiento y código */
export function TarjetaBoleto({
  ahora,
  alPresionar,
  ancho,
  guardado,
  pasado = false,
}: PropiedadesTarjetaBoleto) {
  const { colores } = useTema();
  const { boleto, resumen } = guardado;
  const salida = new Date(resumen.salida);
  const minutos = minutosHastaSalida(guardado, ahora);
  const reducido = useMovimientoReducido();
  const progreso = pasado ? 0 : progresoHaciaSalida(minutos);
  const avance = useRef(new Animated.Value(reducido ? progreso : 0)).current;

  useEffect(() => {
    if (reducido) {
      avance.setValue(progreso);
      return;
    }
    Animated.timing(avance, {
      duration: 900,
      toValue: progreso,
      useNativeDriver: true,
    }).start();
  }, [avance, progreso, reducido]);

  return (
    <Pressable
      accessibilityLabel={`${resumen.destino}, ${formatoFechaCorta(salida)}, ${formatoHoraCompleta(salida)}, ${t('boletos.asientoCorto')} ${boleto.asiento}`}
      accessibilityRole="button"
      onPress={() => alPresionar(boleto.id)}
      style={{ width: ancho }}
    >
      <LinearGradient
        colors={[colores.bloqueNegroClaro, colores.bloqueNegro]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={[
          estilos.cara,
          { borderColor: conAlfa(colores.luzRelieve, 0.12) },
        ]}
      >
        <FotoDestino
          destino={resumen.destino}
          estilo={estilos.foto}
          origen={resumen.origen}
          radio="tarjeta"
        >
          <View style={estilos.sobreFoto}>
            <View style={estilos.textos}>
              <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
                {pasado
                  ? t('boletos.viajeHecho')
                  : minutos <= 0
                    ? t('boletos.ahora')
                    : `${t('boletos.saleEn')} ${formatoDuracion(minutos)}`}
              </Text>
              <Text
                numberOfLines={1}
                style={[tipografia.titulo, { color: colores.sobreNegro }]}
              >
                {resumen.destino}
              </Text>
              <Text
                style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
              >
                {`${formatoFechaCorta(salida)} · ${formatoHoraCompleta(salida)}`}
              </Text>
            </View>
          </View>
        </FotoDestino>
        <View style={estilos.cinta}>
          <View
            style={[
              estilos.muesca,
              estilos.muescaIzquierda,
              { backgroundColor: colores.fondo },
            ]}
          />
          <View
            style={[
              estilos.perforacion,
              { borderColor: conAlfa(colores.luzRelieve, 0.2) },
            ]}
          />
          <View
            style={[
              estilos.muesca,
              estilos.muescaDerecha,
              { backgroundColor: colores.fondo },
            ]}
          />
        </View>
        <View style={estilos.inferior}>
          {(
            [
              {
                color: colores.sobreNegro,
                etiqueta: t('boletos.asientoCorto'),
                valor: String(boleto.asiento),
              },
              {
                color: colores.sobreNegro,
                etiqueta: t('boletos.encuentroCorto'),
                valor: puntoCorto(resumen.puntoEncuentro) || '—',
              },
              {
                color: colores.ambar,
                etiqueta: t('boletos.codigoCorto'),
                valor: boleto.codigo,
              },
            ] as const
          ).map((dato, indice) => (
            <View
              key={dato.etiqueta}
              style={[
                estilos.dato,
                indice > 0 && {
                  borderLeftColor: conAlfa(colores.luzRelieve, 0.14),
                  borderLeftWidth: 1,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  tipografia.etiqueta,
                  estilos.centrado,
                  { color: colores.sobreNegroSuave },
                ]}
              >
                {dato.etiqueta}
              </Text>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                numberOfLines={1}
                style={[
                  tipografia.dato,
                  estilos.centrado,
                  { color: dato.color },
                ]}
              >
                {dato.valor}
              </Text>
            </View>
          ))}
        </View>
        {!pasado && minutos <= 180 && (
          <View
            style={[
              estilos.pista,
              { backgroundColor: conAlfa(colores.sobreNegro, 0.12) },
            ]}
            testID="progreso-boleto"
          >
            <Animated.View
              style={[
                estilos.relleno,
                {
                  backgroundColor: colores.ambar,
                  transform: [{ scaleX: avance }],
                },
              ]}
            />
          </View>
        )}
        {!pasado && <BarridoDeLuz radio={radios.bloqueNegro} retraso={500} />}
      </LinearGradient>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cinta: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: -espacios.lateral,
  },
  foto: { height: 148, justifyContent: 'flex-end' },
  muesca: { borderRadius: 10, height: 20, width: 20 },
  muescaDerecha: { marginRight: -10 },
  muescaIzquierda: { marginLeft: -10 },
  pista: { borderRadius: 3, height: 5, overflow: 'hidden' },
  relleno: { height: 5, transformOrigin: 'left', width: '100%' },
  sobreFoto: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'space-between',
    padding: espacios.dieciseis,
  },
  cara: {
    borderRadius: radios.bloqueNegro,
    borderWidth: 1,
    gap: espacios.dieciseis,
    overflow: 'hidden',
    padding: espacios.lateral,
    paddingTop: espacios.doce,
  },
  centrado: { alignSelf: 'stretch', textAlign: 'center' },
  dato: {
    alignItems: 'center',
    flex: 1,
    gap: espacios.cuatro,
    minWidth: 0,
    paddingHorizontal: espacios.cuatro,
  },
  inferior: { flexDirection: 'row' },
  perforacion: { borderStyle: 'dashed', borderTopWidth: 1, flex: 1 },
  superior: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textos: { flex: 1, gap: espacios.cuatro },
});
