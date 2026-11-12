import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Autobus } from '@/componentes/Autobus';
import { BotonAccion } from '@/componentes/BotonAccion';
import { useBloqueo } from '@/datos/useBloqueo';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

const ANCHO_BUS = 220;

/** pantalla de bloqueo: pide Face ID al aparecer y deja reintentar con un botón */
export function Bloqueo() {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { desbloquear } = useBloqueo();
  const [fallo, establecerFallo] = useState(false);
  const pedido = useRef(false);

  async function intentar() {
    establecerFallo(false);
    const abierto = await desbloquear();
    if (!abierto) establecerFallo(true);
  }

  useEffect(() => {
    if (pedido.current) return;
    pedido.current = true;
    void intentar();
    // se pide una sola vez al aparecer; los reintentos son del botón
  }, []);

  return (
    <View
      accessibilityViewIsModal
      style={[
        estilos.pantalla,
        {
          backgroundColor: colores.fondo,
          paddingBottom: margenes.bottom + espacios.veinticuatro,
          paddingTop: margenes.top + espacios.cuarentaYOcho,
        },
      ]}
    >
      <View style={estilos.centro}>
        <Autobus ancho={ANCHO_BUS} letrero="ANDÉN" />
        <Text
          accessibilityRole="header"
          style={[
            tipografia.titulo,
            estilos.centrado,
            { color: colores.tinta },
          ]}
        >
          {t('bloqueo.titulo')}
        </Text>
        <Text
          style={[
            tipografia.cuerpo,
            estilos.centrado,
            { color: colores.tintaSuave },
          ]}
        >
          {t('bloqueo.detalle')}
        </Text>
        {fallo && (
          <Text
            accessibilityLiveRegion="polite"
            style={[
              tipografia.pequeno,
              estilos.centrado,
              { color: colores.cancelado },
            ]}
          >
            {t('bloqueo.fallo')}
          </Text>
        )}
      </View>
      <View style={estilos.boton}>
        <BotonAccion
          alPresionar={() => void intentar()}
          etiqueta={t('bloqueo.desbloquear')}
        />
      </View>
    </View>
  );
}

/** cubre la app mientras está bloqueada o mientras se lee si el bloqueo está encendido */
export function PuertaBloqueo() {
  const { colores } = useTema();
  const { bloqueado, cargando } = useBloqueo();

  if (cargando) {
    return (
      <View
        pointerEvents="auto"
        style={[estilos.cubierta, { backgroundColor: colores.fondo }]}
      />
    );
  }
  if (!bloqueado) return null;
  return (
    <View style={estilos.cubierta}>
      <Bloqueo />
    </View>
  );
}

const estilos = StyleSheet.create({
  boton: { alignItems: 'flex-end' },
  centrado: { textAlign: 'center' },
  centro: {
    alignItems: 'center',
    flex: 1,
    gap: espacios.dieciseis,
    justifyContent: 'center',
  },
  cubierta: { ...StyleSheet.absoluteFill, zIndex: 100 },
  pantalla: { flex: 1, paddingHorizontal: espacios.lateral },
});
