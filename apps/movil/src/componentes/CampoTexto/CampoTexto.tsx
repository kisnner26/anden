import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { IconoOjo } from '@/componentes/IconoOjo';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

/** sin interlínea fija: en iOS un lineHeight menor que la letra recorta las colas de g, y, p */
const textoCampo = {
  fontFamily: tipografia.cuerpo.fontFamily,
  fontSize: tipografia.cuerpo.fontSize,
};

export interface PropiedadesCampoTexto {
  alCambiar: (valor: string) => void;
  etiqueta: string;
  error?: string;
  marcador?: string;
  /** para claves: muestra puntos en vez de las letras */
  oculto?: boolean;
  teclado?: KeyboardTypeOptions;
  valor: string;
}

/** campo de texto hundido con su rótulo arriba */
export function CampoTexto({
  alCambiar,
  etiqueta,
  error,
  marcador,
  oculto = false,
  teclado = 'default',
  valor,
}: PropiedadesCampoTexto) {
  const { colores, modo } = useTema();
  const [visible, establecerVisible] = useState(false);

  return (
    <View style={estilos.contenedor}>
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {etiqueta}
      </Text>
      <Bloque estiloContenido={estilos.caja} hundido radio="loseta">
        <View style={estilos.fila}>
          <TextInput
            accessibilityLabel={etiqueta}
            accessibilityHint={error}
            aria-invalid={error !== undefined}
            keyboardAppearance={modo === 'oscuro' ? 'dark' : 'light'}
            keyboardType={teclado}
            autoCapitalize={oculto ? 'none' : undefined}
            autoCorrect={oculto ? false : undefined}
            onChangeText={alCambiar}
            secureTextEntry={oculto && !visible}
            placeholder={marcador}
            placeholderTextColor={colores.tintaSuave}
            selectionColor={colores.ambarTexto}
            style={[textoCampo, estilos.entrada, { color: colores.tinta }]}
            value={valor}
          />
          {oculto ? (
            <Pressable
              accessibilityLabel={
                visible ? t('campo.ocultarClave') : t('campo.mostrarClave')
              }
              accessibilityRole="button"
              accessibilityState={{ checked: visible }}
              hitSlop={8}
              onPress={() => establecerVisible((v) => !v)}
              style={estilos.ojo}
            >
              <IconoOjo abierto={visible} />
            </Pressable>
          ) : null}
        </View>
      </Bloque>
      {error !== undefined && (
        <Text
          accessibilityLiveRegion="polite"
          style={[tipografia.pequeno, { color: colores.cancelado }]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { paddingHorizontal: espacios.dieciseis },
  contenedor: { gap: espacios.ocho },
  // altura fija y sin relleno vertical: así el texto y el ejemplo quedan centrados, uno igual al otro
  entrada: { flex: 1, height: 56, paddingVertical: 0 },
  fila: { alignItems: 'center', flexDirection: 'row', gap: espacios.ocho },
  ojo: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 40,
  },
});
