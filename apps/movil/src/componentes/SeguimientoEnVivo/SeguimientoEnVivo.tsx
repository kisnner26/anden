import { StyleSheet, Text, View } from 'react-native';

import { BloqueNegro } from '@/componentes/BloqueNegro';
import type { ProgresoViaje } from '@/datos/progresoViaje';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesSeguimientoEnVivo {
  progreso: ProgresoViaje | null;
  sinSenal: boolean;
}

/** lo que ve el pasajero cuando el conductor comparte su viaje: cuánto lleva y cuánto falta */
export function SeguimientoEnVivo({
  progreso,
  sinSenal,
}: PropiedadesSeguimientoEnVivo) {
  const { colores } = useTema();

  return (
    <BloqueNegro estiloContenido={estilos.bloque}>
      <View
        accessibilityLabel={t('seguimiento.descripcion')}
        accessible
        style={estilos.cabecera}
      >
        <View
          style={[
            estilos.punto,
            {
              backgroundColor: sinSenal
                ? colores.sobreNegroSuave
                : colores.aTiempo,
            },
          ]}
        />
        <Text style={[tipografia.etiqueta, { color: colores.sobreNegro }]}>
          {t('seguimiento.enVivo')}
        </Text>
      </View>
      {progreso && !sinSenal ? (
        <>
          <Text
            accessibilityLiveRegion="polite"
            style={[tipografia.display, { color: colores.ambar }]}
          >
            {rellenar(t('seguimiento.llegaEn'), {
              minutos: progreso.minutosRestantes,
            })}
          </Text>
          <Text style={[tipografia.cuerpo, { color: colores.sobreNegro }]}>
            {rellenar(t('seguimiento.porcentaje'), {
              porcentaje: progreso.porcentaje,
            })}
          </Text>
          <Text
            style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
          >
            {rellenar(t('seguimiento.kilometros'), {
              recorridos: progreso.kmRecorridos,
              restantes: progreso.kmRestantes,
            })}
          </Text>
          {progreso.fueraDeRuta && (
            <Text style={[tipografia.pequeno, { color: colores.ambar }]}>
              {t('seguimiento.fueraDeRuta')}
            </Text>
          )}
        </>
      ) : (
        <Text style={[tipografia.cuerpo, { color: colores.sobreNegroSuave }]}>
          {sinSenal && progreso
            ? t('seguimiento.sinSenal')
            : t('seguimiento.esperando')}
        </Text>
      )}
    </BloqueNegro>
  );
}

const estilos = StyleSheet.create({
  bloque: { gap: espacios.ocho, padding: espacios.veinticuatro },
  cabecera: { alignItems: 'center', flexDirection: 'row', gap: espacios.ocho },
  punto: {
    borderRadius: radios.pildora,
    height: espacios.doce,
    width: espacios.doce,
  },
});
