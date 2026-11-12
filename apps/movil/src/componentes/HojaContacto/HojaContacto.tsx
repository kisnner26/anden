import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BotonAccion } from '@/componentes/BotonAccion';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Hoja } from '@/componentes/Hoja';
import {
  armarContacto,
  type ContactoConfianza,
} from '@/datos/contactoConfianza';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesHojaContacto {
  abierta: boolean;
  alCerrar: () => void;
  alGuardar: (contacto: ContactoConfianza) => void;
}

/** hoja para guardar a quién se le avisa cómo va el viaje */
export function HojaContacto({
  abierta,
  alCerrar,
  alGuardar,
}: PropiedadesHojaContacto) {
  const { colores } = useTema();
  const [nombre, establecerNombre] = useState('');
  const [telefono, establecerTelefono] = useState('');
  const [error, establecerError] = useState(false);

  function guardar() {
    const contacto = armarContacto(nombre, telefono);
    if (!contacto) {
      establecerError(true);
      return;
    }
    establecerError(false);
    alGuardar(contacto);
  }

  return (
    <Hoja
      abierta={abierta}
      alCerrar={alCerrar}
      etiquetaCerrar={t('contacto.cerrar')}
    >
      <View style={estilos.contenido}>
        <Text
          accessibilityRole="header"
          style={[tipografia.titulo, { color: colores.tinta }]}
        >
          {t('contacto.titulo')}
        </Text>
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('contacto.detalle')}
        </Text>
        <CampoTexto
          alCambiar={(valor) => {
            establecerNombre(valor);
            establecerError(false);
          }}
          etiqueta={t('contacto.nombre')}
          valor={nombre}
        />
        <CampoTexto
          alCambiar={(valor) => {
            establecerTelefono(valor);
            establecerError(false);
          }}
          error={error ? t('contacto.invalido') : undefined}
          etiqueta={t('contacto.telefono')}
          marcador={t('contacto.marcadorTelefono')}
          teclado="phone-pad"
          valor={telefono}
        />
        <BotonAccion alPresionar={guardar} etiqueta={t('contacto.guardar')} />
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
