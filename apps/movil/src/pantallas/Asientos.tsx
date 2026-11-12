import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { Icono } from '@/componentes/Icono';
import { MapaAsientos } from '@/componentes/MapaAsientos';
import { PieReserva } from '@/componentes/PieReserva';
import { ProgresoReserva } from '@/componentes/ProgresoReserva';
import { formatoFechaCorta, formatoHoraCompleta } from '@/datos/formato';
import { formatoCuenta, useCuentaRegresiva } from '@/datos/useCuentaRegresiva';
import { useMapaAsientos } from '@/datos/useMapaAsientos';
import { useSalidas } from '@/datos/useSalidas';
import { useSeleccionAsientos } from '@/datos/useSeleccionAsientos';
import { disposicionPantalla, espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesAsientos {
  alSeguir: (asientos: number[]) => void;
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
export function Asientos({ alSeguir, alVolver, viajeId }: PropiedadesAsientos) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const mapa = useMapaAsientos(viajeId);
  const { datos, salidas } = useSalidas();
  const { alternar, aviso, elegidos, total } = useSeleccionAsientos(viajeId);
  const restantes = useCuentaRegresiva(SEGUNDOS_RETENCION);
  const salida = salidas.find((candidata) => candidata.viajeId === viajeId);
  const ruta = datos.rutas.find((candidata) => candidata.id === salida?.rutaId);
  const origen = datos.terminales.find(
    (terminal) => terminal.id === ruta?.origenId,
  );

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
          {
            paddingBottom: disposicionPantalla.espacioPieReserva,
            paddingTop: margenes.top + espacios.ocho,
          },
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

        <ProgresoReserva paso={1} />

        <Text
          style={[
            tipografia.titularPantalla,
            estilos.titulo,
            { color: colores.tinta },
          ]}
        >
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
          {`${origen?.nombre ?? ''} → ${salida.destino} · ${formatoFechaCorta(salida.salida)}, ${formatoHoraCompleta(salida.salida)} · ${t(`servicios.${salida.servicio}`)}`}
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
                  estilos.muestraVendido,
                  { backgroundColor: colores.barroOscuro },
                ]}
              >
                <View
                  style={[
                    estilos.tachon,
                    { backgroundColor: colores.tintaSuave },
                  ]}
                />
              </View>
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

      <PieReserva estiloContenido={estilos.contenidoPie}>
        <View style={estilos.resumen}>
          <Text
            style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
          >
            {cantidad === 0
              ? t('asientos.totalEtiqueta')
              : `${cantidad} ${cantidad === 1 ? t('asientos.unAsiento') : t('asientos.variosAsientos')} · ${elegidos.join(' y ')}`}
          </Text>
          <Text style={[tipografia.datoGrande, { color: colores.sobreNegro }]}>
            {total ? `C$ ${total.total}` : 'C$ 0'}
          </Text>
          <Text
            style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
          >
            {detalleTarifa}
          </Text>
        </View>
        <BotonAccion
          alPresionar={() => alSeguir([...elegidos].sort((a, b) => a - b))}
          deshabilitado={cantidad === 0}
          etiqueta={t('asientos.seguir')}
        />
      </PieReserva>
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
    height: tamanosControl.toqueMinimo,
    justifyContent: 'center',
    width: tamanosControl.toqueMinimo,
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
  muestraVendido: { alignItems: 'center', justifyContent: 'center' },
  tachon: {
    height: espacios.trazoDoble,
    transform: [{ rotate: '-45deg' }],
    width: espacios.dieciseis,
  },
  pantalla: { flex: 1 },
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
  titulo: { marginTop: espacios.doce },
});
