import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aparece } from '@/componentes/Aparece';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { formatoHoraCompleta } from '@/datos/formato';
import { resumenAnual, type ResumenAnual as Datos } from '@/datos/resumenAnual';
import { useBoletos } from '@/datos/useBoletos';
import { useAhora } from '@/datos/useSalidas';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

const DIAS = [
  'domingos',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábados',
] as const;
const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

export interface PropiedadesResumenAnual {
  alVolver: () => void;
}

/** el texto que se comparte: lo mismo que dice la tarjeta, en líneas cortas */
export function textoParaCompartir(datos: Datos): string {
  const lineas = [
    rellenar(t('resumenAnual.compartirTitulo'), { anio: datos.anio }),
    rellenar(t('resumenAnual.viajes'), { viajes: datos.viajes }),
    rellenar(t('resumenAnual.kilometros'), { km: datos.kilometros }),
  ];
  if (datos.horaFavorita !== null) {
    lineas.push(
      rellenar(t('resumenAnual.hora'), {
        hora: formatoHoraCompleta(new Date(2000, 0, 1, datos.horaFavorita)),
      }),
    );
  }
  if (datos.asientoFavorito !== null) {
    lineas.push(
      rellenar(t('resumenAnual.asiento'), { asiento: datos.asientoFavorito }),
    );
  }
  return lineas.join('\n');
}

/** el año en viajes: una tarjeta oscura con lo que más se repitió, lista para compartir */
export function ResumenAnual({ alVolver }: PropiedadesResumenAnual) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const ahora = useAhora();
  const { boletos } = useBoletos();
  const datos = resumenAnual(boletos, ahora.getFullYear(), ahora);

  const cifras: { clave: string; texto: string; valor: string }[] = [];
  if (datos.viajes > 0) {
    cifras.push(
      {
        clave: 'km',
        texto: t('resumenAnual.km'),
        valor: String(datos.kilometros),
      },
      {
        clave: 'ciudades',
        texto: t('resumenAnual.ciudades'),
        valor: String(datos.ciudades.length),
      },
    );
    if (datos.horaFavorita !== null)
      cifras.push({
        clave: 'hora',
        texto: t('resumenAnual.horaCorta'),
        valor: formatoHoraCompleta(new Date(2000, 0, 1, datos.horaFavorita)),
      });
    if (datos.asientoFavorito !== null)
      cifras.push({
        clave: 'asiento',
        texto: t('resumenAnual.asientoCorto'),
        valor: String(datos.asientoFavorito),
      });
    if (datos.diaFavorito !== null)
      cifras.push({
        clave: 'dia',
        texto: t('resumenAnual.diaCorto'),
        valor: DIAS[datos.diaFavorito] ?? '',
      });
    if (datos.mesTop !== null)
      cifras.push({
        clave: 'mes',
        texto: t('resumenAnual.mesCorto'),
        valor: MESES[datos.mesTop] ?? '',
      });
  }

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: espacios.cuarentaYOcho,
          paddingTop: margenes.top + espacios.ocho,
        },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <CabeceraPantalla alVolver={alVolver} titulo={t('resumenAnual.titulo')} />
      {datos.viajes === 0 ? (
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('resumenAnual.vacio')}
        </Text>
      ) : (
        <>
          <View
            accessibilityLabel={textoParaCompartir(datos)}
            accessible
            style={[estilos.tarjeta, { backgroundColor: colores.bloqueNegro }]}
            testID="tarjeta-resumen-anual"
          >
            <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
              {datos.anio}
            </Text>
            <Text
              style={[tipografia.numeroGigante, { color: colores.sobreNegro }]}
            >
              {datos.viajes}
            </Text>
            <Text style={[tipografia.subtitulo, { color: colores.sobreNegro }]}>
              {datos.viajes === 1
                ? t('resumenAnual.viajeUno')
                : t('resumenAnual.viajesVarios')}
            </Text>
            {datos.destinoFavorito ? (
              <Text style={[tipografia.pequeno, { color: colores.ambar }]}>
                {rellenar(t('resumenAnual.favorito'), {
                  ciudad: datos.destinoFavorito,
                })}
              </Text>
            ) : null}
          </View>
          <View style={estilos.rejilla}>
            {cifras.map((cifra, indice) => (
              <Aparece indice={indice} key={cifra.clave}>
                <View
                  style={[
                    estilos.dato,
                    { backgroundColor: colores.barroClaro },
                  ]}
                >
                  <Text style={[tipografia.titulo, { color: colores.tinta }]}>
                    {cifra.valor}
                  </Text>
                  <Text
                    style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                  >
                    {cifra.texto}
                  </Text>
                </View>
              </Aparece>
            ))}
          </View>
          <BotonAccion
            alPresionar={() =>
              void Share.share({ message: textoParaCompartir(datos) })
            }
            etiqueta={t('resumenAnual.compartir')}
            icono="siguiente"
          />
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { gap: espacios.doce, paddingHorizontal: espacios.lateral },
  dato: {
    borderRadius: radios.tarjeta,
    gap: 2,
    minWidth: 140,
    padding: espacios.dieciseis,
  },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.doce },
  tarjeta: {
    borderRadius: radios.tarjeta,
    gap: 2,
    padding: espacios.veinticuatro,
  },
});
