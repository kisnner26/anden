import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Aparece } from '@/componentes/Aparece';
import { Autobus, varianteDeClave } from '@/componentes/Autobus';
import { Bloque } from '@/componentes/Bloque';
import { Chip } from '@/componentes/Chip';
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

/** los viajes ya hechos: un resumen y una casilla por destino que, al tocarla, muestra cada viaje */
export function HistorialViajes({
  alAbrirBoleto,
  boletos,
}: PropiedadesHistorialViajes) {
  const { colores } = useTema();
  const [abierto, establecerAbierto] = useState<string | null>(null);
  const grupos = agruparPorDestino(boletos);
  const elegido = grupos.find((grupo) => grupo.destino === abierto);

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.resumen}>
        <View style={estilos.cifra}>
          <Text style={[tipografia.display, { color: colores.tinta }]}>
            {boletos.length}
          </Text>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {t('boletos.viajesHechos')}
          </Text>
        </View>
        <View style={estilos.cifra}>
          <Text style={[tipografia.display, { color: colores.tinta }]}>
            {grupos.length}
          </Text>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {t('boletos.destinosVisitados')}
          </Text>
        </View>
      </View>

      <View style={estilos.rejilla}>
        {grupos.map((grupo, indice) => (
          <Aparece indice={indice} key={grupo.destino}>
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
              <Bloque estiloContenido={estilos.casillaContenido}>
                <Autobus ancho={88} variante={varianteDeClave(grupo.destino)} />
                <Text
                  numberOfLines={1}
                  style={[tipografia.nombreFila, { color: colores.tinta }]}
                >
                  {grupo.destino}
                </Text>
                <Text
                  style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
                >
                  {`${grupo.boletos.length} ${t('boletos.viajesHechos')}`}
                </Text>
              </Bloque>
            </Pressable>
          </Aparece>
        ))}
      </View>

      {elegido && (
        <Aparece>
          <View style={estilos.viajes}>
            <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
              {elegido.destino}
            </Text>
            <View style={estilos.chips}>
              {elegido.boletos.map((guardado) => (
                <Chip
                  alCambiar={() => alAbrirBoleto(guardado.boleto.id)}
                  etiqueta={`${formatoFechaCorta(new Date(guardado.resumen.salida))} · ${t('boletos.asientoCorto')} ${guardado.boleto.asiento}`}
                  key={guardado.boleto.id}
                  seleccionado={false}
                />
              ))}
            </View>
          </View>
        </Aparece>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  casilla: { flexBasis: '47%', flexGrow: 1 },
  casillaContenido: {
    alignItems: 'center',
    gap: espacios.cuatro,
    padding: espacios.dieciseis,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
  cifra: { flex: 1, gap: espacios.cuatro },
  contenedor: { gap: espacios.dieciseis },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.doce },
  resumen: { flexDirection: 'row', gap: espacios.dieciseis },
  viajes: { gap: espacios.ocho },
});
