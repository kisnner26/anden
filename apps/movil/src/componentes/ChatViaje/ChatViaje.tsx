import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Chip } from '@/componentes/Chip';
import { Icono } from '@/componentes/Icono';
import {
  MAXIMO_MENSAJE,
  type AutorMensaje,
  type MensajeViaje,
} from '@/datos/mensajesViaje';
import { formatoHoraCompleta } from '@/datos/formato';
import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesChatViaje {
  /** envía el texto; devuelve falso si no se pudo */
  alEnviar: (texto: string) => Promise<boolean>;
  /** el nombre de pila de la otra persona */
  nombre: string;
  /** falso cuando el viaje no va en camino: se ve la conversación pero no se escribe */
  disponible: boolean;
  mensajes: readonly MensajeViaje[];
  /** quién es la persona de este teléfono */
  yo: AutorMensaje;
  /** frases que se mandan con un toque; solo se ofrecen si la conversación está vacía */
  rapidas?: readonly string[];
}

/** la conversación del viaje: globos a cada lado, el campo para escribir abajo y unas frases rápidas al empezar */
export function ChatViaje({
  alEnviar,
  disponible,
  mensajes,
  nombre,
  rapidas = [],
  yo,
}: PropiedadesChatViaje) {
  const { colores } = useTema();
  const [texto, establecerTexto] = useState('');
  const [fallo, establecerFallo] = useState(false);
  const lista = useRef<ScrollViewInstance>(null);

  async function enviar(contenido: string) {
    if (contenido.trim() === '') return;
    const enviado = await alEnviar(contenido);
    establecerFallo(!enviado);
    if (enviado) establecerTexto('');
  }

  return (
    <View style={estilos.contenedor} testID="chat-viaje">
      <Text
        accessibilityRole="header"
        style={[tipografia.titulo, { color: colores.tinta }]}
      >
        {rellenar(t('chatViaje.titulo'), { chofer: nombre })}
      </Text>
      <ScrollView
        contentContainerStyle={estilos.mensajes}
        onContentSizeChange={() =>
          lista.current?.scrollToEnd({ animated: true })
        }
        ref={lista}
        style={estilos.lista}
      >
        {mensajes.length === 0 && (
          <Text
            style={[
              tipografia.cuerpo,
              estilos.vacio,
              { color: colores.tintaSuave },
            ]}
          >
            {t('chatViaje.vacio')}
          </Text>
        )}
        {mensajes.map((mensaje) => {
          const mio = mensaje.de === yo;
          return (
            <View
              key={mensaje.id}
              style={[
                estilos.globo,
                mio ? estilos.mio : estilos.suyo,
                {
                  backgroundColor: mio ? colores.bloqueNegro : colores.papel,
                },
              ]}
            >
              <Text
                style={[
                  tipografia.cuerpo,
                  { color: mio ? colores.sobreNegro : colores.tinta },
                ]}
              >
                {mensaje.texto}
              </Text>
              <Text
                style={[
                  tipografia.etiqueta,
                  { color: mio ? colores.sobreNegroSuave : colores.tintaSuave },
                ]}
              >
                {formatoHoraCompleta(new Date(mensaje.enviadoEn))}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      {!disponible ? (
        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {t('chatViaje.soloEnViaje')}
        </Text>
      ) : (
        <>
          {mensajes.length === 0 && rapidas.length > 0 && (
            <View style={estilos.rapidas}>
              {rapidas.map((frase) => (
                <Chip
                  alCambiar={() => void enviar(frase)}
                  etiqueta={frase}
                  key={frase}
                />
              ))}
            </View>
          )}
          {fallo && (
            <Text
              accessibilityLiveRegion="polite"
              style={[tipografia.pequeno, { color: colores.cancelado }]}
            >
              {t('chatViaje.fallo')}
            </Text>
          )}
          <View
            style={[
              estilos.entrada,
              { backgroundColor: colores.papel, borderColor: colores.linea },
            ]}
          >
            <TextInput
              accessibilityLabel={t('chatViaje.campo')}
              maxLength={MAXIMO_MENSAJE}
              multiline
              onChangeText={establecerTexto}
              placeholder={rellenar(t('chatViaje.marcador'), {
                chofer: nombre,
              })}
              placeholderTextColor={colores.tintaSuave}
              style={[
                tipografia.cuerpo,
                estilos.campo,
                { color: colores.tinta },
              ]}
              value={texto}
            />
            <Pressable
              accessibilityLabel={t('chatViaje.enviar')}
              accessibilityRole="button"
              accessibilityState={{ disabled: texto.trim() === '' }}
              disabled={texto.trim() === ''}
              onPress={() => void enviar(texto)}
              style={[
                estilos.enviar,
                {
                  backgroundColor: colores.ambar,
                  opacity: texto.trim() === '' ? 0.4 : 1,
                },
              ]}
            >
              <Icono
                color={colores.sobreAmbar}
                nombre="siguiente"
                tamano="mediano"
              />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: { flex: 1, maxHeight: 96, paddingVertical: espacios.ocho },
  contenedor: { gap: espacios.doce },
  enviar: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    height: tamanosControl.toqueMinimo,
    justifyContent: 'center',
    width: tamanosControl.toqueMinimo,
  },
  entrada: {
    alignItems: 'flex-end',
    borderRadius: radios.loseta,
    borderWidth: 1,
    flexDirection: 'row',
    gap: espacios.ocho,
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.cuatro,
  },
  globo: {
    borderRadius: radios.loseta,
    gap: 2,
    maxWidth: '82%',
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.ocho,
  },
  lista: { maxHeight: 320 },
  mensajes: { gap: espacios.ocho, paddingVertical: espacios.ocho },
  mio: { alignSelf: 'flex-end' },
  rapidas: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
  suyo: { alignSelf: 'flex-start' },
  vacio: { textAlign: 'center' },
});
