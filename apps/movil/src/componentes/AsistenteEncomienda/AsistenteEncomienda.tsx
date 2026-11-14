import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { OrbeIA } from '@/componentes/OrbeIA';
import { TarjetaIA } from '@/componentes/TarjetaIA';
import {
  instruccionesDeEncomienda,
  leerSugerenciaEncomienda,
  sugerenciaPorPalabras,
  type SugerenciaEncomienda,
} from '@/datos/sugerenciaEncomienda';
import { formatearTelefonoNi } from '@anden/dominio';
import { useIA } from '@/datos/useIA';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

/** cuánto se espera después de que la persona deja de escribir antes de entender lo que escribió */
export const PAUSA_PARA_ENTENDER_MS = 1200;
const MINIMO_DE_LETRAS = 10;

export interface PropiedadesAsistenteEncomienda {
  /** aplica lo que se entendió en el formulario; recibe también el texto que se entendió */
  alAplicar: (sugerencia: SugerenciaEncomienda, texto: string) => void;
  /** avisa cada vez que la persona escribe, para que el formulario sepa qué se está enviando */
  alEscribir?: (texto: string) => void;
}

/** lo que se entendió, en frases cortas para mostrar como etiquetas */
export function etiquetasDeLoEntendido(
  sugerencia: SugerenciaEncomienda,
): string[] {
  const etiquetas: string[] = [t(`encomiendas.${sugerencia.tamano}`)];
  if (sugerencia.fragil) etiquetas.push(t('encomiendas.fragil'));
  if (sugerencia.destinatario) {
    etiquetas.push(`${t('encomiendas.para')} ${sugerencia.destinatario}`);
  }
  if (sugerencia.ciudad) {
    etiquetas.push(
      sugerencia.sentido === 'vuelta'
        ? `${sugerencia.ciudad} → Managua`
        : `Managua → ${sugerencia.ciudad}`,
    );
  }
  const telefono = sugerencia.telefono
    ? formatearTelefonoNi(sugerencia.telefono)
    : null;
  if (telefono) etiquetas.push(telefono);
  return etiquetas;
}

/**
 * la persona cuenta qué envía con sus palabras y la app lo entiende sola al dejar de escribir: con la IA del
 * teléfono (Apple Intelligence o Gemini) si está lista, y si no, leyendo ciudad, teléfono y tamaño del texto.
 * No hay botón: el orbe solo vuelve a entender si se toca
 */
export function AsistenteEncomienda({
  alAplicar,
  alEscribir,
}: PropiedadesAsistenteEncomienda) {
  const { colores } = useTema();
  const { nombre, preguntar, usable } = useIA();
  const [texto, establecerTexto] = useState('');
  const [pensando, establecerPensando] = useState(false);
  const [listo, establecerListo] = useState<SugerenciaEncomienda | null>(null);
  const ultimoEntendido = useRef('');
  const alAplicarActual = useRef(alAplicar);
  alAplicarActual.current = alAplicar;

  async function entender(contenido: string) {
    const limpio = contenido.trim();
    if (limpio.length < MINIMO_DE_LETRAS) return;
    ultimoEntendido.current = limpio;
    establecerPensando(true);
    let sugerencia: SugerenciaEncomienda;
    try {
      sugerencia = usable
        ? leerSugerenciaEncomienda(
            await preguntar(instruccionesDeEncomienda(), limpio),
            limpio,
          )
        : sugerenciaPorPalabras(limpio);
    } catch {
      // si el modelo falla se entiende por palabras: la persona no tiene por qué enterarse
      sugerencia = sugerenciaPorPalabras(limpio);
    }
    establecerListo(sugerencia);
    alAplicarActual.current(sugerencia, limpio);
    establecerPensando(false);
  }

  const entenderActual = useRef(entender);
  entenderActual.current = entender;

  // se entiende solo, un momento después de dejar de escribir
  useEffect(() => {
    const limpio = texto.trim();
    if (
      limpio.length < MINIMO_DE_LETRAS ||
      limpio === ultimoEntendido.current
    ) {
      return;
    }
    const temporizador = setTimeout(
      () => void entenderActual.current(limpio),
      PAUSA_PARA_ENTENDER_MS,
    );
    return () => clearTimeout(temporizador);
  }, [texto]);

  const campo = (
    <View style={estilos.contenido} testID="asistente-encomienda">
      <View style={estilos.cabecera}>
        {usable ? (
          <OrbeIA
            alPresionar={() => void entender(texto)}
            etiquetaAccesible={rellenar(t('encomiendasIA.entender'), {
              nombre,
            })}
            pensando={pensando}
            tamano={26}
          />
        ) : null}
        <View style={estilos.titulos}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {t('encomiendasIA.titulo')}
          </Text>
          <Text
            accessibilityLiveRegion="polite"
            style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
          >
            {pensando
              ? t('encomiendasIA.entendiendo')
              : usable
                ? rellenar(t('ia.potenciadoPor'), { nombre })
                : t('encomiendasIA.sinIA')}
          </Text>
        </View>
      </View>
      <Bloque estiloContenido={estilos.caja} hundido radio="loseta">
        <TextInput
          accessibilityLabel={t('encomiendasIA.campo')}
          multiline
          onChangeText={(nuevo) => {
            establecerTexto(nuevo);
            alEscribir?.(nuevo);
          }}
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
      {listo ? (
        <View accessibilityLiveRegion="polite" style={estilos.etiquetas}>
          {etiquetasDeLoEntendido(listo).map((etiqueta) => (
            <View
              key={etiqueta}
              style={[
                estilos.etiqueta,
                {
                  backgroundColor: colores.barroClaro,
                  borderColor: colores.linea,
                },
              ]}
            >
              <Text style={[tipografia.pequeno, { color: colores.tinta }]}>
                {etiqueta}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );

  return usable ? (
    <TarjetaIA trabajando={pensando}>{campo}</TarjetaIA>
  ) : (
    <Bloque>{campo}</Bloque>
  );
}

const estilos = StyleSheet.create({
  caja: { paddingHorizontal: espacios.dieciseis },
  cabecera: { alignItems: 'center', flexDirection: 'row', gap: espacios.doce },
  contenido: { gap: espacios.doce, padding: espacios.dieciseis },
  entrada: {
    minHeight: 64,
    paddingVertical: espacios.doce,
    textAlignVertical: 'top',
  },
  etiqueta: {
    borderRadius: radios.pildora,
    borderWidth: 1,
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.cuatro,
  },
  etiquetas: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
  titulos: { flex: 1, gap: 2 },
});
