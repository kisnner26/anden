import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Icono, type NombreIcono } from '@/componentes/Icono';
import { espacios, radios, tamanosBarraPestanas } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export interface Pestana {
  clave: string;
  icono: NombreIcono;
  nombre: string;
}

export interface PropiedadesBarraPestanas {
  activa: string;
  alSeleccionar: (clave: string) => void;
  pestanas: readonly Pestana[];
}

/** barra flotante de barro: la pestaña activa es una píldora negra con su ícono relleno y su nombre */
export function BarraPestanas({
  activa,
  alSeleccionar,
  pestanas,
}: PropiedadesBarraPestanas) {
  const { colores } = useTema();

  return (
    <View pointerEvents="box-none" style={estilos.flotante}>
      <Bloque
        estiloContenido={estilos.fila}
        radio="pildora"
        testID="barra-pestanas"
      >
        {pestanas.map((pestana) => {
          const seleccionada = pestana.clave === activa;
          const contenido = (
            <>
              <Icono
                color={seleccionada ? colores.sobreNegro : colores.tintaSuave}
                colorDetalle={
                  seleccionada ? colores.bloqueNegro : colores.barroClaro
                }
                nombre={pestana.icono}
                tamano="destacado"
              />
              <Text
                style={[
                  tipografia.pequeno,
                  estilos.nombre,
                  {
                    color: seleccionada
                      ? colores.sobreNegro
                      : colores.tintaSuave,
                  },
                ]}
              >
                {pestana.nombre}
              </Text>
            </>
          );

          return (
            <Pressable
              accessibilityLabel={pestana.nombre}
              accessibilityRole="tab"
              accessibilityState={{ selected: seleccionada }}
              key={pestana.clave}
              onPress={() => alSeleccionar(pestana.clave)}
              style={estilos.pestana}
            >
              {seleccionada ? (
                <LinearGradient
                  colors={[colores.bloqueNegroClaro, colores.bloqueNegro]}
                  end={{ x: 1, y: 1 }}
                  start={{ x: 0, y: 0 }}
                  style={estilos.activa}
                >
                  {contenido}
                </LinearGradient>
              ) : (
                <View style={estilos.inactiva}>{contenido}</View>
              )}
            </Pressable>
          );
        })}
      </Bloque>
    </View>
  );
}

const estilos = StyleSheet.create({
  activa: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    gap: espacios.cuatro,
    height: tamanosBarraPestanas.altoPestana,
    justifyContent: 'center',
    width: tamanosBarraPestanas.anchoPestana,
  },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    height: tamanosBarraPestanas.alto,
    justifyContent: 'space-between',
    paddingHorizontal: tamanosBarraPestanas.rellenoHorizontal,
  },
  flotante: {
    bottom: tamanosBarraPestanas.margenInferior,
    left: tamanosBarraPestanas.margenLateral,
    position: 'absolute',
    right: tamanosBarraPestanas.margenLateral,
  },
  inactiva: {
    alignItems: 'center',
    gap: espacios.cuatro,
    height: tamanosBarraPestanas.altoPestana,
    justifyContent: 'center',
    width: tamanosBarraPestanas.anchoPestana,
  },
  nombre: { fontFamily: 'Archivo_600SemiBold', fontSize: 11, lineHeight: 14 },
  pestana: { alignItems: 'center' },
});
