import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ControlSegmentado } from '@/componentes/ControlSegmentado';
import { useEncomiendas } from '@/datos/useEncomiendas';
import { ConductorEncomiendas } from './ConductorEncomiendas';

import { Aparece } from '@/componentes/Aparece';
import { Autobus, type IdVarianteBus } from '@/componentes/Autobus';
import { Bloque } from '@/componentes/Bloque';
import type { IdVehiculoPlus } from '@/componentes/VehiculoPlus';
import { formatoHora } from '@/datos/formato';
import { nombrePropio } from '@/datos/perfil';
import { salidasDeChofer, salidasDelDia, type Salida } from '@/datos/salidas';
import { unirBoletos, useBoletosDelViaje } from '@/datos/useBoletosDelViaje';
import { useAbordaje } from '@/datos/useAbordaje';
import { useBoletos } from '@/datos/useBoletos';
import { obtenerMuestra, useAhora } from '@/datos/useSalidas';
import { usePagos } from '@/datos/usePagos';
import { useSesion } from '@/datos/useSesion';
import { resumenDeCobro } from '@/servicios/pagos';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesConductorPasajeros {
  alAbrirViaje: (viajeId: string) => void;
}

function Pildora({ color, texto }: { color: string; texto: string }) {
  return (
    <View style={[estilos.pildora, { backgroundColor: conAlfa(color, 0.16) }]}>
      <Text style={[tipografia.etiqueta, { color }]}>{texto}</Text>
    </View>
  );
}

/** pasajeros del día: por cada salida, quién viaja, si pagó y si ya subió; los Plus van primero */
export function ConductorPasajeros({
  alAbrirViaje,
}: PropiedadesConductorPasajeros) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { sesion } = useSesion();
  const ahora = useAhora();
  const [vista, establecerVista] = useState<'encomiendas' | 'pasajeros'>(
    'pasajeros',
  );
  const { encomiendas } = useEncomiendas();
  const porResponder = encomiendas.filter(
    (e) => e.choferId === sesion?.choferId && e.estado === 'solicitada',
  ).length;
  const viajes = sesion?.choferId
    ? salidasDelDia(
        salidasDeChofer(obtenerMuestra(), ahora, sesion.choferId),
        ahora,
      )
    : [];

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        { paddingBottom: 120, paddingTop: margenes.top + espacios.dieciseis },
      ]}
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colores.fondo }}
    >
      <Text style={[tipografia.titulo, { color: colores.tinta }]}>
        {t('conductorPasajeros.titulo')}.
      </Text>
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {t('conductorPasajeros.detalle')}
      </Text>
      <ControlSegmentado
        alCambiar={establecerVista}
        opciones={[
          {
            clave: 'pasajeros',
            etiqueta: t('conductorPasajeros.segmentoPasajeros'),
          },
          {
            clave: 'encomiendas',
            etiqueta:
              porResponder > 0
                ? `${t('conductorEncomiendas.segmento')} (${porResponder})`
                : t('conductorEncomiendas.segmento'),
          },
        ]}
        valor={vista}
      />
      {vista === 'encomiendas' && <ConductorEncomiendas />}
      {vista === 'pasajeros' && viajes.length === 0 && (
        <Bloque estiloContenido={estilos.vacio}>
          <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
            {t('conductorPasajeros.sinViajes')}
          </Text>
        </Bloque>
      )}
      {vista === 'pasajeros' &&
        viajes.map((viaje, indice) => (
          <Aparece indice={indice} key={viaje.viajeId}>
            <SeccionViaje alAbrir={alAbrirViaje} viaje={viaje} />
          </Aparece>
        ))}
    </ScrollView>
  );
}

