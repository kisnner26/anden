import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Chip } from '@/componentes/Chip';
import { armarContexto, instruccionesDelAsistente } from '@/datos/contextoIA';
import { useBoletos } from '@/datos/useBoletos';
import { useIA } from '@/datos/useIA';
import { useSalidas } from '@/datos/useSalidas';
import { motivoNoDisponible } from '@/servicios/ia';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesAsistente {
  alVolver: () => void;
}

interface Intercambio {
  pregunta: string;
  respuesta: string;
}

const SUGERENCIAS = [
  'ia.sugerencias.proximo',
  'ia.sugerencias.precio',
  'ia.sugerencias.boleto',
  'ia.sugerencias.asientos',
] as const;

/** el asistente: responde con las salidas y boletos reales de la app usando el modelo del teléfono */
export function Asistente({ alVolver }: PropiedadesAsistente) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { disponibilidad, nombre, preguntar, usable } = useIA();
  const { boletos } = useBoletos();
  const { salidas } = useSalidas();
  const [texto, establecerTexto] = useState('');
  const [pensando, establecerPensando] = useState(false);
  const [fallo, establecerFallo] = useState(false);
  const [historial, establecerHistorial] = useState<Intercambio[]>([]);

  async function enviar(pregunta: string) {
    const limpia = pregunta.trim();
    if (limpia === '' || pensando) return;
    establecerPensando(true);
    establecerFallo(false);
    try {
      const contexto = armarContexto(salidas, boletos, new Date());
      const respuesta = await preguntar(
        instruccionesDelAsistente(contexto),
        limpia,
      );
      establecerHistorial((previo) => [
        { pregunta: limpia, respuesta: respuesta.trim() },
        ...previo,
      ]);
      establecerTexto('');
    } catch {
      establecerFallo(true);
    } finally {
      establecerPensando(false);
    }
  }

  const motivo = usable ? null : motivoNoDisponible(disponibilidad, nombre);

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: espacios.cuarentaYOcho,
          paddingTop: margenes.top + espacios.ocho,
        },
      ]}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colores.fondo }}
    >
      <CabeceraPantalla alVolver={alVolver} titulo={t('ia.asistenteTitulo')} />
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('ia.asistenteDetalle')}
      </Text>

      {!usable ? (
        <Bloque estiloContenido={estilos.aviso}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {t('ia.sinUso')}
          </Text>
          <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
            {motivo ?? t('ia.activarEnAjustes')}
          </Text>
        </Bloque>
      ) : (
        <>
          <View style={estilos.sugerencias}>
            {SUGERENCIAS.map((clave) => (
              <Chip
                alCambiar={() => void enviar(t(clave))}
                deshabilitado={pensando}
                etiqueta={t(clave)}
                key={clave}
              />
            ))}
          </View>
          <CampoTexto
            alCambiar={establecerTexto}
            etiqueta={t('ia.campo')}
            marcador={t('ia.marcador')}
            valor={texto}
          />
          <BotonAccion
            alPresionar={() => void enviar(texto)}
            cargando={pensando}
            deshabilitado={texto.trim() === ''}
            etiqueta={pensando ? t('ia.pensando') : t('ia.preguntar')}
          />
          {fallo && (
            <Text
              accessibilityLiveRegion="polite"
              style={[tipografia.cuerpo, { color: colores.cancelado }]}
            >
              {t('ia.error')}
            </Text>
          )}
          {historial.map((intercambio, indice) => (
            <Bloque estiloContenido={estilos.intercambio} key={indice}>
              <Text
                style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
              >
                {intercambio.pregunta}
              </Text>
              <Text
                accessibilityLiveRegion={indice === 0 ? 'polite' : undefined}
                selectable
                style={[tipografia.cuerpo, { color: colores.tinta }]}
              >
                {intercambio.respuesta}
              </Text>
            </Bloque>
          ))}
          {historial.length > 0 && (
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {rellenar(t('ia.nota'), { nombre })}
            </Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  aviso: { gap: espacios.ocho, padding: espacios.veinticuatro },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  intercambio: { gap: espacios.ocho, padding: espacios.veinticuatro },
  sugerencias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacios.ocho,
  },
});
