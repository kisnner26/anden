import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotonAccion } from '@/componentes/BotonAccion';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { verificarConductor, verificacionVigente } from '@/datos/biometria';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesPuertaBiometrica {
  children: ReactNode;
  /** lo que lee el sistema en el mensaje de Face ID o huella */
  motivo: string;
}

/**
 * deja ver lo de adentro solo después de identificarse con Face ID, huella o el código del teléfono;
 * pide la verificación al abrirse y, si falla o se cancela, deja intentarlo de nuevo
 */
export function PuertaBiometrica({
  children,
  motivo,
}: PropiedadesPuertaBiometrica) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const [abierta, establecerAbierta] = useState(verificacionVigente());
  const [fallo, establecerFallo] = useState(false);
  const [pidiendo, establecerPidiendo] = useState(false);

  const pedir = useCallback(async () => {
    establecerPidiendo(true);
    establecerFallo(false);
    const ok = await verificarConductor(motivo);
    establecerPidiendo(false);
    establecerAbierta(ok);
    establecerFallo(!ok);
  }, [motivo]);

  useEffect(() => {
    if (!abierta) void pedir();
    // solo al abrirse; los reintentos los hace la persona
  }, []);

  if (abierta) return <>{children}</>;

  return (
    <View
      style={[
        estilos.pantalla,
        {
          backgroundColor: colores.fondo,
          paddingBottom: margenes.bottom + espacios.treintaYDos,
          paddingTop: margenes.top,
        },
      ]}
      testID="puerta-biometrica"
    >
      <View style={estilos.centro}>
        <Loseta tamano={80} variante="negra">
          <Icono color={colores.ambar} nombre="volante" tamano="ilustracion" />
        </Loseta>
        <Text
          accessibilityRole="header"
          style={[tipografia.display, estilos.texto, { color: colores.tinta }]}
        >
          {t('conductor.bloqueadoTitulo')}
        </Text>
        <Text
          style={[
            tipografia.cuerpo,
            estilos.texto,
            { color: colores.tintaSuave },
          ]}
        >
          {t('conductor.bloqueadoDetalle')}
        </Text>
        {fallo && (
          <Text
            accessibilityLiveRegion="polite"
            style={[
              tipografia.pequeno,
              estilos.texto,
              { color: colores.cancelado },
            ]}
          >
            {t('conductor.bloqueadoFallo')}
          </Text>
        )}
      </View>
      <BotonAccion
        alPresionar={() => void pedir()}
        cargando={pidiendo}
        etiqueta={t('conductor.desbloquear')}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: {
    alignItems: 'center',
    flex: 1,
    gap: espacios.dieciseis,
    justifyContent: 'center',
  },
  pantalla: { flex: 1, paddingHorizontal: espacios.lateral },
  texto: { textAlign: 'center' },
});
