import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Aparece } from '@/componentes/Aparece';
import { Bloque } from '@/componentes/Bloque';
import { BloqueNegro } from '@/componentes/BloqueNegro';
import { BotonAccion } from '@/componentes/BotonAccion';
import { ContadorPasajeros } from '@/componentes/ContadorPasajeros';
import { ControlSegmentado } from '@/componentes/ControlSegmentado';
import { FichaCiudadIA } from '@/componentes/FichaCiudadIA';
import { ResumenIA } from '@/componentes/ResumenIA';
import { SaltoAlCambiar } from '@/componentes/SaltoAlCambiar';
import { SelectorCiudadFoto } from '@/componentes/SelectorCiudadFoto';
import { Icono } from '@/componentes/Icono';
import { MarcoPestana } from '@/componentes/MarcoPestana';
import { SelectorSalida } from '@/componentes/SelectorSalida';
import { TrayectoCorredor } from '@/componentes/TrayectoCorredor';
import { formatoHora, sufijoHora } from '@/datos/formato';
import { contextoDelDia } from '@/datos/resumenDelDia';
import { llegadaEstimada } from '@/datos/planificador';
import {
  CIUDADES_RED,
  corredorDe,
  type CiudadRed,
  type SentidoRed,
} from '@/datos/redRutas';
import { totalReserva } from '@/datos/reserva';
import { usePlanificador } from '@/datos/usePlanificador';
import { obtenerMuestra } from '@/datos/useSalidas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesRutas {
  /** abre el mapa del corredor */
  alAbrirRuta?: (id: string) => void;
  /** abre la solicitud de una encomienda */
  alAbrirEncomiendas?: () => void;
  /** lleva a elegir los asientos de la salida escogida */
  alElegirAsientos?: (viajeId: string) => void;
}

/**
 * planificador de viaje: se elige la ciudad y el sentido, se ve cuánto dura y qué salidas hay,
 * se escoge una y la cantidad de pasajeros, y la pantalla dice a qué hora se llega (ETA) y cuánto cuesta
 */
