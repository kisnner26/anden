import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aparece } from '@/componentes/Aparece';
import { BarraDeNivel } from '@/componentes/BarraDeNivel';
import { Bloque } from '@/componentes/Bloque';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { CifraQueSube } from '@/componentes/CifraQueSube';
import { MedallaRara } from '@/componentes/MedallaRara';
import { PaginaDeDatos } from '@/componentes/PaginaDeDatos';
import { PortadaPasaporte } from '@/componentes/PortadaPasaporte';
import { RecorridoPasaporte } from '@/componentes/RecorridoPasaporte';
import { SelloDeCiudad } from '@/componentes/SelloDeCiudad';
import { formatoFechaCorta } from '@/datos/formato';
import {
  lineasDeLectura,
  nivelDelPasaporte,
  numeroDePasaporte,
  primerViaje,
} from '@/datos/identidadPasaporte';
import { armarPasaporte, viajesHechos } from '@/datos/pasaporte';
import { iniciales, nombreCompleto, nombrePropio } from '@/datos/perfil';
import { resumenDeViajes } from '@/datos/resumenViajes';
import { useBoletos } from '@/datos/useBoletos';
import { usePerfil } from '@/datos/usePerfil';
import { useAhora } from '@/datos/useSalidas';
import { useSesion } from '@/datos/useSesion';
import { paletaPasaporte as hoja } from '@/tema/colores';
import { espacios } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesPasaporte {
  alVolver: () => void;
}

/** cuánto de una sección tiene que verse para que empiece a animarse */
const MARGEN_DE_ENTRADA = 90;

/**
 * la libreta de viajes: una tapa de cuero que se abre sobre la página de datos, el avance de nivel, la hoja de
 * visados con un sello por ciudad que se estampa al llegar a la vista, el mapa del recorrido y las medallas raras
 */
