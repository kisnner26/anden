import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BotonAccion } from '@/componentes/BotonAccion';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Hoja } from '@/componentes/Hoja';
import { descripcionValida } from '@/datos/objetosOlvidados';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesHojaObjetoOlvidado {
  abierta: boolean;
  alCerrar: () => void;
  alEnviar: (descripcion: string) => void;
}

/** hoja para contar qué se dejó en el bus */
export function HojaObjetoOlvidado({
  abierta,
  alCerrar,
  alEnviar,
}: PropiedadesHojaObjetoOlvidado) {
  const { colores } = useTema();
  const [texto, establecerTexto] = useState('');
  const [error, establecerError] = useState(false);

  function enviar() {
    if (!descripcionValida(texto)) {
      establecerError(true);
      return;
    }
    establecerError(false);
    alEnviar(texto);
    establecerTexto('');
  }

  return (
    <Hoja
      abierta={abierta}
      alCerrar={alCerrar}
      etiquetaCerrar={t('objetos.cerrar')}
    >
      <View style={estilos.contenido}>
        <Text
          accessibilityRole="header"
          style={[tipografia.titulo, { color: colores.tinta }]}
        >
          {t('objetos.titulo')}
        </Text>
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('objetos.detalle')}
        </Text>
        <CampoTexto
          alCambiar={(valor) => {
            establecerTexto(valor);
            establecerError(false);
          }}
          error={error ? t('objetos.invalido') : undefined}
          etiqueta={t('objetos.campo')}
          marcador={t('objetos.marcador')}
          valor={texto}
        />
        <BotonAccion alPresionar={enviar} etiqueta={t('objetos.enviar')} />
      </View>
    </Hoja>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    gap: espacios.dieciseis,
    paddingBottom: espacios.cuarentaYOcho,
    paddingHorizontal: espacios.lateral,
  },
});
