import { StyleSheet, View } from 'react-native';

import { ChatViaje } from '@/componentes/ChatViaje';
import { Hoja } from '@/componentes/Hoja';
import { useMensajesViaje } from '@/datos/useMensajesViaje';
import { espacios } from '@/tema/espacios';
import { t } from '@/textos/t';

export interface PropiedadesHojaConversacion {
  abierta: boolean;
  alCerrar: () => void;
  /** el boleto del pasajero: identifica su conversación con el chofer */
  boletoId: string;
  /** si el viaje va en camino y se puede escribir */
  disponible: boolean;
  /** el nombre de pila del pasajero */
  nombre: string;
  viajeId: string;
}

/** la hoja con la que el chofer conversa con un pasajero; solo lee mensajes mientras está abierta */
export function HojaConversacion({
  abierta,
  alCerrar,
  boletoId,
  disponible,
  nombre,
  viajeId,
}: PropiedadesHojaConversacion) {
  const conversacion = useMensajesViaje(
    viajeId,
    abierta ? boletoId : '',
    'chofer',
    abierta && disponible,
  );
  return (
    <Hoja
      abierta={abierta}
      alCerrar={alCerrar}
      etiquetaCerrar={t('chatViaje.cerrar')}
    >
      <View style={estilos.contenido}>
        <ChatViaje
          alEnviar={conversacion.enviar}
          disponible={disponible}
          mensajes={conversacion.mensajes}
          nombre={nombre}
          rapidas={[
            t('chatViaje.rapidasChofer.llegando'),
            t('chatViaje.rapidasChofer.esperando'),
            t('chatViaje.rapidasChofer.subir'),
          ]}
          yo="chofer"
        />
      </View>
    </Hoja>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    paddingBottom: espacios.cuarentaYOcho,
    paddingHorizontal: espacios.lateral,
  },
});
