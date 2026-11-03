import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { CampoTexto } from '@/componentes/CampoTexto';
import type { PasajeroReserva } from '@/datos/reserva';
import { useReserva } from '@/datos/useReserva';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesPasajeros {
  alContinuar: () => void;
  alVolver: () => void;
  asientos: readonly number[];
  viajeId: string;
}

const LARGO_MINIMO = 2;

/** el nombre de quien viaja en cada asiento elegido */
export function Pasajeros({
  alContinuar,
  alVolver,
  asientos,
  viajeId,
}: PropiedadesPasajeros) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { establecerBorrador } = useReserva();
  const [nombres, establecerNombres] = useState<Record<number, string>>({});
  const [cedulas, establecerCedulas] = useState<Record<number, string>>({});
  const [faltan, establecerFaltan] = useState(false);

  function continuar() {
    const completos = asientos.every(
      (asiento) => (nombres[asiento] ?? '').trim().length >= LARGO_MINIMO,
    );
    if (!completos) {
      establecerFaltan(true);
      return;
    }
    const pasajeros: PasajeroReserva[] = asientos.map((asiento) => ({
      asiento,
      cedula: cedulas[asiento],
      nombre: nombres[asiento] ?? '',
    }));
    establecerBorrador(viajeId, pasajeros);
    alContinuar();
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[estilos.pantalla, { backgroundColor: colores.fondo }]}
    >
      <ScrollView
        contentContainerStyle={[
          estilos.contenido,
          { paddingBottom: 48, paddingTop: margenes.top + 8 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <CabeceraPantalla alVolver={alVolver} titulo={t('pasajeros.titulo')} />
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('pasajeros.detalle')}
        </Text>

        {asientos.map((asiento) => (
          <Bloque estiloContenido={estilos.bloque} key={asiento}>
            <Text style={[estilos.asiento, { color: colores.tinta }]}>
              {`${t('pasajeros.asiento')} ${asiento}`}
            </Text>
            <CampoTexto
              alCambiar={(valor) =>
                establecerNombres({ ...nombres, [asiento]: valor })
              }
              etiqueta={`${t('pasajeros.nombre')} · ${t('pasajeros.asiento')} ${asiento}`}
              marcador={t('pasajeros.marcadorNombre')}
              valor={nombres[asiento] ?? ''}
            />
            <CampoTexto
              alCambiar={(valor) =>
                establecerCedulas({ ...cedulas, [asiento]: valor })
              }
              etiqueta={`${t('pasajeros.cedula')} · ${t('pasajeros.asiento')} ${asiento}`}
              marcador={t('pasajeros.marcadorCedula')}
              valor={cedulas[asiento] ?? ''}
            />
          </Bloque>
        ))}

        {faltan && (
          <Text
            accessibilityLiveRegion="polite"
            style={[tipografia.pequeno, { color: colores.cancelado }]}
          >
            {t('pasajeros.faltanNombres')}
          </Text>
        )}
        <View style={estilos.boton}>
          <BotonAccion
            alPresionar={continuar}
            etiqueta={t('pasajeros.continuar')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  asiento: { fontFamily: 'Archivo_600SemiBold', fontSize: 18, lineHeight: 22 },
  bloque: { gap: espacios.dieciseis, padding: espacios.veinticuatro },
  boton: { alignItems: 'flex-end' },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  pantalla: { flex: 1 },
});
