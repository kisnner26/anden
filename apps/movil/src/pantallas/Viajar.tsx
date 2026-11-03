import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { EtiquetaMuestra } from '@/componentes/EtiquetaMuestra';
import { FilaSalida } from '@/componentes/FilaSalida';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { TarjetaProximoViaje } from '@/componentes/TarjetaProximoViaje';
import { useAvisos } from '@/datos/useAvisos';
import { useSalidas } from '@/datos/useSalidas';
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
  const { ahora, proxima, salidas } = useSalidas();
  const { noLeidos } = useAvisos();
  const pendientes = salidas
    .filter((salida) => ESTADOS_PENDIENTES.includes(salida.estado))
    .slice(0, 3);

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
          {t('viajar.salidasDeHoy')}
        </Text>
        <EtiquetaMuestra />
      </View>

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
  seccion: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: espacios.veinticuatro,
  },
  vacio: { marginTop: espacios.treintaYDos, textAlign: 'center' },
});
