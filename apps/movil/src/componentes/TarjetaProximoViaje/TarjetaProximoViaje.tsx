import { StyleSheet, Text, View } from 'react-native';

import { Autobus } from '@/componentes/Autobus';
import { BloqueNegro } from '@/componentes/BloqueNegro';
import { BotonAccion } from '@/componentes/BotonAccion';
import { formatoHoraCompleta } from '@/datos/formato';
import type { Salida } from '@/datos/salidas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesTarjetaProximoViaje {
  ahora: Date;
  alVerBoleto: () => void;
  salida: Salida;
}

const ANCHO_BUS = 262;

/** el próximo viaje: bloque negro con el bus centrado cruzando su borde superior */
export function TarjetaProximoViaje({
  ahora,
  alVerBoleto,
  salida,
}: PropiedadesTarjetaProximoViaje) {
  const { colores } = useTema();
  const salidaReal = salida.salida.getTime() + salida.minutosAtraso * 60_000;
  const minutos = Math.max(
    0,
    Math.round((salidaReal - ahora.getTime()) / 60_000),
  );

  return (
    <View style={estilos.contenedor}>
      <View pointerEvents="none" style={estilos.bus}>
        <Autobus ancho={ANCHO_BUS} letrero={salida.destino.toUpperCase()} />
      </View>
      <BloqueNegro estiloContenido={estilos.tarjeta} testID="proximo-viaje">
        <View style={estilos.fila}>
          <View>
            <Text style={[estilos.destino, { color: colores.sobreNegro }]}>
              {salida.destino}
            </Text>
            <Text
              style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
            >
              {`${t('viajar.andenMayusculas')} ${salida.anden} · ${t(`servicios.${salida.servicio}`)}`}
            </Text>
          </View>
          <View style={estilos.derecha}>
            <Text style={[tipografia.datoGrande, { color: colores.ambar }]}>
              {formatoHoraCompleta(salida.salida)}
            </Text>
            <Text
              style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
            >
              {`${t('viajar.saleEn')} ${minutos} ${t('viajar.minutos')}`}
            </Text>
          </View>
        </View>
        <View style={estilos.boton}>
          <BotonAccion
            alPresionar={alVerBoleto}
            etiqueta={t('viajar.elegirAsiento')}
            icono="boleto"
          />
        </View>
      </BloqueNegro>
    </View>
  );
}

const estilos = StyleSheet.create({
  boton: { marginTop: espacios.dieciseis },
  bus: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: -114,
    zIndex: 2,
  },
  contenedor: { marginTop: 106 },
  derecha: { alignItems: 'flex-end' },
  destino: {
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 46,
    lineHeight: 44,
  },
  fila: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tarjeta: {
    paddingBottom: espacios.dieciseis,
    paddingHorizontal: espacios.lateral,
    paddingTop: 48,
  },
});
