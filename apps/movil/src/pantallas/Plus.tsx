import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BloqueNegro } from '@/componentes/BloqueNegro';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { formatoFechaCorta } from '@/datos/formato';
import { useSuscripcion } from '@/datos/useSuscripcion';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesPlus {
  alVolver: () => void;
}

/** Andén Plus: el precio, el estado de la suscripción y cómo activarla o cancelarla */
export function Plus({ alVolver }: PropiedadesPlus) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { activar, cancelar, estado, plus } = useSuscripcion();

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
      <CabeceraPantalla alVolver={alVolver} titulo={t('plus.titulo')} />
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('plus.detalle')}
      </Text>

      <BloqueNegro estiloContenido={estilos.tarjeta}>
        <View style={estilos.precio}>
          <Text style={[tipografia.display, { color: colores.ambar }]}>
            {t('plus.precio')}
          </Text>
          <Text style={[tipografia.cuerpo, { color: colores.sobreNegroSuave }]}>
            {t('plus.periodo')}
          </Text>
        </View>
        <Text style={[tipografia.cuerpo, { color: colores.sobreNegro }]}>
          {plus && estado.desde
            ? rellenar(t('plus.estadoPlus'), {
                fecha: formatoFechaCorta(new Date(estado.desde)),
              })
            : t('plus.estadoGratis')}
        </Text>
      </BloqueNegro>

      {plus ? (
        <BotonAccion
          alPresionar={() => void cancelar()}
          etiqueta={t('plus.cancelar')}
        />
      ) : (
        <BotonAccion
          alPresionar={() => void activar()}
          etiqueta={t('plus.activar')}
        />
      )}
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {t('plus.notaPrueba')}
      </Text>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  precio: { alignItems: 'baseline', flexDirection: 'row', gap: espacios.ocho },
  tarjeta: { gap: espacios.doce, padding: espacios.veinticuatro },
});
