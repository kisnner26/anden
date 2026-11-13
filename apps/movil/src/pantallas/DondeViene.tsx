import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { ControlSegmentado } from '@/componentes/ControlSegmentado';
import { Icono } from '@/componentes/Icono';
import { MapaCorredor } from '@/componentes/MapaCorredor';
import { TarjetaBusEnCamino } from '@/componentes/TarjetaBusEnCamino';
import { formatoHora, formatoHoraCompleta, sufijoHora } from '@/datos/formato';
import { busesHacia } from '@/datos/busesEnCamino';
import { useBusesEnCamino } from '@/datos/useBusesEnCamino';
import { useSalidas } from '@/datos/useSalidas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesDondeViene {
  alAbrirViaje?: (viajeId: string) => void;
  alVolver: () => void;
  /** ciudad en la que empieza elegida */
  ciudadInicial?: string;
}

/**
 * para quien espera en una terminal: qué buses vienen hacia ahí, a cuántos kilómetros están, a qué
 * hora se estima que llegan y por dónde van, con la fuente del dato siempre a la vista
 */
export function DondeViene({
  alAbrirViaje,
  alVolver,
  ciudadInicial = 'Managua',
}: PropiedadesDondeViene) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { datos, salidas } = useSalidas();
  const [ciudad, establecerCiudad] = useState(ciudadInicial);
  const [elegido, establecerElegido] = useState<string | null>(null);
  const { ahora, buses } = useBusesEnCamino(ciudad);
  const terminal = datos.terminales.find((x) => x.ciudad === ciudad);
  const seleccionado =
    buses.find((bus) => bus.salida.viajeId === elegido) ?? buses[0];
  const origenSel = seleccionado
    ? datos.terminales.find((x) => x.ciudad === seleccionado.salida.origen)
    : undefined;

  // si no viene ninguno, el que sale más pronto hacia aquí aunque falte mucho
  const proximoLejano = salidas
    .filter(
      (s) =>
        s.destino === ciudad && s.estado === 'programado' && s.salida > ahora,
    )
    .sort((a, b) => a.salida.getTime() - b.salida.getTime())[0];

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: margenes.bottom + espacios.cuarentaYOcho,
          paddingTop: margenes.top + espacios.ocho,
        },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <CabeceraPantalla alVolver={alVolver} titulo={t('dondeViene.titulo')} />
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('dondeViene.subtitulo')}
      </Text>

      <View style={estilos.grupo}>
        <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
          {t('dondeViene.estoyEn')}
        </Text>
        <ControlSegmentado
          alCambiar={(clave) => {
            establecerCiudad(clave);
            establecerElegido(null);
          }}
          opciones={datos.terminales.map((x) => ({
            clave: x.ciudad,
            etiqueta: x.ciudad,
          }))}
          valor={ciudad}
        />
        {terminal && (
          <Text
            style={[
              tipografia.pequeno,
              estilos.centrado,
              { color: colores.tintaSuave },
            ]}
          >
            {terminal.nombre}
          </Text>
        )}
      </View>

      {seleccionado && terminal && origenSel && (
        <View style={estilos.grupo}>
          <Text style={[tipografia.titulo, { color: colores.tinta }]}>
            {t('dondeViene.mapaTitulo')}
          </Text>
          <MapaCorredor
            etiquetaDestino={t('dondeViene.estasAca')}
            simulacion={{
              bus: seleccionado.ubicacion,
              destino: {
                codigo: terminal.codigo,
                coordenadas: terminal.coordenadas,
                nombre: terminal.nombre,
              },
              origen: {
                codigo: origenSel.codigo,
                coordenadas: origenSel.coordenadas,
                nombre: origenSel.nombre,
              },
              trazo: seleccionado.trazo,
            }}
          />
        </View>
      )}

      <View style={estilos.grupo}>
        <Text style={[tipografia.titulo, { color: colores.tinta }]}>
          {rellenar(t('dondeViene.vienenHacia'), {
            terminal: terminal?.nombre ?? ciudad,
          })}
        </Text>
        {buses.length === 0 ? (
          <Bloque estiloContenido={estilos.vacio} hundido radio="loseta">
            <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
              {rellenar(t('dondeViene.vacio'), { lugar: ciudad })}
            </Text>
            {proximoLejano && (
              <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
                {rellenar(t('dondeViene.vacioProximo'), {
                  hora: formatoHoraCompleta(proximoLejano.salida),
                  llegada: `${formatoHora(
                    new Date(
                      proximoLejano.salida.getTime() +
                        (busesHacia(
                          ciudad,
                          [proximoLejano],
                          proximoLejano.salida,
                        )[0]?.minutosRestantes ?? 0) *
                          60_000,
                    ),
                  )} ${sufijoHora(proximoLejano.salida)}`,
                  origen: proximoLejano.origen,
                })}
              </Text>
            )}
          </Bloque>
        ) : (
          buses.map((bus) => (
            <TarjetaBusEnCamino
              alElegir={() => {
                establecerElegido(bus.salida.viajeId);
              }}
              bus={bus}
              elegido={bus.salida.viajeId === seleccionado?.salida.viajeId}
              key={bus.salida.viajeId}
              lugar={ciudad}
            />
          ))
        )}
      </View>

      {seleccionado && alAbrirViaje && (
        <Pressable
          accessibilityRole="button"
          onPress={() => alAbrirViaje(seleccionado.salida.viajeId)}
          style={estilos.ver}
        >
          <Text style={[tipografia.subtitulo, { color: colores.ambarTexto }]}>
            {t('dondeViene.abrir')}
          </Text>
          <Icono
            color={colores.ambarTexto}
            nombre="siguiente"
            tamano="mediano"
          />
        </Pressable>
      )}

      <Bloque estiloContenido={estilos.nota} hundido radio="loseta">
        <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
          {t('dondeViene.comoSeCalcula')}
        </Text>
        <Text style={[tipografia.pequeno, { color: colores.tinta }]}>
          {`${t('dondeViene.enVivo')}: ${t('dondeViene.enVivoDetalle')}`}
        </Text>
        <Text style={[tipografia.pequeno, { color: colores.tinta }]}>
          {`${t('dondeViene.segunHorario')}: ${t('dondeViene.segunHorarioDetalle')}`}
        </Text>
      </Bloque>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  centrado: { textAlign: 'center' },
  contenido: {
    gap: espacios.veinticuatro,
    paddingHorizontal: espacios.lateral,
  },
  grupo: { gap: espacios.doce },
  nota: { gap: espacios.ocho, padding: espacios.dieciseis },
  vacio: { gap: espacios.ocho, padding: espacios.dieciseis },
  ver: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.ocho,
    justifyContent: 'center',
    minHeight: 48,
  },
});
