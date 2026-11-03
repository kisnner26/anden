import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useState } from 'react';
import { terminalMasCercana } from '@anden/dominio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { CamposLugares } from '@/componentes/CampoLugar';
import { EtiquetaMuestra } from '@/componentes/EtiquetaMuestra';
import { FilaSalida } from '@/componentes/FilaSalida';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { TarjetaProximoViaje } from '@/componentes/TarjetaProximoViaje';
import { useAvisos } from '@/datos/useAvisos';
import { useSalidas } from '@/datos/useSalidas';
import { obtenerUbicacionActual } from '@/datos/ubicacion';
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
  const [destinoId, establecerDestinoId] = useState('ter_gra');
  const [estadoUbicacion, establecerEstadoUbicacion] = useState<
    | { tipo: 'confirmada'; mensaje: string }
    | { tipo: 'denegada'; mensaje: string }
    | null
  >(null);
  const { ahora, datos, salidas } = useSalidas(origenId);
  const { noLeidos } = useAvisos();
  const salidasDestino = salidas.filter(
    (salida) =>
      datos.rutas.find((ruta) => ruta.id === salida.rutaId)?.destinoId ===
      destinoId,
  );
  const proxima = proximaSalida(salidasDestino);
  const pendientes = salidasDestino
    .filter((salida) => ESTADOS_PENDIENTES.includes(salida.estado))
    .slice(0, 3);
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
  const usarUbicacion = async () => {
    const resultado = await obtenerUbicacionActual();
    if (resultado.estado !== 'otorgado') {
      establecerEstadoUbicacion({
        mensaje: t('viajar.ubicacionDenegada'),
        tipo: 'denegada',
      });
      return;
    }
    const cercana = terminalMasCercana(datos.terminales, resultado.punto);
    if (cercana) {
      cambiarOrigen(cercana.terminal.id);
      establecerEstadoUbicacion({
        mensaje: `${t('viajar.ubicacionCercana')}: ${cercana.terminal.nombre}, ${t('viajar.ubicacionDistancia').replace('{{km}}', cercana.distanciaKm.toFixed(1))}`,
        tipo: 'confirmada',
      });
    }
  };

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

      <View style={estilos.seccion}>
        <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
          {t('viajar.origen')}
        </Text>
        <Pressable
          accessibilityLabel={t('viajar.usarUbicacion')}
          accessibilityRole="button"
          onPress={usarUbicacion}
          style={[estilos.ubicacion, { backgroundColor: colores.ambar }]}
        >
          <Text style={[tipografia.pequeno, { color: colores.sobreAmbar }]}>
            {t('viajar.usarUbicacion')}
          </Text>
        </Pressable>
      </View>
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
      />
      {estadoUbicacion && (
        <View>
          <Text
            accessibilityLiveRegion="polite"
            style={[
              tipografia.pequeno,
              {
                color:
                  estadoUbicacion.tipo === 'denegada'
                    ? colores.cancelado
                    : colores.aTiempo,
              },
            ]}
          >
            {estadoUbicacion.mensaje}
          </Text>
          {estadoUbicacion.tipo === 'denegada' && (
            <Pressable
              accessibilityLabel={t('viajar.abrirAjustes')}
              accessibilityRole="button"
              onPress={() => Linking.openSettings()}
            >
              <Text style={[tipografia.pequeno, { color: colores.ambarTexto }]}>
                {t('viajar.abrirAjustes')}
              </Text>
            </Pressable>
          )}
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
  ubicacion: {
    borderRadius: 999,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: espacios.doce,
  },
  saludo: { flex: 1 },
  seccion: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: espacios.veinticuatro,
  },
  vacio: { marginTop: espacios.treintaYDos, textAlign: 'center' },
});
