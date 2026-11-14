import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aparece } from '@/componentes/Aparece';
import { Bloque } from '@/componentes/Bloque';
import { ControlSegmentado } from '@/componentes/ControlSegmentado';
import { Icono } from '@/componentes/Icono';
import { inicioDelDia } from '@/datos/dias';
import { formatoFechaCorta, formatoHoraCompleta } from '@/datos/formato';
import { nombrePropio } from '@/datos/perfil';
import { salidasDeChofer, type Salida } from '@/datos/salidas';
import { unirBoletos } from '@/datos/useBoletosDelViaje';
import { useBoletos } from '@/datos/useBoletos';
import { useBoletosDeViajes } from '@/datos/useBoletosDeViajes';
import { useCierres } from '@/datos/useCierres';
import { usePagos } from '@/datos/usePagos';
import { obtenerMuestra, useAhora } from '@/datos/useSalidas';
import { useSesion } from '@/datos/useSesion';
import {
  resumirVentas,
  totalesDeVentas,
  type VentasDeViaje,
} from '@/datos/ventasConductor';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

/** un viaje en la lista: sus datos y lo vendido; los cerrados que ya no están en la muestra salen con lo que guardó el cierre */
interface ViajeVendido {
  etiqueta: string;
  fecha: Date;
  placa: string;
  ventas: VentasDeViaje;
  viajeId: string;
}

function Cifra({
  color,
  etiqueta,
  valor,
}: {
  color?: string;
  etiqueta: string;
  valor: string;
}) {
  const { colores } = useTema();
  return (
    <Bloque estilo={estilos.cifra} estiloContenido={estilos.cifraContenido}>
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {etiqueta}
      </Text>
      <Text style={[tipografia.dato, { color: color ?? colores.tinta }]}>
        {valor}
      </Text>
    </Bloque>
  );
}

