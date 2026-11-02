import type { TipoServicio } from '@anden/dominio';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { Chip } from '@/componentes/Chip';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { TableroSalidas } from '@/componentes/TableroSalidas';
import { useSalidas } from '@/datos/useSalidas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

type Filtro = TipoServicio | 'todos';

const FILTROS: readonly { clave: Filtro; etiqueta: () => string }[] = [
  { clave: 'todos', etiqueta: () => t('horarios.todos') },
  { clave: 'ordinario', etiqueta: () => t('servicios.ordinario') },
  { clave: 'expreso', etiqueta: () => t('servicios.expreso') },
  { clave: 'taxi-interlocal', etiqueta: () => t('servicios.taxi') },
];

/** el tablero de salidas de la terminal, con filtro por servicio */
export function Horarios() {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { salidas } = useSalidas();
  const [filtro, establecerFiltro] = useState<Filtro>('todos');
  const visibles =
    filtro === 'todos'
      ? salidas
      : salidas.filter((salida) => salida.servicio === filtro);

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        { paddingBottom: 130, paddingTop: margenes.top + 8 },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <View style={estilos.cabecera}>
        <Text style={[estilos.titulo, { color: colores.tinta }]}>
          {t('horarios.titulo')}
          <Text style={{ color: colores.ambarTitular }}>.</Text>
        </Text>
        <Bloque estiloContenido={estilos.buscar} radio="pildora">
          <Icono
            etiquetaAccesible={t('horarios.buscar')}
            nombre="lupa"
            tamano="ilustracion"
          />
        </Bloque>
      </View>

      <Bloque estilo={estilos.terminal} estiloContenido={estilos.filaTerminal}>
        <Loseta tamano={50} variante="ambar">
          <Text style={[tipografia.dato, { color: colores.sobreAmbar }]}>
            UCA
          </Text>
        </Loseta>
        <View style={estilos.datosTerminal}>
          <Text style={[estilos.nombreTerminal, { color: colores.tinta }]}>
            {t('horarios.terminal')}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('horarios.ciudad')}
          </Text>
        </View>
      </Bloque>

      <ScrollView
        contentContainerStyle={estilos.filtros}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {FILTROS.map(({ clave, etiqueta }) => (
          <Chip
            alCambiar={() => establecerFiltro(clave)}
            etiqueta={etiqueta()}
            key={clave}
            seleccionado={filtro === clave}
          />
        ))}
      </ScrollView>

      <View style={estilos.tablero}>
        <TableroSalidas salidas={visibles} />
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  buscar: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  cabecera: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contenido: { paddingHorizontal: espacios.lateral },
  datosTerminal: { flex: 1 },
  filaTerminal: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  filtros: { gap: 10, paddingVertical: 14 },
  nombreTerminal: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 17,
    lineHeight: 21,
  },
  tablero: { marginTop: 2 },
  terminal: { marginTop: 14 },
  titulo: {
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 46,
    lineHeight: 48,
  },
});
