import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { BloqueNegro } from '@/componentes/BloqueNegro';
import { BotonAccion } from '@/componentes/BotonAccion';
import { Icono } from '@/componentes/Icono';
import { MapaAsientos } from '@/componentes/MapaAsientos';
import { formatoHoraCompleta } from '@/datos/formato';
import { formatoCuenta, useCuentaRegresiva } from '@/datos/useCuentaRegresiva';
import { useMapaAsientos } from '@/datos/useMapaAsientos';
import { useSalidas } from '@/datos/useSalidas';
import { useSeleccionAsientos } from '@/datos/useSeleccionAsientos';
import { conAlfa } from '@/tema/alfa';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesAsientos {
  alVolver: () => void;
  viajeId: string;
}

const SEGUNDOS_RETENCION = 600;

const AVISOS = {
  'asiento-ocupado': () => t('asientos.avisoOcupado'),
  'maximo-6': () => t('asientos.avisoMaximo'),
  'venta-cerrada': () => t('asientos.avisoVentaCerrada'),
} as const;

function Leyenda({
  etiqueta,
  marca,
}: {
  etiqueta: string;
  marca: React.ReactNode;
}) {
  const { colores } = useTema();
  return (
    <View style={estilos.leyenda}>
      {marca}
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {etiqueta}
      </Text>
    </View>
  );
}

/** elegir asiento: el plano del bus, la retención de diez minutos y el total con la tarifa */
export function Asientos({ alVolver, viajeId }: PropiedadesAsientos) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const mapa = useMapaAsientos(viajeId);
  const { salidas } = useSalidas();
  const { alternar, aviso, elegidos, total } = useSeleccionAsientos(viajeId);
  const restantes = useCuentaRegresiva(SEGUNDOS_RETENCION);
  const [pagoPendiente, establecerPagoPendiente] = useState(false);
  const salida = salidas.find((candidata) => candidata.viajeId === viajeId);

  if (!mapa || !salida) {
    return (
      <View style={[estilos.centro, { backgroundColor: colores.fondo }]}>
        <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
          {t('asientos.noExiste')}
        </Text>
      </View>
    );
  }

  const cantidad = elegidos.length;
  const detalleTarifa = total
    ? `${t('asientos.tarifaMuestra')} · C$ ${total.unitario} ${t('asientos.porPasajero')}`
    : t('asientos.sinElegir');

  return (
    <View style={[estilos.pantalla, { backgroundColor: colores.fondo }]}>
      <ScrollView
        contentContainerStyle={[
          estilos.contenido,
          { paddingBottom: 180, paddingTop: margenes.top + 8 },
        ]}
      >
        <View style={estilos.cabecera}>
          <Pressable
            accessibilityLabel={t('asientos.volver')}
            accessibilityRole="button"
            onPress={alVolver}
          >
            <Bloque estiloContenido={estilos.circulo} radio="pildora">
              <Icono nombre="volver" tamano="grande" />
            </Bloque>
          </Pressable>
          <Bloque estiloContenido={estilos.retencion} radio="pildora">
            <Icono nombre="reloj" tamano="grande" />
            <Text style={[tipografia.dato, { color: colores.ambarTexto }]}>
              {formatoCuenta(restantes)}
            </Text>
          </Bloque>
        </View>

        <Text style={[estilos.titulo, { color: colores.tinta }]}>
          {`${t('asientos.tituloInicio')} `}
          <Text style={{ color: colores.ambarTitular }}>
            {t('asientos.tituloResalte')}
          </Text>
        </Text>
        <Text
          style={[
            tipografia.etiqueta,
            estilos.subtitulo,
            { color: colores.tintaSuave },
          ]}
        >
          {`UCA → ${salida.destino} · ${formatoHoraCompleta(salida.salida)} · ${t(`servicios.${salida.servicio}`)}`}
        </Text>

        <View style={estilos.leyendas}>
          <Leyenda
            etiqueta={t('asientos.libre')}
            marca={<Bloque estiloContenido={estilos.muestra} radio="asiento" />}
          />
          <Leyenda
            etiqueta={t('asientos.tuyo')}
            marca={
              <View
                style={[estilos.muestra, { backgroundColor: colores.ambar }]}
              />
            }
          />
          <Leyenda
            etiqueta={t('asientos.apartado')}
            marca={
              <View
                style={[
                  estilos.muestra,
                  {
                    borderColor: colores.tintaSuave,
                    borderStyle: 'dashed',
                    borderWidth: 1.5,
                  },
                ]}
              />
            }
          />
          <Leyenda
            etiqueta={t('asientos.vendido')}
            marca={
              <View
                style={[
                  estilos.muestra,
                  { backgroundColor: conAlfa(colores.sombraRelieve, 0.12) },
                ]}
              />
            }
          />
        </View>

        {aviso && (
          <Text
            accessibilityLiveRegion="polite"
            style={[
              tipografia.pequeno,
              estilos.aviso,
              { color: colores.cancelado },
            ]}
          >
            {AVISOS[aviso]()}
          </Text>
        )}

        <View style={estilos.plano}>
          <MapaAsientos
            alElegir={alternar}
            configuracion={mapa.configuracion}
            elegidos={elegidos}
            estados={mapa.estados}
          />
        </View>
      </ScrollView>

      <View style={[estilos.pie, { bottom: margenes.bottom + 8 }]}>
        <BloqueNegro estiloContenido={estilos.contenidoPie}>
          <View style={estilos.resumen}>
            <Text
              style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
            >
              {cantidad === 0
                ? t('asientos.sinElegir')
                : `${cantidad} ${cantidad === 1 ? t('asientos.unAsiento') : t('asientos.variosAsientos')} · ${elegidos.join(' y ')}`}
            </Text>
            <Text
              style={[tipografia.datoGrande, { color: colores.sobreNegro }]}
            >
              {total ? `C$ ${total.total}` : 'C$ 0'}
            </Text>
            <Text
              style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
            >
              {pagoPendiente ? t('asientos.avisoPago') : detalleTarifa}
            </Text>
          </View>
          <BotonAccion
            alPresionar={() => establecerPagoPendiente(true)}
            deshabilitado={cantidad === 0}
            etiqueta={t('asientos.seguir')}
          />
        </BloqueNegro>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  aviso: { marginTop: espacios.doce },
  cabecera: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  centro: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  circulo: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  contenido: { paddingHorizontal: espacios.lateral },
  contenidoPie: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'space-between',
    paddingHorizontal: espacios.veinticuatro,
    paddingVertical: espacios.dieciseis,
  },
  leyenda: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  leyendas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  muestra: { borderRadius: 5, height: 16, width: 16 },
  pantalla: { flex: 1 },
  pie: { left: 14, position: 'absolute', right: 14 },
  plano: { marginTop: espacios.dieciseis },
  resumen: { flex: 1 },
  retencion: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  subtitulo: { marginTop: espacios.ocho },
  titulo: {
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 46,
    lineHeight: 48,
    marginTop: espacios.doce,
  },
});
