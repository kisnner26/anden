import { asientosDe, PLANOS, type ConfiguracionBus } from '@anden/dominio';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icono } from '@/componentes/Icono';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface OcupanteDelPlano {
  asiento: number;
  boletoId: string;
  nombre: string;
}

export interface PropiedadesPlanoDeOcupacion {
  /** quienes ya subieron */
  abordo: (boletoId: string) => boolean;
  alAbrir: (boletoId: string) => void;
  configuracion: ConfiguracionBus;
  ocupantes: readonly OcupanteDelPlano[];
}

const LADO = 40;

/**
 * el bus visto desde arriba para el chofer: cada asiento reservado está marcado y es el de esa persona, garantizado; al
 * tocarlo se abre su ficha. Los que ya subieron se ven llenos
 */
export function PlanoDeOcupacion({
  abordo,
  alAbrir,
  configuracion,
  ocupantes,
}: PropiedadesPlanoDeOcupacion) {
  const { colores } = useTema();
  const numeroDe = new Map<string, number>();
  for (const asiento of asientosDe(configuracion)) {
    numeroDe.set(`${asiento.fila}:${asiento.columna}`, asiento.numero);
  }
  const porAsiento = new Map(ocupantes.map((o) => [o.asiento, o]));

  return (
    <View style={estilos.bus} testID="plano-de-ocupacion">
      {PLANOS[configuracion].map((fila, indice) => (
        <View key={indice} style={estilos.fila}>
          {fila.map((celda, columna) => {
            const clave = `${indice}:${columna}`;
            if (celda !== 'asiento') {
              return (
                <View
                  key={clave}
                  style={[
                    estilos.casilla,
                    celda === 'volante' && {
                      borderColor: colores.tintaSuave,
                      borderRadius: radios.pildora,
                      borderWidth: 2,
                    },
                  ]}
                />
              );
            }
            const numero = numeroDe.get(clave) ?? 0;
            const ocupante = porAsiento.get(numero);
            const subio = ocupante ? abordo(ocupante.boletoId) : false;
            if (!ocupante) {
              return (
                <View
                  accessibilityLabel={rellenar(t('plano.libre'), { n: numero })}
                  accessible
                  key={clave}
                  style={[
                    estilos.asiento,
                    { borderColor: conAlfa(colores.tinta, 0.2) },
                  ]}
                >
                  <Text
                    style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                  >
                    {numero}
                  </Text>
                </View>
              );
            }
            return (
              <Pressable
                accessibilityLabel={rellenar(
                  subio ? t('plano.abordo') : t('plano.reservado'),
                  { n: numero, nombre: ocupante.nombre },
                )}
                accessibilityRole="button"
                key={clave}
                onPress={() => alAbrir(ocupante.boletoId)}
                style={[
                  estilos.asiento,
                  subio
                    ? {
                        backgroundColor: colores.bloqueNegro,
                        borderColor: colores.bloqueNegro,
                      }
                    : {
                        backgroundColor: conAlfa(colores.ambar, 0.3),
                        borderColor: colores.ambar,
                      },
                ]}
              >
                {subio ? (
                  <Icono
                    color={colores.sobreNegro}
                    nombre="confirmar"
                    tamano="pequeno"
                  />
                ) : (
                  <Text style={[tipografia.dato, { color: colores.tinta }]}>
                    {numero}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  asiento: {
    alignItems: 'center',
    borderRadius: radios.loseta,
    borderWidth: 1.5,
    height: LADO,
    justifyContent: 'center',
    width: LADO,
  },
  bus: { alignItems: 'center', gap: espacios.ocho },
  casilla: { height: LADO, width: LADO },
  fila: { flexDirection: 'row', gap: espacios.ocho },
});
