import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export interface PropiedadesOpcionSeleccion {
  alElegir: () => void;
  deshabilitada?: boolean;
  detalle: string;
  elegida: boolean;
  nombre: string;
  /** texto corto a la derecha cuando todavía no se puede usar, por ejemplo "Próximamente" */
  rotulo?: string;
}

/** una opción de una lista de una sola elección: la elegida se hunde y marca su círculo en ámbar */
export function OpcionSeleccion({
  alElegir,
  deshabilitada = false,
  detalle,
  elegida,
  nombre,
  rotulo,
}: PropiedadesOpcionSeleccion) {
  const { colores } = useTema();

  return (
    <Pressable
      accessibilityLabel={nombre}
      accessibilityRole="radio"
      accessibilityState={{ checked: elegida, disabled: deshabilitada }}
      disabled={deshabilitada}
      onPress={alElegir}
      style={{ opacity: deshabilitada ? 0.55 : 1 }}
    >
      <Bloque estiloContenido={estilos.fila} hundido={elegida}>
        <View style={estilos.texto}>
          <Text style={[tipografia.nombreFila, { color: colores.tinta }]}>
            {nombre}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {detalle}
          </Text>
        </View>
        {rotulo ? (
          <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
            {rotulo}
          </Text>
        ) : (
          <Loseta tamano={36} variante={elegida ? 'ambar' : 'claro'}>
            {elegida && (
              <Icono
                color={colores.sobreAmbar}
                nombre="confirmar"
                tamano="mediano"
              />
            )}
          </Loseta>
        )}
      </Bloque>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
    padding: espacios.dieciseis,
  },
  texto: { flex: 1, gap: 2 },
});
