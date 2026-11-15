import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Aparece } from '@/componentes/Aparece';
import { Bloque } from '@/componentes/Bloque';
import { BloqueNegro } from '@/componentes/BloqueNegro';
import { IlustracionAtajo } from '@/componentes/IlustracionAtajo';
import { ResumenIA } from '@/componentes/ResumenIA';
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
  /** asientos que quedan libres en el viaje; falta en los cerrados que ya no están en la muestra */
  libres?: number;
  placa: string;
  ventas: VentasDeViaje;
  viajeId: string;
}

type TipoCifra = 'ganado' | 'porCobrar' | 'total' | 'vendidos';

/** el dibujo de cada indicador, en un círculo del mismo tamaño para que las cuatro tarjetas queden iguales */
function IconoCifra({ tipo }: { tipo: TipoCifra }) {
  const { colores } = useTema();
  const trazo = tipo === 'ganado' ? colores.aTiempo : colores.ambarTexto;
  return (
    <View
      style={[estilos.insigniaCifra, { backgroundColor: conAlfa(trazo, 0.16) }]}
    >
      <Svg height={22} viewBox="0 0 24 24" width={22}>
        {tipo === 'vendidos' ? (
          <Path
            d="M3.5 8 h17 a1 1 0 0 1 1 1 v2 a2.2 2.2 0 0 0 0 4.4 V17 a1 1 0 0 1 -1 1 h-17 a1 1 0 0 1 -1 -1 v-1.6 a2.2 2.2 0 0 0 0 -4.4 V9 a1 1 0 0 1 1 -1 z"
            fill="none"
            stroke={trazo}
            strokeLinejoin="round"
            strokeWidth={2}
          />
        ) : null}
        {tipo === 'ganado' ? (
          <>
            <Circle
              cx={12}
              cy={12}
              fill="none"
              r={8.5}
              stroke={trazo}
              strokeWidth={2}
            />
            <Path
              d="M12 7.5 v9 M14.6 9.6 c-.6 -.9 -1.5 -1.3 -2.6 -1.3 c-1.5 0 -2.6 .8 -2.6 2 c0 3 5.4 1.3 5.4 4.1 c0 1.2 -1.2 2 -2.8 2 c-1.2 0 -2.2 -.5 -2.8 -1.4"
              fill="none"
              stroke={trazo}
              strokeLinecap="round"
              strokeWidth={1.8}
            />
          </>
        ) : null}
        {tipo === 'porCobrar' ? (
          <>
            <Circle
              cx={12}
              cy={12}
              fill="none"
              r={8.5}
              stroke={trazo}
              strokeWidth={2}
            />
            <Path
              d="M12 7 v5.2 l3.4 2"
              fill="none"
              stroke={trazo}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </>
        ) : null}
        {tipo === 'total' ? (
          <>
            <Rect
              fill="none"
              height={12}
              rx={2}
              stroke={trazo}
              strokeWidth={2}
              width={17}
              x={3.5}
              y={6}
            />
            <Path
              d="M7 10.5 h10 M7 14 h6"
              fill="none"
              stroke={trazo}
              strokeLinecap="round"
              strokeWidth={2}
            />
          </>
        ) : null}
      </Svg>
    </View>
  );
}

function Cifra({
  color,
  etiqueta,
  tipo,
  valor,
}: {
  color?: string;
  etiqueta: string;
  tipo: TipoCifra;
  valor: string;
}) {
  const { colores } = useTema();
  return (
    <Bloque estilo={estilos.cifra} estiloContenido={estilos.cifraContenido}>
      <IconoCifra tipo={tipo} />
      <View style={estilos.cifraTexto}>
        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {etiqueta}
        </Text>
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[tipografia.dato, { color: color ?? colores.tinta }]}
        >
          {valor}
        </Text>
      </View>
    </Bloque>
  );
}

