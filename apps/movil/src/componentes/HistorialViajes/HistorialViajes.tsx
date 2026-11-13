import { StyleSheet, Text, View } from 'react-native';

import {
  Autobus,
  colorDeDestino,
  varianteDeClave,
} from '@/componentes/Autobus';
import { Bloque } from '@/componentes/Bloque';
import { ResumenPlus } from '@/componentes/ResumenPlus';
import { CalendarioViajes } from '@/componentes/CalendarioViajes';
import { agruparPorDestino } from '@/datos/historialViajes';
import { useSuscripcion } from '@/datos/useSuscripcion';
import type { BoletoGuardado } from '@/datos/reserva';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesHistorialViajes {
  ahora: Date;
  alAbrirBoleto: (boletoId: string) => void;
  boletos: readonly BoletoGuardado[];
  alAbrirPlus?: () => void;
}

/** los viajes ya hechos: tres cifras grandes, el calendario con un círculo de color por destino y la leyenda de colores */
export function HistorialViajes({
  ahora,
  alAbrirBoleto,
  alAbrirPlus,
  boletos,
}: PropiedadesHistorialViajes) {
  const { colores } = useTema();
  const grupos = agruparPorDestino(boletos);
  const { plus } = useSuscripcion();

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.cifras}>
        {(
          [
            [boletos.length, t('boletos.viajesHechos')],
            [grupos.length, t('boletos.destinosVisitados')],
          ] as const
        ).map(([valor, etiqueta]) => (
          <Bloque
            estilo={estilos.cifra}
            estiloContenido={estilos.cifraContenido}
            key={etiqueta}
          >
            <Text style={[tipografia.display, { color: colores.tinta }]}>
              {valor}
            </Text>
            <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
              {etiqueta}
            </Text>
          </Bloque>
        ))}
      </View>

      <CalendarioViajes
        ahora={ahora}
        alAbrirBoleto={alAbrirBoleto}
        boletos={boletos}
      />

      <ResumenPlus alAbrirPlus={alAbrirPlus} boletos={boletos} plus={plus} />

      <View style={estilos.leyenda}>
        {grupos.map((grupo) => (
          <View key={grupo.destino} style={estilos.destino}>
            <View
              style={[
                estilos.punto,
                { backgroundColor: colorDeDestino(grupo.destino) },
              ]}
            />
            <Autobus ancho={44} variante={varianteDeClave(grupo.destino)} />
            <Text style={[tipografia.nombreLinea, { color: colores.tinta }]}>
              {grupo.destino}
            </Text>
            <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
              {grupo.boletos.length}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  cifra: { flex: 1 },
  cifraContenido: {
    alignItems: 'center',
    gap: espacios.cuatro,
    padding: espacios.dieciseis,
  },
  cifras: { flexDirection: 'row', gap: espacios.dieciseis },
  contenedor: { gap: espacios.treintaYDos },
  destino: { alignItems: 'center', flexDirection: 'row', gap: espacios.ocho },
  leyenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacios.veinticuatro,
    justifyContent: 'center',
  },
  punto: { borderRadius: radios.pildora, height: 12, width: 12 },
});
