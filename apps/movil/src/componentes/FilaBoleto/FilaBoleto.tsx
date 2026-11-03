import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { formatoFechaCorta, formatoHoraCompleta } from '@/datos/formato';
import type { BoletoGuardado } from '@/datos/reserva';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesFilaBoleto {
  alPresionar: (boletoId: string) => void;
  guardado: BoletoGuardado;
}

/** un boleto guardado en la lista: destino, cuándo sale, asiento y código */
export function FilaBoleto({ alPresionar, guardado }: PropiedadesFilaBoleto) {
  const { colores } = useTema();
  const { boleto, resumen } = guardado;
  const salida = new Date(resumen.salida);
  const cuando = `${formatoFechaCorta(salida)}, ${formatoHoraCompleta(salida)}`;

  return (
    <Pressable
      accessibilityLabel={`${resumen.destino}, ${cuando}, ${t('boletos.asientoCorto')} ${boleto.asiento}`}
      accessibilityRole="button"
      onPress={() => alPresionar(boleto.id)}
    >
      <Bloque estilo={estilos.fila} estiloContenido={estilos.contenido}>
        <Loseta>
          <Icono nombre="boleto" tamano="ilustracion" />
        </Loseta>
        <View style={estilos.texto}>
          <Text style={[estilos.destino, { color: colores.tinta }]}>
            {resumen.destino}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {cuando}
          </Text>
          <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
            {`${t('boletos.asientoCorto')} ${boleto.asiento} · ${boleto.codigo}`}
          </Text>
        </View>
        <Icono color={colores.tinta} nombre="siguiente" tamano="grande" />
      </Bloque>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    padding: espacios.doce,
  },
  destino: { fontFamily: 'Archivo_600SemiBold', fontSize: 18, lineHeight: 22 },
  fila: { marginTop: 10 },
  texto: { flex: 1, gap: 2 },
});