function SeccionViaje({
  alAbrir,
  viaje,
}: {
  alAbrir: (viajeId: string) => void;
  viaje: Salida;
}) {
  const { colores } = useTema();
  const { boletos: locales } = useBoletos();
  const { boletos: remotos, fallo } = useBoletosDelViaje(viaje.viajeId);
  const { estadoDe, registro } = usePagos();
  const { abordo } = useAbordaje();
  const pasajeros = unirBoletos(locales, remotos)
    .filter(
      ({ boleto }) =>
        boleto.viajeId === viaje.viajeId && boleto.estado !== 'cancelado',
    )
    .sort(
      (a, b) =>
        Number(b.resumen.plus === true) - Number(a.resumen.plus === true) ||
        a.boleto.asiento - b.boleto.asiento,
    );
  const cobro = resumenDeCobro(
    pasajeros.map(({ boleto }) => ({ id: boleto.id, precio: boleto.precio })),
    registro,
  );
  const abordaron = pasajeros.filter(({ boleto }) => abordo(boleto.id)).length;
  const avance = pasajeros.length === 0 ? 0 : abordaron / pasajeros.length;

  return (
    <Bloque estiloContenido={estilos.seccion}>
      <Pressable
        accessibilityLabel={rellenar(t('conductor.abrirViaje'), {
          destino: viaje.destino,
        })}
        accessibilityRole="button"
        onPress={() => alAbrir(viaje.viajeId)}
        style={estilos.cabecera}
      >
        <View style={estilos.destino}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {`${viaje.origen} → ${viaje.destino}`}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {rellenar(t('conductorPasajeros.enAnden'), {
              puntoEncuentro: viaje.puntoEncuentro,
              hora: formatoHora(viaje.salida),
            })}
          </Text>
        </View>
        <View style={estilos.cifras}>
          <Text style={[tipografia.dato, { color: colores.ambarTexto }]}>
            {`C$ ${cobro.cobrado}`}
          </Text>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {t('conductorPasajeros.cobrados')}
          </Text>
        </View>
      </Pressable>

      <View style={[estilos.pista, { backgroundColor: colores.linea }]}>
        <View
          style={[
            estilos.relleno,
            { backgroundColor: colores.ambar, width: `${avance * 100}%` },
          ]}
        />
      </View>
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {rellenar(t('conductorPasajeros.resumen2'), {
          abordaron,
          pasajeros: pasajeros.length,
          pendiente: cobro.pendiente,
        })}
      </Text>

      {pasajeros.length === 0 && (
        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {t('conductorPasajeros.sinPasajeros')}
        </Text>
      )}
      {pasajeros.map(({ boleto, resumen }) => {
        const pagado = estadoDe(boleto.id) === 'pagado_efectivo';
        const subio = abordo(boleto.id);
        return (
          <View
            key={boleto.id}
            style={[
              estilos.fila,
              resumen.plus && {
                backgroundColor: conAlfa(colores.ambar, 0.1),
                borderColor: conAlfa(colores.ambar, 0.45),
                borderWidth: 1,
              },
            ]}
          >
            <View
              style={[
                estilos.asiento,
                { backgroundColor: subio ? colores.ambar : colores.barroClaro },
              ]}
            >
              <Text
                style={[
                  tipografia.dato,
                  { color: subio ? colores.sobreAmbar : colores.tinta },
                ]}
              >
                {boleto.asiento}
              </Text>
            </View>
            <View style={estilos.texto}>
              <Text
                numberOfLines={1}
                style={[tipografia.nombreFila, { color: colores.tinta }]}
              >
                {nombrePropio(boleto.pasajero.nombre)}
              </Text>
              <View style={estilos.pildoras}>
                <Pildora
                  color={pagado ? colores.aTiempo : colores.ambarTexto}
                  texto={
                    pagado
                      ? t('conductorPasajeros.pagado')
                      : t('conductorPasajeros.pendiente')
                  }
                />
                {subio && (
                  <Pildora
                    color={colores.tinta}
                    texto={t('conductorPasajeros.abordo')}
                  />
                )}
                {resumen.plus && (
                  <Pildora color={colores.ambarTexto} texto={t('plus.sello')} />
                )}
              </View>
            </View>
            {resumen.plus && resumen.unidadPlus && (
              <Autobus
                ancho={46}
                variante={resumen.unidadPlus as IdVarianteBus | IdVehiculoPlus}
              />
            )}
          </View>
        );
      })}
      {fallo && (
        <Text style={[tipografia.pequeno, { color: colores.cancelado }]}>
          {t('conductorPasajeros.sinConexion')}
        </Text>
      )}
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  asiento: {
    alignItems: 'center',
    borderRadius: radios.loseta,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  cabecera: { alignItems: 'center', flexDirection: 'row', gap: espacios.doce },
  cifras: { alignItems: 'flex-end' },
  contenido: { gap: espacios.doce, paddingHorizontal: espacios.lateral },
  destino: { flex: 1, gap: 2 },
  fila: {
    alignItems: 'center',
    borderRadius: radios.loseta,
    flexDirection: 'row',
    gap: espacios.doce,
    minHeight: tamanosControl.toqueMinimo,
    padding: espacios.ocho,
  },
  pildora: {
    borderRadius: radios.pildora,
    paddingHorizontal: espacios.ocho,
    paddingVertical: 2,
  },
  pildoras: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.cuatro },
  pista: { borderRadius: radios.pildora, height: 6, overflow: 'hidden' },
  relleno: { borderRadius: radios.pildora, height: 6 },
  seccion: { gap: espacios.ocho, padding: espacios.dieciseis },
  texto: { flex: 1, gap: 4 },
  vacio: { padding: espacios.dieciseis },
});
