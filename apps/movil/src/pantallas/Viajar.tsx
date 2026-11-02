import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { EtiquetaMuestra } from '@/componentes/EtiquetaMuestra';
import { FilaSalida } from '@/componentes/FilaSalida';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { TarjetaProximoViaje } from '@/componentes/TarjetaProximoViaje';
import { useSalidas } from '@/datos/useSalidas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesViajar {
  alElegirViaje: (viajeId: string) => void;
}

const ESTADOS_PENDIENTES = ['abordando', 'atrasado', 'programado'];

/** inicio: el próximo viaje con el bus y las salidas de hoy */
export function Viajar({ alElegirViaje }: PropiedadesViajar) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { ahora, proxima, salidas } = useSalidas();
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
        <Loseta tamano={46} variante="negra">
          <Text style={[tipografia.dato, { color: colores.sobreNegro }]}>
            A
          </Text>
        </Loseta>
        <View style={estilos.saludo}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {t('viajar.saludo')}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('viajar.pregunta')}
          </Text>
        </View>
        <Bloque estiloContenido={estilos.campana} radio="pildora">
          <Icono
            etiquetaAccesible={t('viajar.avisos')}
            nombre="campana"
            tamano="ilustracion"
          />
        </Bloque>
      </View>

      {proxima ? (
        <TarjetaProximoViaje
          ahora={ahora}
          alVerBoleto={() => alElegirViaje(proxima.viajeId)}
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
          alPresionar={alElegirViaje}
          key={salida.viajeId}
          salida={salida}
        />
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
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
