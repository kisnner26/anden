import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { CamposLugares } from '@/componentes/CampoLugar';
import { EtiquetaMuestra } from '@/componentes/EtiquetaMuestra';
import { FilaSalida } from '@/componentes/FilaSalida';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import {
  RutaFrecuente,
  SelectorFecha,
  SelectorPasajeros,
  type DiaViaje,
} from '@/componentes/SelectorViaje';
import { TarjetaProximoViaje } from '@/componentes/TarjetaProximoViaje';
import { useAvisos } from '@/datos/useAvisos';
import { usePreferenciaUbicacion } from '@/datos/ProveedorUbicacion';
import { useUbicacionCercana } from '@/datos/useUbicacionCercana';
import { useSalidas } from '@/datos/useSalidas';
import { proximaSalida } from '@/datos/salidas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesViajar {
  alAbrirAjustes?: () => void;
  alAbrirAvisos?: () => void;
  alAbrirViaje: (viajeId: string) => void;
  alElegirAsiento: (viajeId: string) => void;
}

const ESTADOS_PENDIENTES = ['abordando', 'atrasado', 'programado'];
const CANTIDAD_DIAS = 3;

function diasDesde(fecha: Date): DiaViaje[] {
  return Array.from({ length: CANTIDAD_DIAS }, (_, indice) => {
    const dia = new Date(fecha);
    dia.setDate(fecha.getDate() + indice);
    const id = [dia.getFullYear(), dia.getMonth() + 1, dia.getDate()]
      .map((parte) => parte.toString().padStart(2, '0'))
      .join('-');
    return {
      etiqueta:
        indice === 0
          ? t('viajar.hoy')
          : new Intl.DateTimeFormat('es-NI', { weekday: 'short' })
              .format(dia)
              .replace('.', ''),
      id,
      numero: dia.getDate().toString().padStart(2, '0'),
    };
  });
}

