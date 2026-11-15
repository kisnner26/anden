import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ResultadoDeLectura } from '@/datos/lecturaDeBoleto';
import { useSensaciones } from '@/datos/useSensaciones';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

/** el mismo QR leído varias veces seguidas no cuenta: se espera este tiempo antes de aceptarlo de nuevo */
const ESPERA_ENTRE_LECTURAS_MS = 2500;

export interface PropiedadesEscanerDeBoletos {
  /** decide qué pasa con lo leído y, si el boleto deja subir, lo marca; devuelve el resultado para mostrarlo */
  alLeer: (texto: string) => ResultadoDeLectura;
  alCerrar: () => void;
  visible: boolean;
}

/**
 * la cámara del chofer en la puerta del bus: lee el QR del boleto y responde con un panel grande, verde si sube, ámbar si ya
 * había subido y rojo si el boleto no es de este viaje o no vale; con vibración para no tener que mirar la pantalla
 */
export function EscanerDeBoletos({
  alCerrar,
  alLeer,
  visible,
}: PropiedadesEscanerDeBoletos) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const sentir = useSensaciones();
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [resultado, establecerResultado] = useState<ResultadoDeLectura | null>(
    null,
  );
  const ultima = useRef<{ cuando: number; texto: string }>({
    cuando: 0,
    texto: '',
  });

  function alEscanear({ data }: { data: string }) {
    const ahora = Date.now();
    if (
      data === ultima.current.texto &&
      ahora - ultima.current.cuando < ESPERA_ENTRE_LECTURAS_MS
    ) {
      return;
    }
    ultima.current = { cuando: ahora, texto: data };
    const lectura = alLeer(data);
    establecerResultado(lectura);
    sentir(lectura.tipo === 'ok' ? 'exito' : 'error');
  }

  const color =
    resultado === null
      ? colores.bloqueNegro
      : resultado.tipo === 'ok'
        ? colores.aTiempo
        : resultado.tipo === 'ya'
          ? colores.ambar
          : colores.cancelado;

  const mensaje =
    resultado === null
      ? t('escaner.apuntar')
      : resultado.tipo === 'ok'
        ? rellenar(t('escaner.sube'), {
            asiento: resultado.asiento,
            nombre: resultado.nombre,
          })
        : resultado.tipo === 'ya'
          ? rellenar(t('escaner.yaSubio'), {
              asiento: resultado.asiento,
              nombre: resultado.nombre,
            })
          : resultado.tipo === 'otroViaje'
            ? t('escaner.otroViaje')
            : t('escaner.invalido');

  return (
    <Modal
      animationType="slide"
      onRequestClose={alCerrar}
      presentationStyle="fullScreen"
      visible={visible}
    >
      <View
        style={[estilos.pantalla, { backgroundColor: colores.bloqueNegro }]}
      >
        {permiso?.granted ? (
          <CameraView
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            facing="back"
            onBarcodeScanned={alEscanear}
            style={StyleSheet.absoluteFill}
            testID="camara-qr"
          />
        ) : (
          <View style={estilos.sinPermiso}>
            <Text style={[tipografia.subtitulo, { color: colores.sobreNegro }]}>
              {t('escaner.sinPermiso')}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void pedirPermiso()}
              style={[estilos.boton, { backgroundColor: colores.ambar }]}
            >
              <Text
                style={[tipografia.subtitulo, { color: colores.bloqueNegro }]}
              >
                {t('escaner.dejarUsar')}
              </Text>
            </Pressable>
          </View>
        )}

        <View
          pointerEvents="none"
          style={[estilos.marco, { borderColor: color }]}
        />

        <View
          accessibilityLiveRegion="polite"
          style={[
            estilos.panel,
            {
              backgroundColor: color,
              paddingBottom: margenes.bottom + espacios.dieciseis,
            },
          ]}
          testID="resultado-escaner"
        >
          <Text
            style={[
              tipografia.titularResumen,
              {
                color:
                  resultado === null ||
                  resultado.tipo === 'ok' ||
                  resultado.tipo === 'invalido' ||
                  resultado.tipo === 'otroViaje'
                    ? colores.sobreNegro
                    : colores.bloqueNegro,
              },
            ]}
          >
            {mensaje}
          </Text>
        </View>

        <Pressable
          accessibilityLabel={t('escaner.cerrar')}
          accessibilityRole="button"
          onPress={alCerrar}
          style={[estilos.cerrar, { top: margenes.top + espacios.ocho }]}
        >
          <Text style={[tipografia.subtitulo, { color: colores.sobreNegro }]}>
            {t('escaner.cerrar')}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  boton: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: espacios.veinticuatro,
  },
  cerrar: {
    paddingHorizontal: espacios.dieciseis,
    paddingVertical: espacios.ocho,
    position: 'absolute',
    right: espacios.dieciseis,
  },
  marco: {
    alignSelf: 'center',
    borderRadius: radios.tarjeta,
    borderWidth: 4,
    height: 260,
    marginTop: 160,
    position: 'absolute',
    width: 260,
  },
  panel: {
    bottom: 0,
    left: 0,
    padding: espacios.veinticuatro,
    position: 'absolute',
    right: 0,
  },
  pantalla: { flex: 1 },
  sinPermiso: {
    alignItems: 'center',
    flex: 1,
    gap: espacios.dieciseis,
    justifyContent: 'center',
    padding: espacios.veinticuatro,
  },
});
