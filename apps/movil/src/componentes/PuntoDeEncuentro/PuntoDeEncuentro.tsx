import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { abrirPuntoEnMapa } from '@/datos/puntoEncuentro';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesPuntoDeEncuentro {
  /** el Plus Code completo; vacío mientras el conductor no lo confirma */
  codigo: string;
}

/** dónde se sube al bus: el Plus Code completo y un botón que lo abre en el mapa */
export function PuntoDeEncuentro({ codigo }: PropiedadesPuntoDeEncuentro) {
  const { colores } = useTema();
  const [fallo, establecerFallo] = useState(false);

  async function abrir() {
    establecerFallo(!(await abrirPuntoEnMapa(codigo)));
  }

  return (
    <Bloque estiloContenido={estilos.bloque}>
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('punto.titulo')}
      </Text>
      {codigo === '' ? (
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('punto.porConfirmar')}
        </Text>
      ) : (
        <View style={estilos.fila}>
          <Text selectable style={[tipografia.dato, { color: colores.tinta }]}>
            {codigo}
          </Text>
          <Pressable accessibilityRole="button" onPress={() => void abrir()}>
            <Text style={[tipografia.subtitulo, { color: colores.ambarTexto }]}>
              {t('punto.abrirMapa')}
            </Text>
          </Pressable>
        </View>
      )}
      {fallo && (
        <Text
          accessibilityLiveRegion="polite"
          style={[tipografia.pequeno, { color: colores.cancelado }]}
        >
          {t('punto.sinMapa')}
        </Text>
      )}
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  bloque: { gap: espacios.ocho, padding: espacios.dieciseis },
  fila: { gap: espacios.ocho },
});