export function Rutas({
  alAbrirEncomiendas,
  alAbrirRuta,
  alElegirAsientos,
}: PropiedadesRutas) {
  const { colores } = useTema();
  const [ciudad, establecerCiudad] = useState<CiudadRed>('Boaco');
  const [sentido, establecerSentido] = useState<SentidoRed>('ida');
  const [elegida, establecerElegida] = useState<string | null>(null);
  const [cantidad, establecerCantidad] = useState(1);
  const corredor = corredorDe({ ciudad, sentido });
  const plan = usePlanificador(corredor);
  const salida =
    plan.salidas.find((candidata) => candidata.viajeId === elegida) ??
    plan.salidas[0];
  const precio = salida
    ? totalReserva(obtenerMuestra(), salida.viajeId, cantidad)
    : null;
  const llegada =
    salida && plan.duracionMin !== null
      ? llegadaEstimada(salida, plan.duracionMin)
      : null;

  return (
    <MarcoPestana estiloContenido={estilos.contenido}>
      <Aparece indice={0}>
        <View style={estilos.titular}>
          <Text style={[tipografia.display, { color: colores.tinta }]}>
            {t('rutas.titulo')}.
          </Text>
          <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
            {t('rutas.subtitulo')}
          </Text>
        </View>
      </Aparece>

      <View style={estilos.selectores}>
        <SelectorCiudadFoto
          alCambiar={(clave) => {
            establecerCiudad(clave);
            establecerElegida(null);
          }}
          opciones={CIUDADES_RED.map((nombre) => ({
            clave: nombre,
            etiqueta: nombre,
          }))}
          valor={ciudad}
        />
        <ControlSegmentado
          alCambiar={(clave) => {
            establecerSentido(clave);
            establecerElegida(null);
          }}
          opciones={[
            { clave: 'ida', etiqueta: t('rutas.desdeManagua') },
            { clave: 'vuelta', etiqueta: t('rutas.haciaManagua') },
          ]}
          valor={sentido}
        />
      </View>

      <Aparece indice={1}>
        <TrayectoCorredor
          destino={corredor.destino}
          distanciaKm={plan.distanciaKm}
          duracionMin={plan.duracionMin}
          origen={corredor.origen}
          recorrido={`${corredor.id}${salida?.viajeId ?? ''}`}
        />
      </Aparece>

      <View style={estilos.seccion}>
        <Text style={[tipografia.titulo, { color: colores.tinta }]}>
          {rellenar(t('rutasVisual.conoce'), { ciudad })}
        </Text>
        <FichaCiudadIA ciudad={ciudad} />
      </View>

      <View style={estilos.seccion}>
        <Text style={[tipografia.titulo, { color: colores.tinta }]}>
          {t('rutas.elegirSalida')}
        </Text>
        {plan.deManana && plan.salidas.length > 0 && (
          <Text style={[tipografia.pequeno, { color: colores.ambarTexto }]}>
            {t('rutas.salidasManana')}
          </Text>
        )}
        {plan.salidas.length === 0 ? (
          <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
            {t('rutas.sinSalidas')}
          </Text>
        ) : (
          <SelectorSalida
            alElegir={establecerElegida}
            conDia={plan.deManana}
            elegida={salida?.viajeId ?? null}
            salidas={plan.salidas}
          />
        )}
      </View>

      {plan.salidas.length > 0 && (
        <ResumenIA
          contexto={contextoDelDia(plan.salidas, corredor.origen)}
          pedido={rellenar(t('rutasVisual.resumenPedido'), {
            destino: corredor.destino,
            origen: corredor.origen,
          })}
          titulo={t('rutasVisual.resumenTitulo')}
        />
      )}

      {salida && (
        <>
          <ContadorPasajeros
            alCambiar={establecerCantidad}
            cantidad={cantidad}
          />

          <Aparece indice={2}>
            <BloqueNegro estiloContenido={estilos.resumen}>
              <View style={estilos.horas}>
                <View style={estilos.hora}>
                  <Text
                    style={[
                      tipografia.etiqueta,
                      { color: colores.sobreNegroSuave },
                    ]}
                  >
                    {t('rutas.salis')}
                  </Text>
                  <Text
                    style={[
                      tipografia.datoGrande,
                      { color: colores.sobreNegro },
                    ]}
                  >
                    {formatoHora(salida.salida)}
                  </Text>
                  <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
                    {sufijoHora(salida.salida)}
                  </Text>
                </View>
                <Icono
                  color={colores.ambar}
                  nombre="siguiente"
                  tamano="grande"
                />
                <View style={estilos.hora}>
                  <Text
                    style={[
                      tipografia.etiqueta,
                      { color: colores.sobreNegroSuave },
                    ]}
                  >
                    {t('rutas.llegas')}
                  </Text>
                  <Text
                    style={[
                      tipografia.datoGrande,
                      { color: colores.sobreNegro },
                    ]}
                  >
                    {llegada ? formatoHora(llegada) : '—'}
                  </Text>
                  <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
                    {llegada
                      ? `${sufijoHora(llegada)}${llegada.getDate() !== salida.salida.getDate() ? ` · ${t('rutas.manana')}` : ''}`
                      : ' '}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  estilos.regla,
                  { backgroundColor: colores.sobreNegroSuave },
                ]}
              />

              <View style={estilos.total}>
                <Text
                  style={[
                    tipografia.etiqueta,
                    { color: colores.sobreNegroSuave },
                  ]}
                >
                  {t('rutas.totalAbordo')}
                </Text>
                <SaltoAlCambiar valor={precio?.total ?? null}>
                  <Text style={[tipografia.display, { color: colores.ambar }]}>
                    {precio ? `C$ ${precio.total}` : '—'}
                  </Text>
                </SaltoAlCambiar>
                {precio && (
                  <Text
                    style={[
                      tipografia.pequeno,
                      { color: colores.sobreNegroSuave },
                    ]}
                  >
                    {rellenar(t('rutas.porPasajero'), {
                      unitario: precio.unitario,
                    })}
                  </Text>
                )}
              </View>

              <BotonAccion
                alPresionar={() => alElegirAsientos?.(salida.viajeId)}
                deshabilitado={salida.asientosLibres === 0}
                etiqueta={t('rutas.elegirAsientos')}
                icono="boleto"
              />
            </BloqueNegro>
          </Aparece>
        </>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => alAbrirRuta?.(corredor.id)}
        style={estilos.mapa}
      >
        <Text style={[tipografia.subtitulo, { color: colores.ambarTexto }]}>
          {t('rutas.verMapa')}
        </Text>
        <Icono color={colores.ambarTexto} nombre="siguiente" tamano="mediano" />
      </Pressable>

      <Pressable accessibilityRole="button" onPress={alAbrirEncomiendas}>
        <Bloque estiloContenido={estilos.encomienda}>
          <View style={estilos.textoEncomienda}>
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {t('encomiendas.entrada')}
            </Text>
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {t('encomiendas.entradaDetalle')}
            </Text>
          </View>
          <Icono nombre="siguiente" tamano="mediano" />
        </Bloque>
      </Pressable>

      <Text
        style={[
          tipografia.pequeno,
          estilos.aviso,
          { color: colores.tintaSuave },
        ]}
      >
        {t('rutas.datosPendientesDetalle')}
      </Text>
    </MarcoPestana>
  );
}

const estilos = StyleSheet.create({
  aviso: { textAlign: 'center' },
  contenido: { gap: espacios.veinticuatro },
  encomienda: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
    padding: espacios.dieciseis,
  },
  hora: { alignItems: 'center', flex: 1, gap: espacios.cuatro },
  horas: { alignItems: 'center', flexDirection: 'row' },
  mapa: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.ocho,
    justifyContent: 'center',
    minHeight: 48,
  },
  regla: { height: 1, opacity: 0.4 },
  resumen: { gap: espacios.dieciseis, padding: espacios.veinticuatro },
  seccion: { gap: espacios.doce },
  selectores: { gap: espacios.doce },
  textoEncomienda: { flex: 1, gap: espacios.cuatro },
  titular: { gap: espacios.ocho },
  total: { alignItems: 'center', gap: espacios.cuatro },
});
