import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { Rebote } from '@/componentes/Rebote';
import { Icono, type NombreIcono } from '@/componentes/Icono';
import {
  disposicionPantalla,
  espacios,
  radios,
  tamanosBarraPestanas,
} from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { movimiento } from '@/tema/movimiento';
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
  const margenes = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        estilos.flotante,
        { bottom: tamanosBarraPestanas.margenInferior + margenes.bottom },
      ]}
    >
      <View style={estilos.marco}>
        <Bloque
          estiloContenido={estilos.fila}
          radio="pildora"
          testID="barra-pestanas"
        >
          {pestanas.map((pestana) => {
            const seleccionada = pestana.clave === activa;
            const contenido = (
              <>
                <Rebote activo={seleccionada}>
                  <Icono
                    color={
                      seleccionada ? colores.sobreNegro : colores.tintaSuave
                    }
                    colorDetalle={
                      seleccionada ? colores.bloqueNegro : colores.barroClaro
                    }
                    nombre={pestana.icono}
                    tamano="destacado"
                  />
                </Rebote>
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
                style={({ pressed }) => [
                  estilos.pestana,
                  pressed && estilos.presionada,
                ]}
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
    maxWidth: tamanosBarraPestanas.anchoPestana,
    width: '100%',
  },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    height: tamanosBarraPestanas.alto,
    justifyContent: 'space-between',
    paddingHorizontal: tamanosBarraPestanas.rellenoHorizontal,
  },
  flotante: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  inactiva: {
    alignItems: 'center',
    gap: espacios.cuatro,
    height: tamanosBarraPestanas.altoPestana,
    justifyContent: 'center',
    maxWidth: tamanosBarraPestanas.anchoPestana,
    width: '100%',
  },
  marco: {
    maxWidth: disposicionPantalla.anchoMaximo,
    paddingHorizontal: tamanosBarraPestanas.margenLateral,
    width: '100%',
  },
  nombre: { fontFamily: 'Archivo_600SemiBold', fontSize: 11, lineHeight: 14 },
  pestana: { alignItems: 'center', flex: 1 },
  presionada: {
    opacity: 0.9,
    transform: [{ scale: movimiento.escalaPresion }],
  },
});
