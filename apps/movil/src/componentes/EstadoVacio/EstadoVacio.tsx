import { StyleSheet, Text, View } from 'react-native';

import {
  IlustracionVacia,
  type TipoIlustracion,
} from '@/componentes/IlustracionVacia';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export interface PropiedadesEstadoVacio {
  /** una línea más que el título, si hace falta */
  detalle?: string;
  tamano?: number;
  tipo: TipoIlustracion;
  titulo: string;
}

/** un estado vacío con su dibujo animado y poco texto, centrado */
export function EstadoVacio({
  detalle,
  tamano = 150,
  tipo,
  titulo,
}: PropiedadesEstadoVacio) {
  const { colores } = useTema();
  return (
    <View style={estilos.contenedor}>
      <IlustracionVacia tamano={tamano} tipo={tipo} />
      <Text
        accessibilityRole="header"
        style={[
          tipografia.subtitulo,
          estilos.centrado,
          { color: colores.tinta },
        ]}
      >
        {titulo}
      </Text>
      {detalle ? (
        <Text
          style={[
            tipografia.pequeno,
            estilos.centrado,
            { color: colores.tintaSuave },
          ]}
        >
          {detalle}
        </Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  centrado: { textAlign: 'center' },
  contenedor: {
    alignItems: 'center',
    gap: espacios.doce,
    paddingVertical: espacios.veinticuatro,
  },
});
