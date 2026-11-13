import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aparece } from '@/componentes/Aparece';
import { Bloque } from '@/componentes/Bloque';
import { ControlSegmentado } from '@/componentes/ControlSegmentado';
import { GraficoBarras } from '@/componentes/GraficoBarras';
import {
  actividadPorDia,
  cierresDelPeriodo,
  resumirActividad,
  type PeriodoAnalitica,
} from '@/datos/analiticaConductor';
import { formatoFechaCorta, formatoHora } from '@/datos/formato';
import { useCierres } from '@/datos/useCierres';
import { useDetalleViaje } from '@/datos/useDetalleViaje';
import { useAhora } from '@/datos/useSalidas';
import { useSesion } from '@/datos/useSesion';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

const PERIODOS: readonly PeriodoAnalitica[] = [7, 30, 90];

/** el destino del viaje cerrado; si ya no está disponible, queda el identificador */
function DestinoDelCierre({ viajeId }: { viajeId: string }) {
  const { colores } = useTema();
  const detalle = useDetalleViaje(viajeId);
  return (
    <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
      {detalle?.salida.destino ?? viajeId}
    </Text>
  );
}

function Indicador({
  detalle,
  etiqueta,
  valor,
}: {
  detalle?: string;
  etiqueta: string;
  valor: string;
}) {
  const { colores } = useTema();
  return (
    <Bloque
      estilo={estilos.indicador}
      estiloContenido={estilos.contenidoIndicador}
    >
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {etiqueta}
      </Text>
      <Text style={[tipografia.dato, { color: colores.tinta }]}>{valor}</Text>
      {detalle !== undefined && (
        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {detalle}
        </Text>
      )}
    </Bloque>
  );
}

/** el análisis del conductor: ganancias, viajes y pasajeros por día, con indicadores del período */
export function ConductorHistorial() {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { sesion } = useSesion();
  const { cierres } = useCierres();
  const ahora = useAhora();
  const [periodo, establecerPeriodo] = useState<PeriodoAnalitica>(7);
  const propios = cierres.filter(
    (cierre) => cierre.choferId === sesion?.choferId,
  );
  const delPeriodo = cierresDelPeriodo(propios, periodo, ahora).sort((a, b) =>
    b.cerradoEn.localeCompare(a.cerradoEn),
  );
  const resumen = resumirActividad(propios, periodo, ahora);
  const dias = actividadPorDia(delPeriodo, periodo, ahora);
  const cadaEtiqueta = periodo === 7 ? 1 : periodo === 30 ? 5 : 15;
  const etiquetaDia = (dia: string) => dia.slice(8);
  const mejorDia = resumen.mejorDia;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: 120,
          paddingTop: margenes.top + espacios.veinticuatro,
        },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <Text style={[tipografia.titulo, { color: colores.tinta }]}>
        {t('conductorHistorial.titulo')}.
      </Text>
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('conductorHistorial.detalle')}
      </Text>

      <ControlSegmentado
        alCambiar={(clave) =>
          establecerPeriodo(Number(clave) as PeriodoAnalitica)
        }
        opciones={PERIODOS.map((dias_) => ({
          clave: String(dias_),
          etiqueta: t(`conductorHistorial.periodo${dias_}`),
        }))}
        valor={String(periodo)}
      />

      {propios.length === 0 ? (
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('conductorHistorial.sinCierres')}
        </Text>
      ) : (
        <>
          <View style={estilos.indicadores}>
            <Indicador
              etiqueta={t('conductorHistorial.cobrado')}
              valor={`C$ ${resumen.cobrado}`}
            />
            <Indicador
              etiqueta={t('conductorHistorial.viajes')}
              valor={String(resumen.viajes)}
            />
            <Indicador
              etiqueta={t('conductorHistorial.pasajeros')}
              valor={String(resumen.pasajeros)}
            />
            <Indicador
              etiqueta={t('conductorHistorial.porViaje')}
              valor={`C$ ${Math.round(resumen.porViaje)}`}
            />
            <Indicador
              etiqueta={t('conductorHistorial.pasajerosPorViaje')}
              valor={resumen.pasajerosPorViaje.toFixed(1)}
            />
            <Indicador
              detalle={`${t('conductorHistorial.pendiente')}: C$ ${resumen.pendiente}`}
              etiqueta={t('conductorHistorial.cobranza')}
              valor={`${Math.round(resumen.cobranza * 100)}%`}
            />
          </View>

          <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
            {t('conductorHistorial.gananciasTitulo')}
          </Text>
          <Bloque estiloContenido={estilos.grafico}>
            <GraficoBarras
              barras={dias.map((dia) => ({
                etiqueta: etiquetaDia(dia.dia),
                valor: dia.cobrado,
              }))}
              cadaEtiqueta={cadaEtiqueta}
              descripcion={t('conductorHistorial.gananciasDescripcion')}
            />
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {mejorDia
                ? `${t('conductorHistorial.mejorDia')}: ${rellenar(
                    t('conductorHistorial.mejorDiaValor'),
                    { cobrado: mejorDia.cobrado, dia: mejorDia.dia },
                  )}`
                : t('conductorHistorial.sinMejorDia')}
            </Text>
          </Bloque>

          <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
            {t('conductorHistorial.pasajerosTitulo')}
          </Text>
          <Bloque estiloContenido={estilos.grafico}>
            <GraficoBarras
              barras={dias.map((dia) => ({
                etiqueta: etiquetaDia(dia.dia),
                valor: dia.pasajeros,
              }))}
              cadaEtiqueta={cadaEtiqueta}
              descripcion={t('conductorHistorial.pasajerosDescripcion')}
            />
          </Bloque>

          <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
            {t('conductorHistorial.recientesSeccion')}
          </Text>
          {delPeriodo.slice(0, 10).map((cierre, indice) => {
            const fecha = new Date(cierre.cerradoEn);
            return (
              <Aparece indice={indice} key={cierre.viajeId}>
                <Bloque estiloContenido={estilos.fila}>
                  <View style={estilos.texto}>
                    <DestinoDelCierre viajeId={cierre.viajeId} />
                    <Text
                      style={[
                        tipografia.pequeno,
                        { color: colores.tintaSuave },
                      ]}
                    >
                      {`${formatoFechaCorta(fecha)} · ${formatoHora(fecha)}`}
                    </Text>
                    <Text
                      style={[
                        tipografia.pequeno,
                        { color: colores.tintaSuave },
                      ]}
                    >
                      {rellenar(t('conductorHistorial.fila'), {
                        pagados: cierre.pagados,
                        pasajeros: cierre.pasajeros,
                      })}
                    </Text>
                    {cierre.sinPagar.length > 0 && (
                      <Text
                        style={[
                          tipografia.etiqueta,
                          { color: colores.cancelado },
                        ]}
                      >
                        {rellenar(t('conductorHistorial.sinPagar'), {
                          cantidad: cierre.sinPagar.length,
                        })}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[tipografia.dato, { color: colores.ambarTexto }]}
                  >
                    {rellenar(t('conductorHistorial.cobradoFila'), {
                      cobrado: cierre.cobrado,
                    })}
                  </Text>
                </Bloque>
              </Aparece>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { gap: espacios.doce, paddingHorizontal: espacios.lateral },
  contenidoIndicador: { gap: 2, padding: espacios.ocho },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    padding: espacios.doce,
  },
  grafico: { gap: espacios.doce, padding: espacios.dieciseis },
  indicador: { flexBasis: '30%', flexGrow: 1 },
  indicadores: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.doce },
  texto: { flex: 1, gap: 2 },
});
