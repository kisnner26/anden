import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Autobus } from '@/componentes/Autobus';
import { Bloque } from '@/componentes/Bloque';
import { BloqueNegro } from '@/componentes/BloqueNegro';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { Icono } from '@/componentes/Icono';
import { LineaRuta } from '@/componentes/LineaRuta';
import { Loseta } from '@/componentes/Loseta';
import { estadoTablero } from '@/componentes/TableroSalidas';
import { formatoDuracion, formatoHoraCompleta } from '@/datos/formato';
import { useDetalleViaje } from '@/datos/useDetalleViaje';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesDetalleViaje {
  alElegirAsiento: (viajeId: string) => void;
  alVerChofer: (choferId: string) => void;
  alVolver: () => void;
  viajeId: string;
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const { colores } = useTema();
  return (
    <View style={estilos.dato}>
      <Text style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}>
        {etiqueta}
      </Text>
      <Text style={[tipografia.datoGrande, { color: colores.sobreNegro }]}>
        {valor}
      </Text>
    </View>
  );
}

/** el viaje completo: horas, unidad con su placa, chofer, recorrido y la tarifa antes de elegir asiento */
export function DetalleViaje({
  alElegirAsiento,
  alVerChofer,
  alVolver,
  viajeId,
}: PropiedadesDetalleViaje) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const detalle = useDetalleViaje(viajeId);

  if (!detalle) {
    return (
      <View style={[estilos.centro, { backgroundColor: colores.fondo }]}>
        <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
          {t('detalle.noExiste')}
        </Text>
      </View>
    );
  }

  const { chofer, salida, unidad } = detalle;
  const estado = estadoTablero(salida);
  const comodidades = unidad.comodidades
    .map((clave) => t(`detalle.comodidades.${clave}`))
    .join(' · ');
  const nota =
    chofer.promedio === null
      ? t('detalle.sinCalificacion')
      : `${chofer.promedio} · ${chofer.totalCalificaciones} ${t('detalle.opiniones')}`;

  return (
    <View style={[estilos.pantalla, { backgroundColor: colores.fondo }]}>
      <ScrollView
        contentContainerStyle={[
          estilos.contenido,
          { paddingBottom: 200, paddingTop: margenes.top + 8 },
        ]}
      >
        <CabeceraPantalla alVolver={alVolver} titulo={salida.destino} />
        <Text
          style={[
            tipografia.etiqueta,
            estilos.ruta,
            { color: colores.tintaSuave },
          ]}
        >
          {`UCA → ${salida.destino} · ${t(`servicios.${salida.servicio}`)}`}
        </Text>

        <View style={estilos.contenedorHero}>
          <View pointerEvents="none" style={estilos.heroBus}>
            <Autobus ancho={200} letrero={salida.destino.toUpperCase()} />
          </View>
          <BloqueNegro estiloContenido={estilos.hero}>
            <View style={estilos.fila}>
              <Dato
                etiqueta={t('detalle.sale')}
                valor={formatoHoraCompleta(salida.salida)}
              />
              <Dato
                etiqueta={t('detalle.llega')}
                valor={formatoHoraCompleta(detalle.llegada)}
              />
            </View>
            <View style={estilos.fila}>
              <Text
                style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
              >
                {`${t('detalle.duracion')} ${formatoDuracion(detalle.duracionMin)} · ${detalle.distanciaKm} ${t('detalle.km')}`}
              </Text>
              <Text style={[tipografia.etiqueta, { color: estado.color }]}>
                {estado.texto}
              </Text>
            </View>
          </BloqueNegro>
        </View>

        <Text
          style={[
            tipografia.subtitulo,
            estilos.seccion,
            { color: colores.tinta },
          ]}
        >
          {t('detalle.unidad')}
        </Text>
        <Bloque estiloContenido={estilos.unidad}>
          <Loseta>
            <Icono
              nombre={
                salida.servicio === 'expreso'
                  ? 'rayo'
                  : salida.servicio === 'taxi-interlocal'
                    ? 'taxi'
                    : 'pestanaViajar'
              }
              color={colores.tinta}
              colorDetalle={colores.barroClaro}
              tamano="ilustracion"
            />
          </Loseta>
          <View style={estilos.textoUnidad}>
            <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
              {t('detalle.placa')}
            </Text>
            <Bloque estiloContenido={estilos.placa} hundido radio="loseta">
              <Text
                accessibilityLabel={`${t('detalle.placa')} ${unidad.placa}`}
                style={[tipografia.datoGrande, { color: colores.tinta }]}
              >
                {unidad.placa}
              </Text>
            </Bloque>
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {`${unidad.cooperativa} · ${unidad.plazas} ${t('detalle.plazas')}`}
            </Text>
            {comodidades.length > 0 && (
              <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
                {comodidades}
              </Text>
            )}
          </View>
        </Bloque>

        <Text
          style={[
            tipografia.subtitulo,
            estilos.seccion,
            { color: colores.tinta },
          ]}
        >
          {t('detalle.chofer')}
        </Text>
        <Pressable
          accessibilityLabel={`${t('detalle.chofer')} ${chofer.nombre}, ${t('detalle.verPerfil')}`}
          accessibilityRole="button"
          onPress={() => alVerChofer(chofer.id)}
        >
          <Bloque estiloContenido={estilos.chofer}>
            <Loseta tamano={56} variante="negra">
              <Text
                style={[tipografia.datoGrande, { color: colores.sobreNegro }]}
              >
                {chofer.iniciales}
              </Text>
            </Loseta>
            <View style={estilos.textoChofer}>
              <Text style={[estilos.nombre, { color: colores.tinta }]}>
                {chofer.nombre}
              </Text>
              <View style={estilos.nota}>
                <Icono
                  etiquetaAccesible={t('vitrina.iconoEstrella')}
                  nombre="estrella"
                  tamano="mediano"
                />
                <Text
                  style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                >
                  {nota}
                </Text>
              </View>
              <Text
                style={[
                  tipografia.pequeno,
                  {
                    color: chofer.licenciaVerificada
                      ? colores.aTiempo
                      : colores.tintaSuave,
                  },
                ]}
              >
                {chofer.licenciaVerificada
                  ? t('detalle.licenciaVerificada')
                  : t('detalle.licenciaSinVerificar')}
              </Text>
            </View>
            <Icono color={colores.tinta} nombre="siguiente" tamano="grande" />
          </Bloque>
        </Pressable>

        <Text
          style={[
            tipografia.subtitulo,
            estilos.seccion,
            { color: colores.tinta },
          ]}
        >
          {t('detalle.recorrido')}
        </Text>
        <Bloque estiloContenido={estilos.recorrido}>
          <LineaRuta paradas={detalle.paradas} />
        </Bloque>
      </ScrollView>

      <View style={[estilos.pie, { bottom: margenes.bottom + 8 }]}>
        <BloqueNegro estiloContenido={estilos.contenidoPie}>
          <View>
            <Text
              style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
            >
              {t('detalle.tarifa')}
            </Text>
            <Text
              style={[tipografia.datoGrande, { color: colores.sobreNegro }]}
            >
              {salida.tarifa === null ? '—' : `C$ ${salida.tarifa}`}
            </Text>
            <Text
              style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
            >
              {t('detalle.porPasajero')}
            </Text>
          </View>
          <BotonAccion
            alPresionar={() => alElegirAsiento(salida.viajeId)}
            deshabilitado={!salida.ventaAbierta}
            etiqueta={
              salida.ventaAbierta
                ? t('detalle.elegirAsiento')
                : t('detalle.ventaCerrada')
            }
          />
        </BloqueNegro>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  chofer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    padding: espacios.doce,
  },
  contenido: { gap: espacios.doce, paddingHorizontal: espacios.lateral },
  contenidoPie: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'space-between',
    paddingHorizontal: espacios.veinticuatro,
    paddingVertical: espacios.dieciseis,
  },
  dato: { gap: 2 },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contenedorHero: { marginTop: 84 },
  hero: {
    gap: espacios.doce,
    paddingBottom: espacios.dieciseis,
    paddingHorizontal: espacios.lateral,
    paddingTop: 44,
  },
  heroBus: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: -84,
    zIndex: 2,
  },
  nombre: { fontFamily: 'Archivo_600SemiBold', fontSize: 18, lineHeight: 22 },
  nota: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  pantalla: { flex: 1 },
  pie: { left: 14, position: 'absolute', right: 14 },
  placa: {
    alignSelf: 'flex-start',
    paddingHorizontal: espacios.dieciseis,
    paddingVertical: espacios.ocho,
  },
  recorrido: { padding: espacios.dieciseis },
  ruta: { marginTop: -4 },
  seccion: { marginTop: espacios.doce },
  textoChofer: { flex: 1, gap: 2 },
  textoUnidad: { flex: 1, gap: espacios.cuatro },
  unidad: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
    padding: espacios.dieciseis,
  },
});
