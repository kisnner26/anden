import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Aparece } from '@/componentes/Aparece';
import { Autobus, varianteDeClave } from '@/componentes/Autobus';
import { Bloque } from '@/componentes/Bloque';
import { agruparPorDestino } from '@/datos/historialViajes';
import { formatoFechaCorta } from '@/datos/formato';
import type { BoletoGuardado } from '@/datos/reserva';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesHistorialViajes {
  alAbrirBoleto: (boletoId: string) => void;
  boletos: readonly BoletoGuardado[];
}

/** divide en filas de dos para que todas las casillas midan lo mismo y queden centradas */
function enPares<T>(lista: readonly T[]): (T | null)[][] {
  const filas: (T | null)[][] = [];
  for (let i = 0; i < lista.length; i += 2) {
    filas.push([lista[i] ?? null, lista[i + 1] ?? null]);
  }
  return filas;
}

/** los viajes ya hechos: tres cifras iguales, una casilla por destino y, al tocarla, cada viaje */
export function HistorialViajes({
  alAbrirBoleto,
  boletos,
}: PropiedadesHistorialViajes) {
  const { colores } = useTema();
  const [abierto, establecerAbierto] = useState<string | null>(null);
  const grupos = agruparPorDestino(boletos);
  const elegido = grupos.find((grupo) => grupo.destino === abierto);
  const ultimo = [...boletos].sort(
    (a, b) =>
      new Date(b.resumen.salida).getTime() -
      new Date(a.resumen.salida).getTime(),
  )[0];

  const cifras: [string, string][] = [
    [String(boletos.length), t('boletos.viajesHechos')],
    [String(grupos.length), t('boletos.destinosVisitados')],
    [
      ultimo ? formatoFechaCorta(new Date(ultimo.resumen.salida)) : '—',
      t('boletos.ultimoViaje'),
    ],
  ];

  return (
    <View style={estilos.contenedor}>
      <Bloque estiloContenido={estilos.cifras}>
        {cifras.map(([valor, etiqueta], indice) => (
          <View
            key={etiqueta}
            style={[
              estilos.cifra,
              indice > 0 && {
                borderLeftColor: colores.linea,
                borderLeftWidth: 1,
              },
            ]}
          >
            <Text style={[tipografia.dato, { color: colores.tinta }]}>
              {valor}
            </Text>
            <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
              {etiqueta}
            </Text>
          </View>
        ))}
      </Bloque>

      {enPares(grupos).map((fila, indiceFila) => (
        <View key={fila[0]?.destino ?? indiceFila} style={estilos.fila}>
          {fila.map((grupo, indice) =>
            grupo ? (
              <Aparece indice={indiceFila * 2 + indice} key={grupo.destino}>
                <Pressable
                  accessibilityLabel={`${grupo.destino}, ${grupo.boletos.length} ${t('boletos.viajesHechos').toLowerCase()}`}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: abierto === grupo.destino }}
                  onPress={() =>
                    establecerAbierto(
                      abierto === grupo.destino ? null : grupo.destino,
                    )
                  }
                  style={estilos.casilla}
                >
                  <Bloque
                    estiloContenido={[
                      estilos.casillaContenido,
                      abierto === grupo.destino && {
                        borderColor: colores.ambar,
                        borderWidth: 2,
                      },
                    ]}
                  >
                    <Autobus
                      ancho={96}
                      variante={varianteDeClave(grupo.destino)}
                    />
                    <Text
                      numberOfLines={1}
                      style={[tipografia.nombreFila, { color: colores.tinta }]}
                    >
                      {grupo.destino}
                    </Text>
                    <Text
                      style={[
                        tipografia.etiqueta,
                        { color: colores.ambarTexto },
                      ]}
                    >
                      {`${grupo.boletos.length} ${t('boletos.viajesHechos')}`}
                    </Text>
                  </Bloque>
                </Pressable>
              </Aparece>
            ) : (
              <View key={`vacio${indice}`} style={estilos.casilla} />
            ),
          )}
        </View>
      ))}

      {elegido && (
        <Aparece>
          <Bloque estiloContenido={estilos.viajes} hundido radio="loseta">
            <Text
              style={[
                tipografia.etiqueta,
                estilos.centrado,
                { color: colores.tintaSuave },
              ]}
            >
              {elegido.destino}
            </Text>
            {enPares(elegido.boletos).map((fila, indiceFila) => (
              <View key={fila[0]?.boleto.id ?? indiceFila} style={estilos.fila}>
                {fila.map((guardado, indice) =>
                  guardado ? (
                    <Pressable
                      accessibilityRole="button"
                      key={guardado.boleto.id}
                      onPress={() => alAbrirBoleto(guardado.boleto.id)}
                      style={estilos.viaje}
                    >
                      <Text
                        style={[tipografia.pequeno, { color: colores.tinta }]}
                      >
                        {`${formatoFechaCorta(new Date(guardado.resumen.salida))} · ${t('boletos.asientoCorto')} ${guardado.boleto.asiento}`}
                      </Text>
                    </Pressable>
                  ) : (
                    <View key={`libre${indice}`} style={estilos.viaje} />
                  ),
                )}
              </View>
            ))}
          </Bloque>
        </Aparece>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  casilla: { flex: 1 },
  casillaContenido: {
    alignItems: 'center',
    gap: espacios.cuatro,
    padding: espacios.dieciseis,
  },
  centrado: { textAlign: 'center' },
  cifra: { alignItems: 'center', flex: 1, gap: espacios.cuatro },
  cifras: { flexDirection: 'row', paddingVertical: espacios.dieciseis },
  contenedor: { gap: espacios.doce },
  fila: { flexDirection: 'row', gap: espacios.doce },
  viaje: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  viajes: { gap: espacios.ocho, padding: espacios.dieciseis },
});
