import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Autobus, varianteDeClave } from '@/componentes/Autobus';
import { nombrePropio } from '@/datos/perfil';
import { formatoFechaCorta, formatoHoraCompleta } from '@/datos/formato';
import type { BoletoGuardado } from '@/datos/reserva';
import { espacios, radios, tamanosBoleto } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesTalonBoleto {
  guardado: BoletoGuardado;
}

function Casilla({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const { colores } = useTema();
  return (
    <View
      style={[estilos.casilla, { backgroundColor: colores.bloqueNegroClaro }]}
    >
      <Text style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}>
        {etiqueta}
      </Text>
      <Text style={[tipografia.casillaBoleto, { color: colores.ambar }]}>
        {valor}
      </Text>
    </View>
  );
}

function Campo({
  completo = false,
  etiqueta,
  valor,
}: {
  completo?: boolean;
  etiqueta: string;
  valor: string;
}) {
  const { colores } = useTema();
  return (
    <View style={[estilos.campo, completo && estilos.campoCompleto]}>
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {etiqueta}
      </Text>
      <Text style={[tipografia.dato, { color: colores.tintaPapel }]}>
        {valor}
      </Text>
    </View>
  );
}

/** el boleto en papel crema con su línea perforada, el código de abordaje y el QR; se lee sin conexión */
export function TalonBoleto({ guardado }: PropiedadesTalonBoleto) {
  const { colores } = useTema();
  const { boleto, resumen } = guardado;
  const salida = new Date(resumen.salida);
  const reducirMovimiento = useMovimientoReducido();
  const anterior = useRef(boleto.estado);
  const separacion = useSharedValue(boleto.estado === 'usado' ? 1 : 0);
  const sello = useSharedValue(boleto.estado === 'usado' ? 1 : 0);
  const estiloTalon = useAnimatedStyle(() => ({
    transform: [{ translateX: separacion.value * 10 }],
  }));
  const estiloSello = useAnimatedStyle(() => ({ opacity: sello.value }));

  useEffect(() => {
    if (anterior.current === boleto.estado) return;
    anterior.current = boleto.estado;
    if (boleto.estado !== 'usado') return;
    if (reducirMovimiento) {
      separacion.value = 1;
      sello.value = 1;
      return;
    }
    separacion.value = withTiming(1, { duration: movimiento.abordaje });
    sello.value = withTiming(1, { duration: movimiento.abordaje });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [boleto.estado, reducirMovimiento, sello, separacion]);

  return (
    <View
      accessibilityLabel={`${t('boleto.titulo')} ${resumen.destino}, ${t('boleto.codigo')} ${boleto.codigo}`}
      style={[estilos.papel, { backgroundColor: colores.papel }]}
      testID="talon-boleto"
    >
      <View
        style={[estilos.cabecera, { backgroundColor: colores.bloqueNegro }]}
      >
        <View style={estilos.fila}>
          <Text
            style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
          >
            {`${t('boleto.titulo')} · ${t('boleto.reservado')}`}
          </Text>
          <Text style={[tipografia.dato, { color: colores.ambar }]}>
            {`C$ ${boleto.precio}`}
          </Text>
        </View>
        <View style={estilos.destinoYBus}>
          <View style={estilos.destinoColumna}>
            <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
              {t('boleto.hacia')}
            </Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={[tipografia.titularBoleto, { color: colores.sobreNegro }]}
            >
              {resumen.destino}
            </Text>
            <Text
              style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
            >
              {`${t('boleto.desde')} ${resumen.origen ?? t('horarios.terminal')}`}
            </Text>
          </View>
          <Autobus
            ancho={118}
            letrero={resumen.destino.toUpperCase()}
            variante={varianteDeClave(resumen.destino)}
          />
        </View>
        <View style={estilos.fila}>
          <View
            style={[
              estilos.casilla,
              estilos.casillaSalida,
              { backgroundColor: colores.bloqueNegroClaro },
            ]}
          >
            <Text
              style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
            >
              {t('boleto.sale')}
            </Text>
            <Text
              style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
            >
              {formatoFechaCorta(salida)}
            </Text>
            <Text style={[tipografia.dato, { color: colores.sobreNegro }]}>
              {formatoHoraCompleta(salida)}
            </Text>
          </View>
          <Casilla etiqueta={t('boleto.anden')} valor={String(resumen.anden)} />
          <Casilla
            etiqueta={t('boleto.asiento')}
            valor={String(boleto.asiento)}
          />
        </View>
      </View>

      <View style={estilos.perforacion}>
        <View
          style={[
            estilos.muesca,
            estilos.muescaIzquierda,
            { backgroundColor: colores.fondo },
          ]}
        />
        <View style={[estilos.linea, { borderColor: colores.tintaSuave }]} />
        <View
          style={[
            estilos.muesca,
            estilos.muescaDerecha,
            { backgroundColor: colores.fondo },
          ]}
        />
      </View>

      <View style={[estilos.cuerpo, estilos.pasajeroFila]}>
        <Campo
          completo
          etiqueta={t('boleto.pasajero')}
          valor={nombrePropio(boleto.pasajero.nombre)}
        />
        <Campo etiqueta={t('boleto.placa')} valor={resumen.placa} />
        <Campo etiqueta={t('boleto.chofer')} valor={resumen.choferNombre} />
      </View>

      <Animated.View style={[estilos.cuerpo, estilos.talon, estiloTalon]}>
        <View style={estilos.codigo}>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {t('boleto.codigo')}
          </Text>
          <Text
            accessibilityLabel={boleto.codigo}
            style={[tipografia.codigoBoleto, { color: colores.tintaPapel }]}
          >
            {`${boleto.codigo.slice(0, 4)} ${boleto.codigo.slice(4)}`}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('boleto.ayuda')}
          </Text>
        </View>
        <View accessibilityLabel={`QR ${boleto.codigo}`} accessible>
          <QRCode
            backgroundColor={colores.papel}
            color={colores.tintaPapel}
            size={96}
            value={`ANDEN:${boleto.codigo}`}
          />
        </View>
      </Animated.View>
      {boleto.estado === 'usado' && (
        <Animated.Text
          style={[
            tipografia.sello,
            estilos.sello,
            { color: colores.ambarTitular },
            estiloSello,
          ]}
        >
          {t('boleto.usado')}
        </Animated.Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  cabecera: { gap: espacios.dieciseis, padding: espacios.veinticuatro },
  campo: { flex: 1, gap: 2, minWidth: '40%' },
  campoCompleto: { flexBasis: '100%', flexGrow: 0 },
  casilla: {
    borderRadius: radios.casilla,
    gap: espacios.cuatro,
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.doce,
  },
  casillaSalida: { flex: 1 },
  destinoColumna: { flex: 1, gap: espacios.cuatro },
  destinoYBus: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
  },
  pasajeroFila: {
    columnGap: espacios.doce,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: espacios.dieciseis,
  },
  codigo: { flex: 1, gap: espacios.cuatro },
  cuerpo: { gap: espacios.doce, padding: espacios.veinticuatro },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'space-between',
  },
  linea: {
    borderStyle: 'dashed',
    borderTopWidth: 2,
    flex: 1,
    marginHorizontal: 18,
  },
  muesca: {
    borderRadius: radios.pildora,
    height: tamanosBoleto.muesca,
    position: 'absolute',
    top: -tamanosBoleto.muesca / 2,
    width: tamanosBoleto.muesca,
  },
  muescaDerecha: { right: -tamanosBoleto.muesca / 2 },
  muescaIzquierda: { left: -tamanosBoleto.muesca / 2 },
  papel: { borderRadius: radios.bloque, overflow: 'hidden' },
  perforacion: { alignItems: 'center', flexDirection: 'row', height: 1 },
  talon: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: espacios.veinticuatro,
  },
  sello: {
    paddingBottom: espacios.dieciseis,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
