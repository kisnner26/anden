import { StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { Presionable } from '@/componentes/Presionable';
import { formatoHora, sufijoHora } from '@/datos/formato';
import type { Salida } from '@/datos/salidas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesResumenDelDiaChofer {
  alAbrirProximo: (viajeId: string) => void;
  cobrado: number;
  pasajeros: number;
  /** el viaje que sigue; nulo si ya no quedan por hacer hoy */
  proximo: Salida | null;
  viajes: number;
}

function Cifra({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const { colores } = useTema();
  return (
    <Bloque estilo={estilos.cifra} estiloContenido={estilos.cifraContenido}>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        numberOfLines={1}
        style={[tipografia.datoGrande, { color: colores.tinta }]}
      >
        {valor}
      </Text>
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {etiqueta}
      </Text>
    </Bloque>
  );
}

/** lo primero que ve el chofer: cuánto lleva el día y cuál es el viaje que sigue, a un toque de abrirlo */
export function ResumenDelDiaChofer({
  alAbrirProximo,
  cobrado,
  pasajeros,
  proximo,
  viajes,
}: PropiedadesResumenDelDiaChofer) {
  const { colores } = useTema();
  return (
    <View style={estilos.contenedor} testID="resumen-del-dia">
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {t('panelChofer.resumenDelDia')}
      </Text>
      <View style={estilos.cifras}>
        <Cifra etiqueta={t('panelChofer.viajesHoy')} valor={String(viajes)} />
        <Cifra
          etiqueta={t('panelChofer.pasajeros')}
          valor={String(pasajeros)}
        />
        <Cifra etiqueta={t('panelChofer.cobrado')} valor={`C$ ${cobrado}`} />
      </View>
      {proximo ? (
        <Presionable
          accessibilityLabel={rellenar(t('panelChofer.abrir'), {
            destino: proximo.destino,
          })}
          accessibilityRole="button"
          onPress={() => alAbrirProximo(proximo.viajeId)}
        >
          <Bloque estiloContenido={estilos.proximo}>
            <View style={estilos.hora}>
              <Text
                style={[tipografia.datoGrande, { color: colores.ambarTexto }]}
              >
                {formatoHora(proximo.salida)}
              </Text>
              <Text
                style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
              >
                {sufijoHora(proximo.salida)}
              </Text>
            </View>
            <View style={estilos.texto}>
              <Text
                style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
              >
                {t('panelChofer.sigue')}
              </Text>
              <Text
                numberOfLines={1}
                style={[tipografia.subtitulo, { color: colores.tinta }]}
              >
                {`${proximo.origen} → ${proximo.destino}`}
              </Text>
              <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
                {proximo.placa}
              </Text>
            </View>
            <Icono nombre="siguiente" tamano="mediano" />
          </Bloque>
        </Presionable>
      ) : (
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('panelChofer.sinProximo')}
        </Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  cifra: { flex: 1 },
  cifraContenido: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: espacios.ocho,
    paddingVertical: espacios.doce,
  },
  cifras: { flexDirection: 'row', gap: espacios.ocho },
  contenedor: { gap: espacios.ocho },
  hora: { alignItems: 'center', minWidth: 64 },
  proximo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    padding: espacios.dieciseis,
  },
  texto: { flex: 1, gap: 2 },
});
