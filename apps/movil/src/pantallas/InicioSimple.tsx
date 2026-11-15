import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { formatoFechaCorta, formatoHoraCompleta } from '@/datos/formato';
import { nombrePropio } from '@/datos/perfil';
import { usePerfil } from '@/datos/usePerfil';
import { useBoletos } from '@/datos/useBoletos';
import { useAhora } from '@/datos/useSalidas';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

const DESTINOS = ['Managua', 'Boaco', 'Juigalpa'] as const;

export interface PropiedadesInicioSimple {
  alAbrirBoleto: (boletoId: string) => void;
  /** lleva a buscar viajes hacia una ciudad */
  alBuscar: (destino: string) => void;
  /** sale del modo simple y vuelve al inicio de siempre */
  alSalir: () => void;
}

/** el inicio simple: botones enormes, pocas palabras y un solo camino para pedir ayuda a la familia */
export function InicioSimple({
  alAbrirBoleto,
  alBuscar,
  alSalir,
}: PropiedadesInicioSimple) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const ahora = useAhora();
  const { boletos } = useBoletos();
  const { perfil } = usePerfil();
  const proximo = boletos
    .filter(
      (b) =>
        b.boleto.estado === 'vigente' &&
        new Date(b.resumen.salida).getTime() >= ahora.getTime(),
    )
    .sort(
      (a, b) =>
        new Date(a.resumen.salida).getTime() -
        new Date(b.resumen.salida).getTime(),
    )[0];

  function pedirAyuda() {
    void Share.share({
      message: rellenar(t('inicioSimple.mensajeFamilia'), {
        nombre: nombrePropio(perfil.nombre),
      }),
    });
  }

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: espacios.cuarentaYOcho,
          paddingTop: margenes.top + espacios.veinticuatro,
        },
      ]}
      style={{ backgroundColor: colores.fondo }}
      testID="inicio-simple"
    >
      <Text style={[tipografia.titularPantalla, { color: colores.tinta }]}>
        {t('inicioSimple.titulo')}
      </Text>

      {proximo ? (
        <Pressable
          accessibilityLabel={rellenar(t('inicioSimple.miBoleto'), {
            destino: proximo.resumen.destino,
            dia: formatoFechaCorta(new Date(proximo.resumen.salida)),
            hora: formatoHoraCompleta(new Date(proximo.resumen.salida)),
          })}
          accessibilityRole="button"
          onPress={() => alAbrirBoleto(proximo.boleto.id)}
          style={[estilos.grande, { backgroundColor: colores.bloqueNegro }]}
        >
          <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
            {t('inicioSimple.tuBoleto')}
          </Text>
          <Text
            style={[tipografia.titularBoleto, { color: colores.sobreNegro }]}
          >
            {proximo.resumen.destino}
          </Text>
          <Text style={[tipografia.titulo, { color: colores.sobreNegro }]}>
            {`${formatoFechaCorta(new Date(proximo.resumen.salida))}, ${formatoHoraCompleta(new Date(proximo.resumen.salida))}`}
          </Text>
        </Pressable>
      ) : null}

      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {t('inicioSimple.adonde')}
      </Text>
      {DESTINOS.map((ciudad) => (
        <Pressable
          accessibilityLabel={rellenar(t('inicioSimple.ir'), { ciudad })}
          accessibilityRole="button"
          key={ciudad}
          onPress={() => alBuscar(ciudad)}
        >
          <Bloque estiloContenido={estilos.destino}>
            <Text style={[tipografia.titularResumen, { color: colores.tinta }]}>
              {rellenar(t('inicioSimple.ir'), { ciudad })}
            </Text>
          </Bloque>
        </Pressable>
      ))}

      <Pressable
        accessibilityRole="button"
        onPress={pedirAyuda}
        style={[estilos.ayuda, { borderColor: colores.ambar }]}
      >
        <Text style={[tipografia.titulo, { color: colores.tinta }]}>
          {t('inicioSimple.pedirAyuda')}
        </Text>
        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {t('inicioSimple.pedirAyudaDetalle')}
        </Text>
      </Pressable>

      <Pressable accessibilityRole="button" onPress={alSalir}>
        <View style={estilos.salir}>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('inicioSimple.salir')}
          </Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  ayuda: {
    borderRadius: radios.tarjeta,
    borderWidth: 2,
    gap: 4,
    padding: espacios.veinticuatro,
  },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  destino: {
    alignItems: 'center',
    minHeight: 96,
    justifyContent: 'center',
    padding: espacios.dieciseis,
  },
  grande: {
    borderRadius: radios.tarjeta,
    gap: 4,
    padding: espacios.veinticuatro,
  },
  salir: { alignItems: 'center', minHeight: 44, justifyContent: 'center' },
});
