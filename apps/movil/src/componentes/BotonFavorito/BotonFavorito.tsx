import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';

import { Icono } from '@/componentes/Icono';
import { Rebote } from '@/componentes/Rebote';
import { tamanosControl } from '@/tema/espacios';
import { useTema } from '@/tema/useTema';

export interface PropiedadesBotonFavorito {
  activo: boolean;
  alCambiar: () => void;
  etiqueta: string;
}

/** estrella para marcar o quitar un favorito; salta al encenderse */
export function BotonFavorito({
  activo,
  alCambiar,
  etiqueta,
}: PropiedadesBotonFavorito) {
  const { colores } = useTema();

  return (
    <Pressable
      accessibilityLabel={etiqueta}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      hitSlop={8}
      onPress={() => {
        void Haptics.selectionAsync().catch(() => undefined);
        alCambiar();
      }}
      style={estilos.boton}
    >
      <Rebote activo={activo}>
        <Icono
          color={activo ? undefined : colores.linea}
          nombre="estrella"
          tamano="ilustracion"
        />
      </Rebote>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    alignItems: 'center',
    height: tamanosControl.toqueMinimo,
    justifyContent: 'center',
    width: tamanosControl.toqueMinimo,
  },
});
