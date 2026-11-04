import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Autobus } from '@/componentes/Autobus';
import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { formatoHora, formatoHoraCompleta } from '@/datos/formato';
import type { Salida } from '@/datos/salidas';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesFilaSalida {
  alPresionar?: (viajeId: string) => void;
  /** si ya tenés boleto en esta salida se muestra el círculo negro con el check */
  conBoleto?: boolean;
  salida: Salida;
}

function IconoServicio({ servicio }: { servicio: Salida['servicio'] }) {
  if (servicio === 'expreso')
    return <Icono nombre="rayo" tamano="ilustracion" />;
  if (servicio === 'taxi-interlocal') {
    return <Icono nombre="taxi" tamano="ilustracion" />;
  }
  return <Autobus ancho={tamanosControl.toqueMinimo} />;
}

/** una salida de la terminal: ícono del servicio, destino, andén, hora y el estado del boleto */
export function FilaSalida({
  alPresionar,
  conBoleto = false,
  salida,
}: PropiedadesFilaSalida) {
  const { colores } = useTema();
  const servicio = t(`servicios.${salida.servicio}`);
  const anden = `${t('viajar.andenMayusculas').toLowerCase()} ${salida.anden}`;

  return (
    <Pressable
      accessibilityLabel={`${salida.destino}, ${formatoHoraCompleta(salida.salida)}, ${servicio}, ${anden}`}
      accessibilityRole="button"
      onPress={() => alPresionar?.(salida.viajeId)}
    >
      <Bloque estilo={estilos.fila} estiloContenido={estilos.contenido}>
        <Loseta>
          <IconoServicio servicio={salida.servicio} />
        </Loseta>
        <View style={estilos.texto}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {salida.destino}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {salida.servicio === 'taxi-interlocal'
              ? `${servicio} · ${anden} · ${salida.placa}`
              : `${servicio} · ${anden}`}
          </Text>
        </View>
        <Text style={[tipografia.dato, { color: colores.ambarTexto }]}>
          {formatoHora(salida.salida)}
        </Text>
        {conBoleto ? (
          <Loseta tamano={44} variante="negra">
            <Icono
              color={colores.sobreNegro}
              nombre="confirmar"
              tamano="grande"
            />
          </Loseta>
        ) : (
          <Bloque hundido radio="pildora">
            <View style={estilos.circuloVacio} />
          </Bloque>
        )}
      </Bloque>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  circuloVacio: {
    height: tamanosControl.circuloPildora,
    width: tamanosControl.circuloPildora,
  },
  contenido: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.doce,
  },
  fila: { marginTop: espacios.doce },
  texto: { flex: 1 },
});
