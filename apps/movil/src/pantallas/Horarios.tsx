import type { TipoServicio } from '@anden/dominio';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Chip } from '@/componentes/Chip';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { MarcoPestana } from '@/componentes/MarcoPestana';
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

export interface PropiedadesHorarios {
  alAbrirBuscador?: () => void;
}

/** el tablero de salidas de la terminal, con filtro por servicio */
export function Horarios({ alAbrirBuscador }: PropiedadesHorarios) {
  const { colores } = useTema();
  const { datos, salidas } = useSalidas();
  const terminal = datos.terminales.find(
    (candidata) => candidata.id === 'ter_may',
  );
  const [filtro, establecerFiltro] = useState<Filtro>('todos');
  const visibles =
    filtro === 'todos'
      ? salidas
      : salidas.filter((salida) => salida.servicio === filtro);

  return (
    <MarcoPestana>
      <View style={estilos.cabecera}>
        <Text style={[estilos.titulo, { color: colores.tinta }]}>
          {t('horarios.titulo')}
          <Text style={{ color: colores.ambarTitular }}>.</Text>
        </Text>
        <Pressable
          accessibilityLabel={t('horarios.buscar')}
          accessibilityRole="button"
          onPress={alAbrirBuscador}
        >
          <Bloque estiloContenido={estilos.buscar} radio="pildora">
            <Icono nombre="lupa" tamano="ilustracion" />
          </Bloque>
        </Pressable>
      </View>

      <Bloque estilo={estilos.terminal} estiloContenido={estilos.filaTerminal}>
        <Loseta tamano={50} variante="ambar">
          <Text style={[tipografia.dato, { color: colores.sobreAmbar }]}>
            {terminal?.codigo}
          </Text>
        </Loseta>
        <View style={estilos.datosTerminal}>
          <Text style={[estilos.nombreTerminal, { color: colores.tinta }]}>
            {terminal?.nombre}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {terminal?.ciudad}
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
    </MarcoPestana>
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