export function Pasaporte({ alVolver }: PropiedadesPasaporte) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { height: altoVentana, width } = useWindowDimensions();
  const reducido = useMovimientoReducido();
  const ahora = useAhora();
  const { boletos } = useBoletos();
  const { perfil } = usePerfil();
  const { sesion } = useSesion();

  const pasaporte = armarPasaporte(boletos, ahora);
  const hechos = viajesHechos(boletos, ahora);
  const resumen = resumenDeViajes(hechos);
  const nivel = nivelDelPasaporte(pasaporte.viajes);
  const ganados = pasaporte.raros.filter((r) => r.desbloqueado).length;
  const visitadas = pasaporte.ciudades.filter((c) => c.llegadas > 0).length;

  // el nombre del perfil; si todavía no lo llenó, el de su cuenta
  const nombre = nombrePropio(perfil.nombre || (sesion?.nombre ?? ''));
  const apellido = nombrePropio(perfil.apellido);
  const numero = numeroDePasaporte(nombre, apellido);
  const desde = primerViaje(hechos);

  const ancho = Math.round(width - 2 * espacios.lateral);
  const [abierta, establecerAbierta] = useState(reducido);
  useEffect(() => {
    if (reducido) {
      establecerAbierta(true);
      return;
    }
    const espera = setTimeout(
      () => establecerAbierta(true),
      movimiento.esperaPortada,
    );
    return () => clearTimeout(espera);
  }, [reducido]);

  // las secciones de más abajo esperan a que se vean para animarse
  const [limite, establecerLimite] = useState(altoVentana);
  const [posiciones, establecerPosiciones] = useState<Record<string, number>>(
    {},
  );
  function alDesplazar(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const abajo = e.nativeEvent.contentOffset.y + altoVentana;
    establecerLimite((previo) => (abajo > previo + 16 ? abajo : previo));
  }
  function registrar(id: string) {
    return (e: LayoutChangeEvent) => {
      const y = e.nativeEvent.layout.y;
      establecerPosiciones((previo) =>
        previo[id] === y ? previo : { ...previo, [id]: y },
      );
    };
  }
  const visible = (id: string) =>
    abierta &&
    posiciones[id] !== undefined &&
    limite > posiciones[id]! + MARGEN_DE_ENTRADA;

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: espacios.cuarentaYOcho,
          paddingTop: margenes.top + espacios.ocho,
        },
      ]}
      onScroll={alDesplazar}
      scrollEventThrottle={32}
      style={{ backgroundColor: colores.fondo }}
    >
      <CabeceraPantalla alVolver={alVolver} titulo={t('pasaporte.titulo')} />
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {pasaporte.viajes === 0
          ? t('pasaporte.vacio')
          : rellenar(t('pasaporte.resumen'), {
              sellos: ganados,
              total: pasaporte.raros.length,
              viajes: pasaporte.viajes,
            })}
      </Text>

      <View style={[estilos.libreta, { height: ancho, width: ancho }]}>
        <PaginaDeDatos
          alto={ancho}
          ancho={ancho}
          apellido={apellido}
          desde={desde ? formatoFechaCorta(new Date(desde)) : ''}
          fotoUri={perfil.fotoUri}
          iniciales={iniciales({
            apellido: perfil.apellido,
            nombre: perfil.nombre || (sesion?.nombre ?? ''),
          })}
          lineasDeLectura={lineasDeLectura(
            nombre,
            apellido,
            numero,
            pasaporte.viajes,
          )}
          nivel={t(`pasaporte.niveles.${nivel.nivel}`)}
          nombre={nombre || nombreCompleto(perfil)}
          numero={numero}
        />
        <PortadaPasaporte
          abierta={abierta}
          alAbrir={() => establecerAbierta(true)}
          alto={ancho}
          ancho={ancho}
        />
      </View>

      <Aparece indice={1}>
        <Bloque estiloContenido={estilos.cifras}>
          <CifraQueSube
            etiqueta={t('pasaporte.cifras.viajes')}
            retardo={abierta ? 0 : 400}
            valor={pasaporte.viajes}
          />
          <CifraQueSube
            etiqueta={t('pasaporte.cifras.km')}
            retardo={abierta ? 120 : 520}
            valor={resumen.kilometros}
          />
          <CifraQueSube
            etiqueta={t('pasaporte.cifras.ciudades')}
            meta={`/ ${pasaporte.ciudades.length}`}
            retardo={abierta ? 240 : 640}
            valor={visitadas}
          />
          <CifraQueSube
            etiqueta={t('pasaporte.cifras.sellos')}
            meta={`/ ${pasaporte.raros.length}`}
            retardo={abierta ? 360 : 760}
            valor={ganados}
          />
        </Bloque>
      </Aparece>

      <BarraDeNivel avance={nivel} retardo={600} />

      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {t('pasaporte.visados')}
      </Text>
      <View
        onLayout={registrar('visados')}
        style={[estilos.hoja, { backgroundColor: hoja.hoja }]}
        testID="libreta-pasaporte"
      >
        <View style={estilos.sellos}>
          {pasaporte.ciudades.map((sello, indice) => (
            <SelloDeCiudad
              activo={visible('visados')}
              ciudad={sello.ciudad}
              key={sello.ciudad}
              llegadas={sello.llegadas}
              primera={sello.primera}
              retardo={indice * 260}
            />
          ))}
        </View>
        <View style={[estilos.linea, { backgroundColor: hoja.guilloche }]} />
        <Text style={[tipografia.etiqueta, { color: hoja.tintaHojaSuave }]}>
          {t('pasaporte.recorrido')}
        </Text>
        <View onLayout={registrar('recorrido')}>
          <RecorridoPasaporte
            activo={visible('recorrido')}
            ciudades={pasaporte.ciudades}
            retardo={200}
          />
        </View>
      </View>

      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {t('pasaporte.raros')}
      </Text>
      <View onLayout={registrar('medallas')} style={estilos.medallas}>
        {pasaporte.raros.map((raro, indice) => (
          <MedallaRara
            activo={visible('medallas')}
            indice={indice}
            key={raro.id}
            raro={raro}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  cifras: {
    flexDirection: 'row',
    gap: espacios.ocho,
    paddingHorizontal: espacios.ocho,
    paddingVertical: espacios.dieciseis,
  },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  hoja: {
    borderRadius: 14,
    gap: espacios.dieciseis,
    padding: espacios.dieciseis,
  },
  libreta: { alignSelf: 'center' },
  linea: { height: 1, opacity: 0.8 },
  medallas: { gap: espacios.doce },
  sellos: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    rowGap: espacios.doce,
  },
});
