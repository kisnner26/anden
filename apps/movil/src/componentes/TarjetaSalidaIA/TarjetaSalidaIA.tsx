import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { FotoDestino } from '@/componentes/FotoDestino';
import { Icono } from '@/componentes/Icono';
import { formatoHora, sufijoHora } from '@/datos/formato';
import { cuandoSale } from '@/datos/conversacionIA';
import { etiquetaPunto } from '@/datos/puntoEncuentro';
import type { Salida } from '@/datos/salidas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesTarjetaSalidaIA {
  alAbrir: (viajeId: string) => void;
  salida: Salida;
}

function Dato({ rotulo, valor }: { rotulo: string; valor: string }) {
  const { colores } = useTema();
  return (
    <View style={estilos.dato}>
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {rotulo}
      </Text>
      <Text
        numberOfLines={1}
        style={[tipografia.subtitulo, { color: colores.tinta }]}
      >
        {valor}
      </Text>
    </View>
  );
}

/** una salida real que el asistente recomienda: foto del destino, hora grande y lo que importa para decidir */
export function TarjetaSalidaIA({
  alAbrir,
  salida,
}: PropiedadesTarjetaSalidaIA) {
  const { colores } = useTema();
  return (
    <Pressable
      accessibilityLabel={rellenar(t('asistenteRico.salidaDe'), {
        cuando: cuandoSale(salida.salida),
        destino: salida.destino,
        origen: salida.origen,
      })}
      accessibilityRole="button"
      onPress={() => alAbrir(salida.viajeId)}
      style={({ pressed }) => pressed && estilos.presionada}
    >
      <Bloque estiloContenido={estilos.contenido} testID="tarjeta-salida-ia">
        <FotoDestino
          destino={salida.destino}
          estilo={estilos.foto}
          origen={salida.origen}
          radio="tarjeta"
        >
          <View style={estilos.sobreFoto}>
            <View style={estilos.titulos}>
              <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
                {t(`servicios.${salida.servicio}`)}
              </Text>
              <Text style={[tipografia.titulo, { color: colores.sobreNegro }]}>
                {`${salida.origen} → ${salida.destino}`}
              </Text>
            </View>
            <View style={estilos.hora}>
              <Text style={[tipografia.dato, { color: colores.sobreNegro }]}>
                {formatoHora(salida.salida)}
              </Text>
              <Text
                style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
              >
                {sufijoHora(salida.salida)}
              </Text>
            </View>
          </View>
        </FotoDestino>
        <View style={estilos.datos}>
          <Dato
            rotulo={t('asistenteRico.tarifa')}
            valor={
              salida.tarifa === null
                ? t('asistenteRico.sinTarifa')
                : `C$ ${salida.tarifa}`
            }
          />
          <Dato
            rotulo={t('asistenteRico.libres')}
            valor={String(salida.asientosLibres)}
          />
          <Dato
            rotulo={t('asistenteRico.encuentro')}
            valor={etiquetaPunto(salida.puntoEncuentro)}
          />
        </View>
        <View style={estilos.pie}>
          <Text style={[tipografia.subtitulo, { color: colores.ambarTexto }]}>
            {t('asistenteRico.verViaje')}
          </Text>
          <Icono
            color={colores.ambarTexto}
            nombre="siguiente"
            tamano="mediano"
          />
        </View>
      </Bloque>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacios.ocho },
  dato: { flex: 1, gap: 2 },
  datos: {
    flexDirection: 'row',
    gap: espacios.doce,
    padding: espacios.doce,
  },
  foto: { height: 132, justifyContent: 'flex-end' },
  hora: { alignItems: 'flex-end' },
  pie: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.ocho,
    justifyContent: 'flex-end',
    paddingBottom: espacios.cuatro,
    paddingHorizontal: espacios.doce,
  },
  presionada: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  sobreFoto: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'space-between',
    padding: espacios.dieciseis,
  },
  titulos: { flex: 1, gap: 2 },
});