/** el anillo de cada viaje: lo vendido sobre lo que cabe, o lo cobrado si el viaje ya cerró; el número va al centro */
function AnilloDeVentas({
  fraccion,
  numero,
}: {
  fraccion: number;
  numero: number;
}) {
  const { colores } = useTema();
  const radio = 21;
  const largo = 2 * Math.PI * radio;
  return (
    <View style={estilos.anillo}>
      <Svg height={56} viewBox="0 0 56 56" width={56}>
        <Circle
          cx={28}
          cy={28}
          fill="none"
          r={radio}
          stroke={conAlfa(colores.tinta, 0.1)}
          strokeWidth={6}
        />
        <Circle
          cx={28}
          cy={28}
          fill="none"
          origin="28, 28"
          r={radio}
          rotation={-90}
          stroke={colores.ambar}
          strokeDasharray={`${largo * Math.min(1, Math.max(0, fraccion))} ${largo}`}
          strokeLinecap="round"
          strokeWidth={6}
        />
      </Svg>
      <Text
        style={[
          tipografia.dato,
          estilos.numeroAnillo,
          { color: colores.tinta },
        ]}
      >
        {numero}
      </Text>
    </View>
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
            {ventas.total === 0
              ? t('conductorBoletos.sinVentas')
              : rellenar(t('conductorBoletos.ganadoDe'), {
                  ganado: ventas.cobrado,
                  total: ventas.total,
                })}
          </Text>
        </View>
        <AnilloDeVentas
          fraccion={
            viaje.libres !== undefined
              ? ventas.vendidos / Math.max(1, ventas.vendidos + viaje.libres)
              : ventas.total > 0
                ? ventas.cobrado / ventas.total
                : 0
          }
          numero={ventas.vendidos}
        />
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
      libres: s.asientosLibres,
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
      <Text style={[tipografia.titularPantalla, { color: colores.tinta }]}>
        {t('conductorBoletos.titulo')}.
      </Text>
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('conductorBoletos.detalle')}
      </Text>

      <BloqueNegro estiloContenido={estilos.hero} testID="hero-ganancias">
        <View style={estilos.heroTexto}>
          <Text
            style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
          >
            {t('conductorBoletos.ganado')}
          </Text>
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={[tipografia.display, { color: colores.ambar }]}
          >
            {`C$ ${totales.cobrado}`}
          </Text>
          <Text
            style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
          >
            {rellenar(t('conductorBoletos.heroDetalle'), {
              boletos: totales.vendidos,
              viajes: totales.viajes,
            })}
          </Text>
        </View>
        <IlustracionAtajo alto={78} tipo="boletos" />
      </BloqueNegro>

      <View style={estilos.cifras}>
        <Cifra
          etiqueta={t('conductorBoletos.porCobrar')}
          tipo="porCobrar"
          valor={`C$ ${totales.pendiente}`}
        />
        <Cifra
          etiqueta={t('conductorBoletos.total')}
          tipo="total"
          valor={`C$ ${totales.total}`}
        />
      </View>

      {totales.vendidos > 0 ? (
        <ResumenIA
          contexto={[
            `Boletos vendidos: ${totales.vendidos}, en ${totales.viajes} viajes.`,
            `Ganado C$ ${totales.cobrado}, por cobrar C$ ${totales.pendiente}, total C$ ${totales.total}.`,
            ...viajes
              .filter((v) => v.ventas.vendidos > 0)
              .slice(0, 6)
              .map(
                (v) =>
                  `- ${v.etiqueta}, ${formatoFechaCorta(v.fecha)}: ${v.ventas.vendidos} boletos, cobrado C$ ${v.ventas.cobrado} de C$ ${v.ventas.total}`,
              ),
          ].join('\n')}
          pedido={t('conductorBoletos.pedidoIA')}
          titulo={t('conductorBoletos.tituloIA')}
        />
      ) : null}

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
  anillo: {
    alignItems: 'center',
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  cifra: { flexBasis: '47%', flexGrow: 1 },
  cifraContenido: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    minHeight: 76,
    padding: espacios.doce,
  },
  cifraTexto: { flex: 1, gap: 2 },
  hero: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'space-between',
    padding: espacios.dieciseis,
  },
  heroTexto: { flex: 1, gap: 2 },
  insigniaCifra: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  numeroAnillo: { position: 'absolute' },
  cifras: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
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
