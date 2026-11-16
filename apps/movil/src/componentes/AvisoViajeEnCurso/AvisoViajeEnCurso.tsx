import { StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { Presionable } from '@/componentes/Presionable';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesAvisoViajeEnCurso {
  alSeguir: () => void;
  destino: string;
}

/** la tarjeta que aparece en el inicio cuando el chofer ya inició el viaje de la persona */
export function AvisoViajeEnCurso({
  alSeguir,
  destino,
}: PropiedadesAvisoViajeEnCurso) {
  const { colores } = useTema();
  return (
    <Presionable
      accessibilityLabel={`${t('viajeEnCurso.enCamino')}. ${t('viajeEnCurso.seguirViaje')}`}
      accessibilityRole="button"
      onPress={alSeguir}
    >
      <Bloque estiloContenido={estilos.fila} testID="aviso-viaje-en-curso">
        <View style={[estilos.punto, { backgroundColor: colores.ambar }]} />
        <View style={estilos.texto}>
          <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
            {t('viajeEnCurso.enCamino')}
          </Text>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {rellenar(t('viajeEnCurso.aviso'), { destino })}
          </Text>
        </View>
        <Icono nombre="siguiente" tamano="mediano" />
      </Bloque>
    </Presionable>
  );
}

const estilos = StyleSheet.create({
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    padding: espacios.dieciseis,
  },
  punto: { borderRadius: 999, height: 12, width: 12 },
  texto: { flex: 1, gap: 2 },
});
