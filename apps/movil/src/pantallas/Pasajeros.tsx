import { cedulaOpcionalValida, nombrePersonaValido } from '@anden/dominio';
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

import { Aparece } from '@/componentes/Aparece';
import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Chip } from '@/componentes/Chip';
import { ProgresoReserva } from '@/componentes/ProgresoReserva';
import { nombreCompleto, type PasajeroGuardado } from '@/datos/perfil';
import type { PasajeroReserva } from '@/datos/reserva';
import { usePerfil } from '@/datos/usePerfil';
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
  const { perfil } = usePerfil();
  const propio = nombreCompleto(perfil);
  // quien reserva viaja en el primer asiento: sus datos del perfil ya vienen escritos
  const [nombres, establecerNombres] = useState<Record<number, string>>(() =>
    propio !== '' && asientos[0] !== undefined ? { [asientos[0]]: propio } : {},
  );
  const [cedulas, establecerCedulas] = useState<Record<number, string>>(() =>
    perfil.cedula !== '' && propio !== '' && asientos[0] !== undefined
      ? { [asientos[0]]: perfil.cedula }
      : {},
  );
  const [faltan, establecerFaltan] = useState(false);
  const [validar, establecerValidar] = useState(false);

  function usarGuardado(guardado: PasajeroGuardado) {
    const libre = asientos.find(
      (asiento) => (nombres[asiento] ?? '').trim() === '',
    );
    if (libre === undefined) return;
    establecerNombres({ ...nombres, [libre]: guardado.nombre });
    if (guardado.cedula) {
      establecerCedulas({ ...cedulas, [libre]: guardado.cedula });
    }
  }

  function continuar() {
    establecerValidar(true);
    const completos = asientos.every(
      (asiento) =>
        nombrePersonaValido(nombres[asiento] ?? '') &&
        cedulaOpcionalValida(cedulas[asiento] ?? ''),
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
          {
            paddingBottom: espacios.cuarentaYOcho,
            paddingTop: margenes.top + espacios.ocho,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <CabeceraPantalla alVolver={alVolver} titulo={t('pasajeros.titulo')} />
        <ProgresoReserva paso={2} />
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('pasajeros.detalle')}
        </Text>

        {perfil.pasajeros.length > 0 && (
          <View style={estilos.guardados}>
            <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
              {t('pasajeros.guardados')}
            </Text>
            <View style={estilos.chips}>
              {perfil.pasajeros.map((guardado) => (
                <Chip
                  alCambiar={() => usarGuardado(guardado)}
                  etiqueta={guardado.nombre}
                  key={guardado.id}
                />
              ))}
            </View>
          </View>
        )}

        {asientos.map((asiento, indice) => (
          <Aparece indice={indice} key={asiento}>
            <Bloque estiloContenido={estilos.bloque}>
              <Text style={[tipografia.nombreFila, { color: colores.tinta }]}>
                {`${t('pasajeros.asiento')} ${asiento}`}
              </Text>
              <CampoTexto
                alCambiar={(valor) =>
                  establecerNombres({ ...nombres, [asiento]: valor })
                }
                etiqueta={`${t('pasajeros.nombre')} · ${t('pasajeros.asiento')} ${asiento}`}
                error={
                  validar && !nombrePersonaValido(nombres[asiento] ?? '')
                    ? t('pasajeros.nombreInvalido')
                    : undefined
                }
                marcador={t('pasajeros.marcadorNombre')}
                valor={nombres[asiento] ?? ''}
              />
              <CampoTexto
                alCambiar={(valor) =>
                  establecerCedulas({ ...cedulas, [asiento]: valor })
                }
                etiqueta={`${t('pasajeros.cedula')} · ${t('pasajeros.asiento')} ${asiento}`}
                error={
                  validar && !cedulaOpcionalValida(cedulas[asiento] ?? '')
                    ? t('pasajeros.cedulaInvalida')
                    : undefined
                }
                marcador={t('pasajeros.marcadorCedula')}
                valor={cedulas[asiento] ?? ''}
              />
            </Bloque>
          </Aparece>
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
  bloque: { gap: espacios.dieciseis, padding: espacios.veinticuatro },
  boton: { alignItems: 'flex-end' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  guardados: { gap: espacios.ocho },
  pantalla: { flex: 1 },
});
