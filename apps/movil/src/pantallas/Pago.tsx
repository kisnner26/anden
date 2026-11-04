import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { BloqueNegro } from '@/componentes/BloqueNegro';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { OpcionSeleccion } from '@/componentes/OpcionSeleccion';
import { formatoFechaCorta, formatoHoraCompleta } from '@/datos/formato';
import { totalReserva, type ErrorReserva } from '@/datos/reserva';
import { useBoletos } from '@/datos/useBoletos';
import { useReserva } from '@/datos/useReserva';
import { obtenerMuestra, useSalidas } from '@/datos/useSalidas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

import { ReservaConfirmada } from './ReservaConfirmada';

export interface PropiedadesPago {
  alReservado: (boletoId: string) => void;
  alVolver: () => void;
  viajeId: string;
}

function mensajeDe(error: ErrorReserva): string {
  if (error === 'asiento-ocupado') return t('pago.errorOcupado');
  if (error === 'venta-cerrada') return t('pago.errorCerrada');
  if (error === 'maximo-6') return t('pago.errorMaximo');
  if (error === 'sin-tarifa') return t('pago.errorTarifa');
  return t('pago.errorGeneral');
}

/** cómo se paga: hoy solo en efectivo al abordar, por el monto exacto de la tarifa oficial */
export function Pago({ alReservado, alVolver, viajeId }: PropiedadesPago) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { borrador, limpiar } = useReserva();
  const { reservar } = useBoletos();
  const { salidas } = useSalidas();
  const [reservando, establecerReservando] = useState(false);
  const [error, establecerError] = useState<string | null>(null);
  const [confirmacion, establecerConfirmacion] = useState<{
    codigo: string;
  } | null>(null);
  const salida = salidas.find((candidata) => candidata.viajeId === viajeId);

  if (!borrador || borrador.viajeId !== viajeId || !salida) {
    return (
      <View style={[estilos.centro, { backgroundColor: colores.fondo }]}>
        <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
          {t('pago.sinReserva')}
        </Text>
      </View>
    );
  }

  const total = totalReserva(
    obtenerMuestra(),
    viajeId,
    borrador.pasajeros.length,
  );

  async function confirmar() {
    if (!borrador) return;
    establecerReservando(true);
    establecerError(null);
    const resultado = await reservar(viajeId, borrador.pasajeros);
    establecerReservando(false);
    if (resultado.ok) {
      limpiar();
      const primero = resultado.valor[0];
      if (primero) {
        establecerConfirmacion({
          codigo: primero.boleto.codigo,
        });
        alReservado(primero.boleto.id);
      }
    } else {
      establecerError(mensajeDe(resultado.error));
    }
  }

  if (confirmacion) {
    return <ReservaConfirmada codigo={confirmacion.codigo} />;
  }

  return (
    <View style={[estilos.pantalla, { backgroundColor: colores.fondo }]}>
      <ScrollView
        contentContainerStyle={[
          estilos.contenido,
          { paddingBottom: 200, paddingTop: margenes.top + 8 },
        ]}
      >
        <CabeceraPantalla alVolver={alVolver} titulo={t('pago.titulo')} />

        <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
          {t('pago.resumen')}
        </Text>
        <Bloque estiloContenido={estilos.resumen}>
          <Text
            style={[estilos.viaje, { color: colores.tinta }]}
          >{`UCA → ${salida.destino}`}</Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {`${formatoFechaCorta(salida.salida)}, ${formatoHoraCompleta(salida.salida)} · ${t(`servicios.${salida.servicio}`)} · ${salida.placa}`}
          </Text>
          {borrador.pasajeros.map((pasajero) => (
            <Text
              key={pasajero.asiento}
              style={[tipografia.cuerpo, { color: colores.tinta }]}
            >
              {`${t('pasajeros.asiento')} ${pasajero.asiento} · ${pasajero.nombre.trim()}`}
            </Text>
          ))}
        </Bloque>

        <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
          {t('pago.elegir')}
        </Text>
        <OpcionSeleccion
          alElegir={() => undefined}
          detalle={t('pago.efectivoDetalle')}
          elegida
          nombre={t('pago.efectivo')}
        />
        <OpcionSeleccion
          alElegir={() => undefined}
          deshabilitada
          detalle={t('pago.tarjetaDetalle')}
          elegida={false}
          nombre={t('pago.tarjeta')}
          rotulo={t('pago.proximamente')}
        />
        <Bloque estiloContenido={estilos.aviso} hundido radio="loseta">
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('pago.avisoEfectivo')}
          </Text>
        </Bloque>

        {error && (
          <Text
            accessibilityLiveRegion="polite"
            style={[tipografia.pequeno, { color: colores.cancelado }]}
          >
            {error}
          </Text>
        )}
      </ScrollView>

      <View style={[estilos.pie, { bottom: margenes.bottom + 8 }]}>
        <BloqueNegro estiloContenido={estilos.contenidoPie}>
          <View style={estilos.total}>
            <Text
              style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
            >
              {t('pago.total')}
            </Text>
            <Text
              style={[tipografia.datoGrande, { color: colores.sobreNegro }]}
            >
              {total ? `C$ ${total.total}` : '—'}
            </Text>
            <Text
              style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
            >
              {total
                ? `${t('pago.tarifaMuestra')} · C$ ${total.unitario} ${t('asientos.porPasajero')}`
                : t('pago.errorTarifa')}
            </Text>
          </View>
          <BotonAccion
            alPresionar={() => void confirmar()}
            deshabilitado={reservando || total === null}
            etiqueta={reservando ? t('pago.reservando') : t('pago.confirmar')}
            icono="boleto"
          />
        </BloqueNegro>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  aviso: { padding: espacios.dieciseis },
  centro: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: espacios.treintaYDos,
  },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  contenidoPie: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'space-between',
    paddingHorizontal: espacios.veinticuatro,
    paddingVertical: espacios.dieciseis,
  },
  pantalla: { flex: 1 },
  pie: { left: 14, position: 'absolute', right: 14 },
  resumen: { gap: espacios.ocho, padding: espacios.veinticuatro },
  total: { flex: 1 },
  viaje: {
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 32,
    lineHeight: 34,
  },
});
