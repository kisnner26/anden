import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { EsqueletoIA } from '@/componentes/EsqueletoIA';
import { OrbeIA } from '@/componentes/OrbeIA';
import { TarjetaIA } from '@/componentes/TarjetaIA';
import {
  instruccionesDeEncomienda,
  leerSugerenciaEncomienda,
  type SugerenciaEncomienda,
} from '@/datos/sugerenciaEncomienda';
import { useIA } from '@/datos/useIA';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesAsistenteEncomienda {
  /** aplica lo que entendió el modelo en el formulario */
  alAplicar: (sugerencia: SugerenciaEncomienda) => void;
}

/**
 * la persona cuenta qué quiere enviar con sus palabras y la IA del teléfono (Apple Intelligence o Gemini)
 * completa el tamaño, si es frágil y la descripción; no aparece si la IA no está lista
 */
export function AsistenteEncomienda({
  alAplicar,
}: PropiedadesAsistenteEncomienda) {
  const { colores } = useTema();
  const { nombre, preguntar, usable } = useIA();
  const [texto, establecerTexto] = useState('');
  const [pensando, establecerPensando] = useState(false);
  const [fallo, establecerFallo] = useState(false);
  const [listo, establecerListo] = useState<SugerenciaEncomienda | null>(null);

  if (!usable) return null;

  async function completar() {
    const limpio = texto.trim();
    if (limpio.length < 3 || pensando) return;
    establecerPensando(true);
    establecerFallo(false);
    establecerListo(null);
    try {
      const respuesta = await preguntar(instruccionesDeEncomienda(), limpio);
      const sugerencia = leerSugerenciaEncomienda(respuesta, limpio);
      establecerListo(sugerencia);
      alAplicar(sugerencia);
    } catch {
      establecerFallo(true);
    } finally {
      establecerPensando(false);
    }
  }

  return (
    <TarjetaIA trabajando={pensando}>
      <View style={estilos.contenido} testID="asistente-encomienda">
        <View style={estilos.cabecera}>
          <OrbeIA pensando={pensando} tamano={22} />
          <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
            {rellenar(t('encomiendasIA.titulo'), { nombre })}
          </Text>
        </View>
        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {rellenar(t('encomiendasIA.detalle'), { nombre })}
        </Text>
        <Bloque estiloContenido={estilos.caja} hundido radio="loseta">
          <TextInput
            accessibilityLabel={t('encomiendasIA.campo')}
            multiline
            onChangeText={establecerTexto}
            placeholder={t('encomiendasIA.marcador')}
            placeholderTextColor={colores.tintaSuave}
            selectionColor={colores.ambarTexto}
            style={[
              estilos.entrada,
              {
                color: colores.tinta,
                fontFamily: tipografia.cuerpo.fontFamily,
                fontSize: tipografia.cuerpo.fontSize,
              },
            ]}
            value={texto}
          />
        </Bloque>
        {pensando ? (
          <EsqueletoIA />
        ) : (
          <BotonAccion
            alPresionar={() => void completar()}
            deshabilitado={texto.trim().length < 3}
            etiqueta={rellenar(t('encomiendasIA.boton'), { nombre })}
          />
        )}
        {listo ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[tipografia.subtitulo, { color: colores.tinta }]}
          >
            {rellenar(t('encomiendasIA.listo'), {
              descripcion: listo.descripcion,
              fragil: listo.fragil ? t('encomiendasIA.esFragil') : '',
              tamano: t(`encomiendas.${listo.tamano}`),
            })}
          </Text>
        ) : null}
        {fallo ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[tipografia.pequeno, { color: colores.cancelado }]}
          >
            {t('encomiendasIA.error')}
          </Text>
        ) : null}
      </View>
    </TarjetaIA>
  );
}

const estilos = StyleSheet.create({
  caja: { paddingHorizontal: espacios.dieciseis },
  cabecera: { alignItems: 'center', flexDirection: 'row', gap: espacios.ocho },
  contenido: { gap: espacios.doce, padding: espacios.dieciseis },
  entrada: {
    minHeight: 72,
    paddingVertical: espacios.doce,
    textAlignVertical: 'top',
  },
});
