import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aparece } from '@/componentes/Aparece';
import { Bloque } from '@/componentes/Bloque';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { SelloDeCiudad } from '@/componentes/SelloDeCiudad';
import { formatoFechaCorta } from '@/datos/formato';
import { armarPasaporte } from '@/datos/pasaporte';
import { useBoletos } from '@/datos/useBoletos';
import { useAhora } from '@/datos/useSalidas';
import { conAlfa } from '@/tema/alfa';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesPasaporte {
  alVolver: () => void;
}

/** la libreta de viajes: un sello por cada ciudad a la que llegaste y sellos raros por cómo viajás */
export function Pasaporte({ alVolver }: PropiedadesPasaporte) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const ahora = useAhora();
  const { boletos } = useBoletos();
  const pasaporte = armarPasaporte(boletos, ahora);
  const ganados = pasaporte.raros.filter((r) => r.desbloqueado).length;

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

      <Bloque estiloContenido={estilos.libreta} testID="libreta-pasaporte">
        <View style={estilos.sellos}>
          {pasaporte.ciudades.map((sello, indice) => (
            <Aparece indice={indice} key={sello.ciudad}>
              <SelloDeCiudad
                ciudad={sello.ciudad}
                llegadas={sello.llegadas}
                primera={sello.primera}
              />
            </Aparece>
          ))}
        </View>
      </Bloque>

      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {t('pasaporte.raros')}
      </Text>
      {pasaporte.raros.map((raro) => (
        <View
          accessibilityLabel={`${t(`pasaporte.raro.${raro.id}.titulo`)}. ${t(`pasaporte.raro.${raro.id}.detalle`)}`}
          accessible
          key={raro.id}
          style={[
            estilos.raro,
            {
              borderColor: raro.desbloqueado
                ? colores.ambar
                : conAlfa(colores.tinta, 0.14),
              opacity: raro.desbloqueado ? 1 : 0.55,
            },
          ]}
        >
          <View style={estilos.textoRaro}>
            <Text style={[tipografia.nombreFila, { color: colores.tinta }]}>
              {t(`pasaporte.raro.${raro.id}.titulo`)}
            </Text>
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {t(`pasaporte.raro.${raro.id}.detalle`)}
            </Text>
          </View>
          <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
            {raro.desbloqueado && raro.cuando
              ? formatoFechaCorta(new Date(raro.cuando))
              : t('pasaporte.bloqueado')}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { gap: espacios.doce, paddingHorizontal: espacios.lateral },
  libreta: { padding: espacios.dieciseis },
  raro: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: espacios.doce,
    padding: espacios.doce,
  },
  sellos: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacios.doce,
    justifyContent: 'space-around',
  },
  textoRaro: { flex: 1, gap: 2 },
});