function TarjetaDeViaje({ viaje }: { viaje: ViajeVendido }) {
  const { colores } = useTema();
  const [abierto, establecerAbierto] = useState(false);
  const { ventas } = viaje;
  return (
    <Bloque
      estiloContenido={estilos.tarjeta}
      testID={`viaje-vendido-${viaje.viajeId}`}
    >
      <Pressable
        accessibilityLabel={`${viaje.etiqueta}, ${ventas.vendidos} ${t('conductorBoletos.boletos')}`}
        accessibilityRole="button"
        accessibilityState={{ expanded: abierto }}
        onPress={() => establecerAbierto((a) => !a)}
        style={estilos.encabezado}
      >
        <View style={estilos.texto}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {viaje.etiqueta}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {`${formatoFechaCorta(viaje.fecha)} · ${formatoHoraCompleta(viaje.fecha)} · ${viaje.placa}`}
          </Text>
          <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
            {rellenar(t('conductorBoletos.ganadoDe'), {
              ganado: ventas.cobrado,
              total: ventas.total,
            })}
          </Text>
        </View>
        <View style={estilos.cuenta}>
          <Text style={[tipografia.dato, { color: colores.tinta }]}>
            {ventas.vendidos}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('conductorBoletos.boletos')}
          </Text>
        </View>
        <View style={{ transform: [{ rotate: abierto ? '90deg' : '0deg' }] }}>
          <Icono nombre="siguiente" tamano="mediano" />
        </View>
      </Pressable>

      {abierto ? (
        <View style={estilos.lista}>
          {ventas.pasajeros.length === 0 ? (
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {t('conductorBoletos.sinPasajeros')}
            </Text>
          ) : (
            ventas.pasajeros.map((p) => (
              <View key={p.boletoId} style={estilos.fila}>
                <View
                  style={[
                    estilos.asiento,
                    { backgroundColor: conAlfa(colores.tinta, 0.08) },
                  ]}
                >
                  <Text style={[tipografia.etiqueta, { color: colores.tinta }]}>
                    {p.asiento}
                  </Text>
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    tipografia.cuerpo,
                    estilos.nombre,
                    { color: colores.tinta },
                  ]}
                >
                  {nombrePropio(p.nombre)}
                </Text>
                {p.plus ? (
                  <Text
                    style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
                  >
                    {t('plus.sello')}
                  </Text>
                ) : null}
                <Text
                  style={[
                    tipografia.etiqueta,
                    { color: p.pagado ? colores.aTiempo : colores.tintaSuave },
                  ]}
                >
                  {p.pagado ? t('conductorPasajeros.pagado') : `C$ ${p.precio}`}
                </Text>
              </View>
            ))
          )}
          {ventas.cancelados > 0 ? (
            <Text style={[tipografia.pequeno, { color: colores.cancelado }]}>
              {rellenar(t('conductorBoletos.cancelados'), {
                cantidad: ventas.cancelados,
              })}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Bloque>
  );
}

/**
 * la pestaña de boletos del conductor: todo lo vendido en cada viaje, activo o pasado, con los nombres de quienes
 * compraron, lo que ya ganó, lo que falta cobrar y los totales de arriba
 */
export function ConductorBoletos() {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { sesion } = useSesion();
  const ahora = useAhora();
  const { boletos: locales } = useBoletos();
  const { cierreDe, cierres } = useCierres();
  const { registro } = usePagos();
  const [vista, establecerVista] = useState<'activos' | 'pasados'>('activos');
  const choferId = sesion?.choferId ?? '';

  const salidas = useMemo<Salida[]>(
    () => (choferId ? salidasDeChofer(obtenerMuestra(), ahora, choferId) : []),
    [ahora, choferId],
  );
  const propios = cierres.filter((c) => c.choferId === choferId);
  const ids = useMemo(
    () =>
      [
        ...salidas.map((s) => s.viajeId),
        ...propios.map((c) => c.viajeId),
      ].filter((id, i, todos) => todos.indexOf(id) === i),
    [propios, salidas],
  );
  const { boletos: remotos } = useBoletosDeViajes(ids);
  const todos = unirBoletos(locales, remotos);

  const inicioHoy = inicioDelDia(ahora).getTime();
  const viajes: (ViajeVendido & { pasado: boolean })[] = [
    ...salidas.map((s) => ({
      etiqueta: `${s.origen} → ${s.destino}`,
      fecha: s.salida,
      pasado:
        cierreDe(s.viajeId) !== undefined || s.salida.getTime() < inicioHoy,
      placa: s.placa,
      ventas: resumirVentas(todos, registro, s.viajeId),
      viajeId: s.viajeId,
    })),
    // los viajes cerrados que ya no están entre las salidas quedan con lo que guardó su cierre
    ...propios
      .filter((c) => !salidas.some((s) => s.viajeId === c.viajeId))
      .map((c) => ({
        etiqueta: t('conductorBoletos.viajeCerrado'),
        fecha: new Date(c.cerradoEn),
        pasado: true,
        placa: '',
        ventas: {
          cancelados: 0,
          cobrado: c.cobrado,
          pagados: c.pagados,
          pasajeros: c.sinPagar.map((p) => ({
            asiento: p.asiento,
            boletoId: p.boletoId,
            nombre: p.nombre,
            pagado: false,
            plus: false,
            precio: p.precio,
          })),
          pendiente: c.pendiente,
          total: c.total,
          vendidos: c.pasajeros,
          viajeId: c.viajeId,
        } satisfies VentasDeViaje,
        viajeId: c.viajeId,
      })),
  ];
  const activos = viajes.filter((v) => !v.pasado);
  const pasados = viajes
    .filter((v) => v.pasado)
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  const visibles = vista === 'activos' ? activos : pasados;
  const totales = totalesDeVentas(viajes.map((v) => v.ventas));

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: 120,
          paddingTop: margenes.top + espacios.veinticuatro,
        },
      ]}
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colores.fondo }}
    >
      <Text style={[tipografia.titulo, { color: colores.tinta }]}>
        {t('conductorBoletos.titulo')}.
      </Text>
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('conductorBoletos.detalle')}
      </Text>

      <View style={estilos.cifras}>
        <Cifra
          etiqueta={t('conductorBoletos.vendidos')}
          valor={String(totales.vendidos)}
        />
        <Cifra
          color={colores.aTiempo}
          etiqueta={t('conductorBoletos.ganado')}
          valor={`C$ ${totales.cobrado}`}
        />
        <Cifra
          etiqueta={t('conductorBoletos.porCobrar')}
          valor={`C$ ${totales.pendiente}`}
        />
        <Cifra
          etiqueta={t('conductorBoletos.total')}
          valor={`C$ ${totales.total}`}
        />
      </View>

      <ControlSegmentado
        alCambiar={establecerVista}
        opciones={[
          {
            clave: 'activos',
            etiqueta: `${t('conductorBoletos.activos')} · ${activos.length}`,
          },
          {
            clave: 'pasados',
            etiqueta: `${t('conductorBoletos.pasados')} · ${pasados.length}`,
          },
        ]}
        valor={vista}
      />

      {visibles.length === 0 ? (
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {vista === 'activos'
            ? t('conductorBoletos.sinActivos')
            : t('conductorBoletos.sinPasados')}
        </Text>
      ) : (
        visibles.map((viaje, i) => (
          <Aparece indice={i} key={viaje.viajeId}>
            <TarjetaDeViaje viaje={viaje} />
          </Aparece>
        ))
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  asiento: {
    alignItems: 'center',
    borderRadius: radios.asiento,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  contenido: { gap: espacios.doce, paddingHorizontal: espacios.lateral },
  cifra: { flexBasis: '47%', flexGrow: 1 },
  cifraContenido: { gap: 2, padding: espacios.doce },
  cifras: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
  cuenta: { alignItems: 'center' },
  encabezado: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
  },
  fila: { alignItems: 'center', flexDirection: 'row', gap: espacios.ocho },
  lista: { gap: espacios.ocho, paddingTop: espacios.doce },
  nombre: { flex: 1 },
  tarjeta: { padding: espacios.dieciseis },
  texto: { flex: 1, gap: 2 },
});
