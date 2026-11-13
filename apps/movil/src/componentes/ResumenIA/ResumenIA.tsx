import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EsqueletoIA } from '@/componentes/EsqueletoIA';
import { OrbeIA } from '@/componentes/OrbeIA';
import { TarjetaIA } from '@/componentes/TarjetaIA';
import { TextoEscribiendo } from '@/componentes/TextoEscribiendo';
import { instruccionesDelAsistente } from '@/datos/contextoIA';
import { useIA } from '@/datos/useIA';
import { useTurista } from '@/datos/useTurista';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesResumenIA {
  /** los datos reales sobre los que se pregunta; es lo único que ve el modelo */
  contexto: string;
  /** lo que se le pide al modelo */
  pedido: string;
  /** cómo se llama el botón que lo pide */
  titulo: string;
}

/**
 * un resumen que el modelo del teléfono arma a pedido, con el marco y las animaciones de la IA;
 * no aparece si la IA no está activada o no está disponible
 */
export function ResumenIA({ contexto, pedido, titulo }: PropiedadesResumenIA) {
  const { colores } = useTema();
  const { nombre, preguntar, usable } = useIA();
  const { turista } = useTurista();
  const [pensando, establecerPensando] = useState(false);
  const [respuesta, establecerRespuesta] = useState<string | null>(null);
  const [fallo, establecerFallo] = useState(false);

  if (!usable) return null;

  async function pedirResumen() {
    if (pensando) return;
    establecerPensando(true);
    establecerFallo(false);
    try {
      establecerRespuesta(
        (
          await preguntar(
            instruccionesDelAsistente(contexto, { turista }),
            pedido,
          )
        ).trim(),
      );
    } catch {
      establecerFallo(true);
    } finally {
      establecerPensando(false);
    }
  }

  // toda la tarjeta es el botón: antes solo el texto del título respondía y tocar el resto no hacía nada
  const puedePedir = !pensando && respuesta === null;

  return (
    <TarjetaIA trabajando={pensando}>
      <Pressable
        accessibilityLabel={puedePedir ? titulo : undefined}
        accessibilityRole={puedePedir ? 'button' : undefined}
        disabled={!puedePedir}
        onPress={() => void pedirResumen()}
        style={estilos.cuerpo}
      >
        <View style={estilos.cabecera}>
          <OrbeIA pensando={pensando} tamano={22} />
          <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
            {rellenar(t('ia.potenciadoPor'), { nombre })}
          </Text>
        </View>
        {pensando ? (
          <EsqueletoIA />
        ) : respuesta ? (
          <TextoEscribiendo
            estilo={[tipografia.cuerpo, { color: colores.tinta }]}
            texto={respuesta}
          />
        ) : (
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {titulo}
          </Text>
        )}
        {fallo && (
          <Text
            accessibilityLiveRegion="polite"
            style={[tipografia.pequeno, { color: colores.cancelado }]}
          >
            {t('ia.error')}
          </Text>
        )}
        {respuesta !== null && (
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {rellenar(t('ia.nota'), { nombre })}
          </Text>
        )}
      </Pressable>
    </TarjetaIA>
  );
}

const estilos = StyleSheet.create({
  cabecera: { alignItems: 'center', flexDirection: 'row', gap: espacios.ocho },
  cuerpo: { gap: espacios.ocho, padding: espacios.dieciseis },
});
