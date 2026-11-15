import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { formatoDiaCorto, formatoHoraCompleta } from '@/datos/formato';
import type { Salida } from '@/datos/salidas';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesAlternativasDeViaje {
  alElegir: (salida: Salida) => void;
  /** el viaje al que se está pasando ahora; mientras tanto no se puede tocar otro */
  eligiendo: string | null;
  error?: string | null;
  salidas: readonly Salida[];
}

/** las salidas a las que quien se quedó sin viaje se pasa con un toque: mismo trayecto, sin pagar nada más */
export function AlternativasDeViaje({
  alElegir,
  eligiendo,
  error,
  salidas,
}: PropiedadesAlternativasDeViaje) {
  const { colores } = useTema();
  return (
    <Bloque estiloContenido={estilos.contenido} testID="alternativas-de-viaje">
      <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
        {t('alternativas.titulo')}
      </Text>
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {salidas.length > 0
          ? t('alternativas.detalle')
          : t('alternativas.ninguna')}
      </Text>
      {salidas.map((salida) => (
        <Pressable
          accessibilityLabel={rellenar(t('alternativas.pasarme'), {
            dia: formatoDiaCorto(salida.salida),
            hora: formatoHoraCompleta(salida.salida),
          })}
          accessibilityRole="button"
          disabled={eligiendo !== null}
          key={salida.viajeId}
          onPress={() => alElegir(salida)}
          style={({ pressed }) => [
            estilos.fila,
            { borderColor: conAlfa(colores.tinta, 0.14) },
            (pressed || eligiendo === salida.viajeId) && {
              backgroundColor: conAlfa(colores.ambar, 0.14),
            },
          ]}
        >
          <View style={estilos.hora}>
            <Text style={[tipografia.dato, { color: colores.tinta }]}>
              {formatoHoraCompleta(salida.salida)}
            </Text>
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {formatoDiaCorto(salida.salida)}
            </Text>
          </View>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {rellenar(t('alternativas.libres'), {
              cantidad: salida.asientosLibres,
            })}
          </Text>
          <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
            {eligiendo === salida.viajeId
              ? t('alternativas.pasando')
              : t('alternativas.elegir')}
          </Text>
        </Pressable>
      ))}
      {error ? (
        <Text style={[tipografia.pequeno, { color: colores.cancelado }]}>
          {error}
        </Text>
      ) : null}
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  contenido: { gap: espacios.ocho, padding: espacios.dieciseis },
  fila: {
    alignItems: 'center',
    borderRadius: radios.loseta,
    borderWidth: 1,
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'space-between',
    padding: espacios.doce,
  },
  hora: { flex: 1 },
});
