import { StyleSheet, Text, View } from 'react-native';

import { OpcionDeLista } from '@/componentes/OpcionDeLista';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesPanelSeguridadViaje {
  /** abre Mensajes con el viaje para la persona de confianza; sin contacto guardado se explica cómo dejarlo */
  alAvisar: () => void;
  alLlamarAlChofer: () => void;
  alLlamarEmergencias: () => void;
  /** si ya hay una persona de confianza guardada */
  conContacto: boolean;
  /** si la última llamada al chofer no pudo hacerse */
  falloLlamada?: boolean;
}

/** lo que hace falta a mano en un viaje: avisar a alguien, llamar al chofer o pedir ayuda */
export function PanelSeguridadViaje({
  alAvisar,
  alLlamarAlChofer,
  alLlamarEmergencias,
  conContacto,
  falloLlamada = false,
}: PropiedadesPanelSeguridadViaje) {
  const { colores } = useTema();
  return (
    <View style={estilos.contenedor} testID="panel-seguridad-viaje">
      <View style={estilos.cabecera}>
        <Text
          accessibilityRole="header"
          style={[tipografia.titulo, { color: colores.tinta }]}
        >
          {t('seguridadViaje.titulo')}
        </Text>
        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {t('seguridadViaje.detalle')}
        </Text>
      </View>
      <OpcionDeLista
        alPresionar={alAvisar}
        detalle={
          conContacto
            ? t('seguridadViaje.avisarDetalle')
            : t('seguridadViaje.sinContacto')
        }
        titulo={t('seguridadViaje.avisar')}
      />
      <OpcionDeLista
        alPresionar={alLlamarAlChofer}
        titulo={t('seguridadViaje.llamarChofer')}
      />
      {falloLlamada && (
        <Text
          accessibilityLiveRegion="polite"
          style={[tipografia.pequeno, { color: colores.cancelado }]}
        >
          {t('seguridadViaje.llamarChoferFallo')}
        </Text>
      )}
      <OpcionDeLista
        alPresionar={alLlamarEmergencias}
        titulo={t('seguridadViaje.emergencia')}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  cabecera: { gap: espacios.cuatro },
  contenedor: { gap: espacios.doce },
});
