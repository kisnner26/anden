import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

interface PropiedadesRutaFrecuente {
  alPresionar: () => void;
  destino: string;
  etiqueta: string;
  origen: string;
  proximaHora?: string;
}

export function RutaFrecuente({
  alPresionar,
  destino,
  etiqueta,
  origen,
  proximaHora,
}: PropiedadesRutaFrecuente) {
  const { colores } = useTema();
  const descripcion = `${origen}, ${destino}${proximaHora ? `, ${proximaHora}` : ''}`;

  return (
    <Pressable
      accessibilityHint={descripcion}
      accessibilityLabel={etiqueta}
      accessibilityRole="button"
      onPress={alPresionar}
    >
      <Bloque estiloContenido={estilos.contenido} radio="tarjeta">
        <View style={estilos.trayecto}>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {origen}
          </Text>
          <View style={[estilos.linea, { backgroundColor: colores.ambar }]} />
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {destino}
          </Text>
          {proximaHora && (
            <Text style={[tipografia.dato, { color: colores.ambarTexto }]}>
              {proximaHora}
            </Text>
          )}
        </View>
        <Icono nombre="siguiente" tamano="mediano" />
      </Bloque>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    minHeight: tamanosControl.altoBoton + espacios.dieciseis,
    padding: espacios.dieciseis,
  },
  linea: { height: 2, width: espacios.treintaYDos },
  trayecto: { flex: 1 },
});
