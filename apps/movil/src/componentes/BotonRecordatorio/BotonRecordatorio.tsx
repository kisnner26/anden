import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';

import { Campaneo } from '@/componentes/Campaneo';
import { Icono } from '@/componentes/Icono';
import { Rebote } from '@/componentes/Rebote';
import { tamanosControl } from '@/tema/espacios';
import { useTema } from '@/tema/useTema';

export interface PropiedadesBotonRecordatorio {
  activo: boolean;
  alPresionar: () => void;
  etiqueta: string;
}

/** campana para pedir o quitar el aviso de una salida; con aviso puesto se balancea un poco */
export function BotonRecordatorio({
  activo,
  alPresionar,
  etiqueta,
}: PropiedadesBotonRecordatorio) {
  const { colores } = useTema();

  return (
    <Pressable
      accessibilityLabel={etiqueta}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      hitSlop={8}
      onPress={() => {
        void Haptics.selectionAsync().catch(() => undefined);
        alPresionar();
      }}
      style={estilos.boton}
    >
      <Rebote activo={activo}>
        <Campaneo activo={activo}>
          <Icono
            color={activo ? undefined : colores.linea}
            nombre="campana"
            tamano="ilustracion"
          />
        </Campaneo>
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
