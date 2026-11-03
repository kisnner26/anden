import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { EtiquetaMuestra } from '@/componentes/EtiquetaMuestra';
import { obtenerMuestra } from '@/datos/useSalidas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

/** detalle local de una ruta de muestra. */
export default function DetalleRuta() {
  const { colores } = useTema();
  const { id } = useLocalSearchParams<{ id: string }>();
  const datos = obtenerMuestra();
  const ruta = datos.rutas.find((candidata) => candidata.id === id);
  const destino = datos.terminales.find(
    (terminal) => terminal.id === ruta?.destinoId,
  );
  if (!ruta || !destino) return null;
  return (
    <ScrollView
      contentContainerStyle={{
        gap: espacios.dieciseis,
        padding: espacios.veinticuatro,
      }}
      style={{ backgroundColor: colores.fondo }}
    >
      <Text style={[tipografia.titulo, { color: colores.tinta }]}>
        {destino.ciudad}
      </Text>
      <EtiquetaMuestra />
      <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
        Paradas
      </Text>
      {ruta.paradas.map((parada) => (
        <View key={parada.minutosDesdeOrigen}>
          <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
            {parada.tipo === 'terminal'
              ? datos.terminales.find(
                  (terminal) => terminal.id === parada.terminalId,
                )?.nombre
              : parada.nombre}
          </Text>
          <Text style={[tipografia.dato, { color: colores.tintaSuave }]}>
            {parada.minutosDesdeOrigen} min
          </Text>
        </View>
      ))}
      <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
        Tarifas de muestra
      </Text>
      {datos.tarifario
        .filter((tarifa) => tarifa.rutaId === ruta.id)
        .map((tarifa) => (
          <Text
            key={tarifa.servicio}
            style={[tipografia.dato, { color: colores.ambarTexto }]}
          >
            {tarifa.servicio}: C$ {tarifa.cordobas}
          </Text>
        ))}
    </ScrollView>
  );
}
