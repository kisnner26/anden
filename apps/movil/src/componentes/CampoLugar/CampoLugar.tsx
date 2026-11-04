import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export interface LugarCampo {
  ciudad?: string;
  codigo: string;
  id: string;
  nombre: string;
}

export interface PropiedadesCampoLugar {
  alCambiar: (id: string) => void;
  etiqueta: string;
  lugares: readonly LugarCampo[];
  marcador: string;
  textoSinResultados: string;
  valorId: string | null;
}

export interface PropiedadesCamposLugares {
  alCambiarDestino: (id: string) => void;
  alCambiarOrigen: (id: string) => void;
  destinoId: string | null;
  etiquetaDestino: string;
  etiquetaIntercambiar: string;
  etiquetaOrigen: string;
  lugares: readonly LugarCampo[];
  marcador: string;
  origenId: string | null;
  textoSinResultados: string;
}

/** selector de terminal con autocompletado; la terminal elegida siempre conserva una etiqueta accesible. */
export function CampoLugar({
  alCambiar,
  etiqueta,
  lugares,
  marcador,
  textoSinResultados,
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
      `${lugar.nombre} ${lugar.ciudad ?? ''} ${lugar.codigo}`
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
          {visibles.length === 0 && (
            <Text
              accessibilityLiveRegion="polite"
              style={[tipografia.pequeno, { color: colores.tintaSuave }]}
            >
              {textoSinResultados}
            </Text>
          )}
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

/** par de campos para buscar un viaje; el control central intercambia el recorrido sin perder selección. */
export function CamposLugares({
  alCambiarDestino,
  alCambiarOrigen,
  destinoId,
  etiquetaDestino,
  etiquetaIntercambiar,
  etiquetaOrigen,
  lugares,
  marcador,
  origenId,
  textoSinResultados,
}: PropiedadesCamposLugares) {
  const { colores } = useTema();
  const intercambiar = () => {
    if (origenId === null || destinoId === null) return;
    alCambiarOrigen(destinoId);
    alCambiarDestino(origenId);
  };
  return (
    <View style={estilos.pareja}>
      <CampoLugar
        alCambiar={alCambiarOrigen}
        etiqueta={etiquetaOrigen}
        lugares={lugares}
        marcador={marcador}
        textoSinResultados={textoSinResultados}
        valorId={origenId}
      />
      <Pressable
        accessibilityLabel={etiquetaIntercambiar}
        accessibilityRole="button"
        disabled={origenId === null || destinoId === null}
        onPress={intercambiar}
        style={estilos.intercambiar}
      >
        <Bloque estiloContenido={estilos.botonIntercambiar} radio="pildora">
          <Icono color={colores.tinta} nombre="siguiente" tamano="mediano" />
        </Bloque>
      </Pressable>
      <CampoLugar
        alCambiar={alCambiarDestino}
        etiqueta={etiquetaDestino}
        lugares={lugares}
        marcador={marcador}
        textoSinResultados={textoSinResultados}
        valorId={destinoId}
      />
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
  botonIntercambiar: {
    alignItems: 'center',
    height: tamanosControl.toqueMinimo,
    justifyContent: 'center',
    transform: [{ rotate: '90deg' }],
    width: tamanosControl.toqueMinimo,
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
  pareja: { gap: espacios.ocho },
  intercambiar: { alignSelf: 'center' },
});