/** inicio: el próximo viaje con el bus y las salidas de hoy */
export function Viajar({
  alAbrirAjustes,
  alAbrirAvisos,
  alAbrirViaje,
  alElegirAsiento,
}: PropiedadesViajar) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const [origenId, establecerOrigenId] = useState('ter_uca');
  const [destinoId, establecerDestinoId] = useState('ter_boa');
  const { ahora, datos, salidas } = useSalidas(origenId);
  const dias = useMemo(() => diasDesde(ahora), [ahora]);
  const [fechaId, establecerFechaId] = useState(() => dias[0]?.id ?? '');
  const [pasajeros, establecerPasajeros] = useState(1);
  const { noLeidos } = useAvisos();
  const preferenciaUbicacion = usePreferenciaUbicacion();
  const ubicacionResuelta = useRef(false);
  const salidasDestino = salidas.filter(
    (salida) =>
      datos.rutas.find((ruta) => ruta.id === salida.rutaId)?.destinoId ===
      destinoId,
  );
  const proxima = proximaSalida(salidasDestino);
  const pendientes = salidasDestino
    .filter((salida) => ESTADOS_PENDIENTES.includes(salida.estado))
    .slice(0, 3);
  const origen = datos.terminales.find((terminal) => terminal.id === origenId);
  const rutasFrecuentes = datos.rutas
    .filter((ruta) => ruta.origenId === origenId)
    .slice(0, 2)
    .map((ruta) => ({
      destino: datos.terminales.find(
        (terminal) => terminal.id === ruta.destinoId,
      ),
      proxima: proximaSalida(
        salidas.filter((salida) => salida.rutaId === ruta.id),
      ),
      ruta,
    }))
    .filter(({ destino }) => destino !== undefined);
  const cambiarOrigen = (nuevoOrigenId: string) => {
    establecerOrigenId(nuevoOrigenId);
    const destinoDisponible = datos.rutas.some(
      (ruta) => ruta.origenId === nuevoOrigenId && ruta.destinoId === destinoId,
    );
    if (!destinoDisponible) {
      const primeraRuta = datos.rutas.find(
        (ruta) => ruta.origenId === nuevoOrigenId,
      );
      if (primeraRuta) establecerDestinoId(primeraRuta.destinoId);
    }
  };
  const ubicacion = useUbicacionCercana(datos.terminales, cambiarOrigen);

  useEffect(() => {
    if (
      !preferenciaUbicacion.activada ||
      preferenciaUbicacion.estado !== 'otorgado'
    ) {
      ubicacionResuelta.current = false;
      return;
    }
    if (ubicacionResuelta.current) return;
    ubicacionResuelta.current = true;
    void ubicacion.resolver();
  }, [preferenciaUbicacion.activada, preferenciaUbicacion.estado, ubicacion]);

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        { paddingBottom: 130, paddingTop: margenes.top + 8 },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <View style={estilos.cabecera}>
        <Pressable
          accessibilityLabel={t('ajustes.titulo')}
          accessibilityRole="button"
          onPress={alAbrirAjustes}
        >
          <Loseta tamano={46} variante="negra">
            <Text style={[tipografia.dato, { color: colores.sobreNegro }]}>
              A
            </Text>
          </Loseta>
        </Pressable>
        <View style={estilos.saludo}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {t('viajar.saludo')}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('viajar.pregunta')}
          </Text>
        </View>
        <Pressable
          accessibilityLabel={
            noLeidos > 0
              ? `${t('viajar.avisos')}, ${noLeidos} ${t('avisos.noLeido').toLowerCase()}`
              : t('viajar.avisos')
          }
          accessibilityRole="button"
          onPress={alAbrirAvisos}
        >
          <Bloque estiloContenido={estilos.campana} radio="pildora">
            <Icono nombre="campana" tamano="ilustracion" />
          </Bloque>
          {noLeidos > 0 && (
            <View
              style={[estilos.puntoCampana, { backgroundColor: colores.ambar }]}
              testID="campana-sin-leer"
            />
          )}
        </Pressable>
      </View>

      {proxima ? (
        <TarjetaProximoViaje
          ahora={ahora}
          alVerBoleto={() => alElegirAsiento(proxima.viajeId)}
          salida={proxima}
        />
      ) : (
        <Text
          style={[
            tipografia.cuerpo,
            estilos.vacio,
            { color: colores.tintaSuave },
          ]}
        >
          {t('viajar.sinSalidas')}
        </Text>
      )}

      <CamposLugares
        alCambiarDestino={establecerDestinoId}
        alCambiarOrigen={cambiarOrigen}
        destinoId={destinoId}
        etiquetaDestino={t('viajar.destino')}
        etiquetaIntercambiar={t('viajar.intercambiarLugares')}
        etiquetaOrigen={t('viajar.origen')}
        lugares={datos.terminales}
        marcador={t('viajar.elegirTerminal')}
        origenId={origenId}
        textoSinResultados={t('viajar.sinTerminales')}
      />

      <View style={estilos.planificacion}>
        <SelectorFecha
          alElegir={establecerFechaId}
          dias={dias}
          etiqueta={t('viajar.cuando')}
          seleccionado={fechaId}
        />
        <SelectorPasajeros
          alCambiar={establecerPasajeros}
          cantidad={pasajeros}
          etiqueta={t('viajar.pasajeros')}
          etiquetaAumentar={t('viajar.agregarPasajero')}
          etiquetaDisminuir={t('viajar.quitarPasajero')}
        />
      </View>

      {origen && rutasFrecuentes.length > 0 && (
        <View style={estilos.rutas}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {t('viajar.rutasFrecuentes')}
          </Text>
          {rutasFrecuentes.map(({ destino, proxima: salida, ruta }) => (
            <RutaFrecuente
              alPresionar={() => establecerDestinoId(ruta.destinoId)}
              destino={destino?.ciudad ?? ''}
              etiqueta={t('viajar.usarRuta').replace(
                '{{destino}}',
                destino?.ciudad ?? '',
              )}
              key={ruta.id}
              origen={origen.ciudad}
              proximaHora={
                salida
                  ? t('viajar.proximaRuta').replace(
                      '{{hora}}',
                      salida.salida.toLocaleTimeString('es-NI', {
                        hour: '2-digit',
                        hour12: false,
                        minute: '2-digit',
                      }),
                    )
                  : undefined
              }
            />
          ))}
        </View>
      )}

      <View style={estilos.seccion}>
        <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
          {t('viajar.salidasDeHoy')}
        </Text>
        <EtiquetaMuestra />
      </View>

      {pendientes.length === 0 && (
        <Text
          style={[
            tipografia.cuerpo,
            estilos.vacio,
            { color: colores.tintaSuave },
          ]}
        >
          {t('viajar.sinSalidasOrigen')}
        </Text>
      )}
      {pendientes.map((salida) => (
        <FilaSalida
          alPresionar={alAbrirViaje}
          key={salida.viajeId}
          salida={salida}
        />
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  puntoCampana: {
    borderRadius: 6,
    height: 12,
    position: 'absolute',
    right: 4,
    top: 4,
    width: 12,
  },
  cabecera: { alignItems: 'center', flexDirection: 'row', gap: espacios.doce },
  campana: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  contenido: { paddingHorizontal: espacios.lateral },
  saludo: { flex: 1 },
  planificacion: {
    gap: espacios.dieciseis,
    marginTop: espacios.veinticuatro,
  },
  rutas: { gap: espacios.doce, marginTop: espacios.veinticuatro },
  seccion: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: espacios.veinticuatro,
  },
  vacio: { marginTop: espacios.treintaYDos, textAlign: 'center' },
});
