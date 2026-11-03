import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export interface LugarCampo {
  codigo: string;
  id: string;
  nombre: string;
}

export interface PropiedadesCampoLugar {
  alCambiar: (id: string) => void;
  etiqueta: string;
  lugares: readonly LugarCampo[];
  marcador: string;
  valorId: string | null;
}

/** selector de terminal con autocompletado; la terminal elegida siempre conserva una etiqueta accesible. */
export function CampoLugar({
  alCambiar,
  etiqueta,
  lugares,
  marcador,
  valorId,
}: PropiedadesCampoLugar) {
  const { colores } = useTema();
  const [consulta, establecerConsulta] = useState('');
  const [abierto, establecerAbierto] = useState(false);
  const elegido = lugares.find((lugar) => lugar.id === valorId);
  const visibles = useMemo(() => {
    const termino = consulta.trim().toLocaleLowerCase('es-NI');
    if (termino === '') return lugares;
    return lugares.filter((lugar) =>
      `${lugar.nombre} ${lugar.codigo}`
        .toLocaleLowerCase('es-NI')
        .includes(termino),
    );
  }, [consulta, lugares]);

  function seleccionar(id: string) {
    alCambiar(id);
    establecerConsulta('');
    establecerAbierto(false);
  }

  return (
    <View style={estilos.contenedor}>
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {etiqueta}
      </Text>
      <Bloque estiloContenido={estilos.campo} hundido radio="loseta">
        <Icono nombre="lupa" tamano="mediano" />
        <TextInput
          accessibilityLabel={etiqueta}
          onChangeText={(texto) => {
            establecerConsulta(texto);
            establecerAbierto(true);
          }}
          onFocus={() => establecerAbierto(true)}
          placeholder={marcador}
          placeholderTextColor={colores.tintaSuave}
          style={[tipografia.cuerpo, estilos.entrada, { color: colores.tinta }]}
          value={abierto ? consulta : (elegido?.nombre ?? '')}
        />
      </Bloque>
      {abierto && (
        <View accessibilityLabel={etiqueta} style={estilos.opciones}>
          {visibles.map((lugar) => (
            <Pressable
              accessibilityLabel={lugar.nombre}
              accessibilityRole="button"
              key={lugar.id}
              onPress={() => seleccionar(lugar.id)}
            >
              <Bloque estiloContenido={estilos.opcion} radio="loseta">
                <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
                  {lugar.nombre}
                </Text>
                <Text style={[tipografia.dato, { color: colores.ambarTexto }]}>
                  {lugar.codigo}
                </Text>
              </Bloque>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.ocho,
    minHeight: tamanosControl.toqueMinimo,
    paddingHorizontal: espacios.doce,
  },
  contenedor: { gap: espacios.ocho },
  entrada: { flex: 1, minHeight: tamanosControl.toqueMinimo },
  opcion: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: tamanosControl.toqueMinimo,
    paddingHorizontal: espacios.dieciseis,
  },
  opciones: { gap: espacios.ocho },
});
