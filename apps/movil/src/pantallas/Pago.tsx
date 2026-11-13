import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { Icono } from '@/componentes/Icono';
import { PieReserva } from '@/componentes/PieReserva';
import { ProgresoReserva } from '@/componentes/ProgresoReserva';
import { nombrePropio } from '@/datos/perfil';
import { formatoFechaCorta, formatoHoraCompleta } from '@/datos/formato';
import { totalReserva, type ErrorReserva } from '@/datos/reserva';
import { useBoletos } from '@/datos/useBoletos';
import { useReserva } from '@/datos/useReserva';
import { obtenerMuestra, useSalidas } from '@/datos/useSalidas';
import { disposicionPantalla, espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

import { ReservaConfirmada } from './ReservaConfirmada';

export interface PropiedadesPago {
  /** vuelve a la lista de boletos desde la confirmación */
  alListo?: () => void;
  /** la reserva quedó creada; no navega, solo avisa */
  alReservado?: (boletoId: string) => void;
  /** abre el boleto recién creado */
  alVerBoleto?: (boletoId: string) => void;
  alVolver: () => void;
  viajeId: string;
}

function mensajeDe(error: ErrorReserva): string {
  if (error === 'asiento-ocupado') return t('pago.errorOcupado');
  if (error === 'venta-cerrada') return t('pago.errorCerrada');
  if (error === 'maximo-6') return t('pago.errorMaximo');
  if (error === 'sin-tarifa') return t('pago.errorTarifa');
  if (error === 'sin-plus-anticipado') return t('plus.soloPlusAnticipado');
  return t('pago.errorGeneral');
}

/** cómo se paga: hoy solo en efectivo al abordar, por el monto exacto de la tarifa oficial */
export function Pago({
  alListo,
  alReservado,
  alVerBoleto,
  alVolver,
  viajeId,
}: PropiedadesPago) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { borrador, limpiar } = useReserva();
  const { reservar } = useBoletos();
  const enCurso = useRef(false);
  const { datos, salidas } = useSalidas();
  const [reservando, establecerReservando] = useState(false);
  const [error, establecerError] = useState<string | null>(null);
  const [confirmacion, establecerConfirmacion] = useState<{
    boletoId: string;
    codigo: string;
  } | null>(null);
  const salida = salidas.find((candidata) => candidata.viajeId === viajeId);
  const ruta = datos.rutas.find((candidata) => candidata.id === salida?.rutaId);
  const origen = datos.terminales.find(
    (terminal) => terminal.id === ruta?.origenId,
  );

  if (confirmacion) {
    return (
      <ReservaConfirmada
        alListo={alListo}
        alVerBoleto={() => alVerBoleto?.(confirmacion.boletoId)}
        boletoId={confirmacion.boletoId}
        codigo={confirmacion.codigo}
      />
    );
  }

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
    // un segundo toque antes de que el botón se bloquee no debe reservar dos veces
    if (!borrador || enCurso.current) return;
    enCurso.current = true;
    establecerReservando(true);
    establecerError(null);
    const resultado = await reservar(viajeId, borrador.pasajeros);
    enCurso.current = false;
    establecerReservando(false);
    if (resultado.ok) {
      limpiar();
      const primero = resultado.valor[0];
      if (primero) {
        establecerConfirmacion({
          boletoId: primero.boleto.id,
          codigo: primero.boleto.codigo,
        });
        alReservado?.(primero.boleto.id);
      }
    } else {
      establecerError(mensajeDe(resultado.error));
    }
  }

  return (
    <View style={[estilos.pantalla, { backgroundColor: colores.fondo }]}>
      <ScrollView
        contentContainerStyle={[
          estilos.contenido,
          {
            paddingBottom: disposicionPantalla.espacioPieReserva,
            paddingTop: margenes.top + espacios.ocho,
          },
        ]}
      >
        <CabeceraPantalla alVolver={alVolver} titulo={t('pago.titulo')} />
        <ProgresoReserva paso={3} />

        <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
          {t('pago.resumen')}
        </Text>
        <Bloque estiloContenido={estilos.resumen}>
          <View style={estilos.extremos}>
            <View style={estilos.extremo}>
              <Text
                style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
              >
                {t('pago.de')}
              </Text>
              <Text
                style={[tipografia.titularResumen, { color: colores.tinta }]}
              >
                {origen?.nombre ?? ''}
              </Text>
            </View>
            <Icono color={colores.tinta} nombre="siguiente" tamano="grande" />
            <View style={[estilos.extremo, estilos.extremoDerecho]}>
              <Text
                style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
              >
                {t('pago.a')}
              </Text>
              <Text
                style={[tipografia.titularResumen, { color: colores.tinta }]}
              >
                {salida.destino}
              </Text>
            </View>
          </View>
          <View style={estilos.datos}>
            {(
              [
                [t('pago.fecha'), formatoFechaCorta(salida.salida)],
                [t('pago.hora'), formatoHoraCompleta(salida.salida)],
                [
                  t('pago.asientos'),
                  borrador.pasajeros.map((p) => p.asiento).join(', '),
                ],
              ] as const
            ).map(([etiqueta, valor]) => (
              <View key={etiqueta} style={estilos.dato}>
                <Text
                  style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
                >
                  {etiqueta}
                </Text>
                <Text style={[tipografia.nombreFila, { color: colores.tinta }]}>
                  {valor}
                </Text>
              </View>
            ))}
          </View>
          <Text
            style={[
              tipografia.pequeno,
              estilos.centrado,
              { color: colores.tintaSuave },
            ]}
          >
            {`${borrador.pasajeros.map((p) => nombrePropio(p.nombre)).join(' · ')} · ${t(`servicios.${salida.servicio}`)} · ${salida.placa}`}
          </Text>
        </Bloque>

        <Bloque estiloContenido={estilos.metodo} hundido radio="loseta">
          <Icono nombre="boleto" tamano="ilustracion" />
          <View style={estilos.metodoTexto}>
            <Text style={[tipografia.nombreFila, { color: colores.tinta }]}>
              {t('pago.efectivo')}
            </Text>
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {`${t('pago.efectivoDetalle')} ${t('pago.avisoEfectivo')}`}
            </Text>
          </View>
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

      <PieReserva estiloContenido={estilos.contenidoPie}>
        <View style={estilos.filaTotal}>
          <View style={estilos.total}>
            <Text
              style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
            >
              {t('pago.total')}
            </Text>
            <Text
              style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
            >
              {total
                ? `${t('pago.tarifaMuestra')} · C$ ${total.unitario} ${t('asientos.porPasajero')}`
                : t('pago.errorTarifa')}
            </Text>
          </View>
          <Text style={[tipografia.display, { color: colores.ambar }]}>
            {total ? `C$ ${total.total}` : '—'}
          </Text>
        </View>
        <BotonAccion
          alPresionar={() => void confirmar()}
          cargando={reservando}
          deshabilitado={total === null}
          etiqueta={reservando ? t('pago.reservando') : t('pago.confirmar')}
          icono="boleto"
        />
      </PieReserva>
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: espacios.treintaYDos,
  },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  contenidoPie: {
    gap: espacios.doce,
    paddingHorizontal: espacios.veinticuatro,
    paddingVertical: espacios.dieciseis,
  },
  filaTotal: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'space-between',
  },
  centrado: { textAlign: 'center' },
  dato: { alignItems: 'center', flex: 1, gap: espacios.cuatro },
  datos: { flexDirection: 'row' },
  extremo: { flex: 1, gap: espacios.cuatro },
  extremoDerecho: { alignItems: 'flex-end' },
  extremos: { alignItems: 'center', flexDirection: 'row', gap: espacios.doce },
  metodo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    padding: espacios.dieciseis,
  },
  metodoTexto: { flex: 1, gap: espacios.cuatro },
  pantalla: { flex: 1 },
  resumen: { gap: espacios.dieciseis, padding: espacios.veinticuatro },
  total: { flex: 1 },
});
