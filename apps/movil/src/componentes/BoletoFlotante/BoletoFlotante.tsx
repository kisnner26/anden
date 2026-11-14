import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { FotoDestino } from '@/componentes/FotoDestino';
import { formatoFechaCorta, formatoHoraCompleta } from '@/datos/formato';
import type { BoletoGuardado } from '@/datos/reserva';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesBoletoFlotante {
  guardado: BoletoGuardado;
}

/** el boleto en chiquito, con la foto del destino: es el que vuela de un teléfono al otro al transferirlo */
export function BoletoFlotante({ guardado }: PropiedadesBoletoFlotante) {
  const { colores } = useTema();
  const { boleto, resumen } = guardado;
  const salida = new Date(resumen.salida);
  return (
    <LinearGradient
      colors={[colores.bloqueNegroClaro, colores.bloqueNegro]}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={[estilos.cara, { borderColor: conAlfa(colores.luzRelieve, 0.16) }]}
      testID="boleto-flotante"
    >
      <FotoDestino
        destino={resumen.destino}
        estilo={estilos.foto}
        origen={resumen.origen}
        radio="tarjeta"
      >
        <View style={estilos.sobreFoto}>
          <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
            {t('boleto.hacia')}
          </Text>
          <Text style={[tipografia.titulo, { color: colores.sobreNegro }]}>
            {resumen.destino}
          </Text>
        </View>
      </FotoDestino>
      <View style={estilos.datos}>
        <View style={estilos.dato}>
          <Text
            style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
          >
            {t('boleto.sale')}
          </Text>
          <Text style={[tipografia.subtitulo, { color: colores.sobreNegro }]}>
            {`${formatoFechaCorta(salida)} · ${formatoHoraCompleta(salida)}`}
          </Text>
        </View>
        <View style={estilos.dato}>
          <Text
            style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
          >
            {t('boletos.asientoCorto')}
          </Text>
          <Text style={[tipografia.dato, { color: colores.ambar }]}>
            {boleto.asiento}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  cara: {
    borderRadius: radios.bloqueNegro,
    borderWidth: 1,
    gap: espacios.doce,
    overflow: 'hidden',
    padding: espacios.ocho,
  },
  dato: { flex: 1, gap: 2 },
  datos: { flexDirection: 'row', gap: espacios.doce, padding: espacios.doce },
  foto: { height: 112, justifyContent: 'flex-end' },
  sobreFoto: { gap: 2, padding: espacios.doce },
});
