import { LinearGradient } from 'expo-linear-gradient';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  LinearGradient as DegradadoSvg,
  Path,
  Stop,
  Text as TextoSvg,
} from 'react-native-svg';

import { Autobus } from '@/componentes/Autobus';
import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesPortada {
  alEmpezar: () => void;
}

/** la primera pantalla: el nombre gigante detrás del bus de personaje */
export function Portada({ alEmpezar }: PropiedadesPortada) {
  const { colores } = useTema();
  const { height, width } = useWindowDimensions();
  const margenes = useSafeAreaInsets();
  const altoMarca = 150;
  const topMarca = height * 0.335;

  return (
    <View style={estilos.pantalla}>
      <LinearGradient
        colors={[colores.fondo, colores.fondoProfundo]}
        style={StyleSheet.absoluteFill}
      />
      <Svg height={height * 0.4} style={estilos.ruta} width={width}>
        <Path
          d={`M-20 ${height * 0.2} C ${width * 0.18} ${height * 0.1}, ${width * 0.4} ${height * 0.2}, ${width * 0.6} ${height * 0.12} S ${width * 0.9} ${height * 0.05}, ${width * 1.1} ${height * 0.01}`}
          fill="none"
          stroke={colores.linea}
          strokeLinecap="round"
          strokeWidth={3}
          strokeDasharray="1 11"
        />
        {[
          [width * 0.19, height * 0.14],
          [width * 0.59, height * 0.12],
          [width * 0.86, height * 0.07],
        ].map(([x, y]) => (
          <Circle
            cx={x}
            cy={y}
            fill={colores.fondo}
            key={`${x}${y}`}
            r={7}
            stroke={colores.linea}
            strokeWidth={2.5}
          />
        ))}
      </Svg>

      <View style={[estilos.lema, { top: margenes.top + 40 }]}>
        <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
          {t('portada.lugar')}
        </Text>
        <Text
          style={[
            tipografia.subtitulo,
            estilos.textoLema,
            { color: colores.tinta },
          ]}
        >
          {t('portada.lema')}
        </Text>
      </View>

      <Svg
        height={altoMarca}
        style={[estilos.marca, { top: topMarca }]}
        width={width}
      >
        <Defs>
          <DegradadoSvg id="marca" x1="0" x2="0" y1="0" y2="1">
            <Stop offset={0} stopColor={colores.marcaArriba} />
            <Stop offset={1} stopColor={colores.marcaAbajo} />
          </DegradadoSvg>
        </Defs>
        <TextoSvg
          fill="url(#marca)"
          fontFamily="ArchivoExtraCondensed_800ExtraBold"
          fontSize={altoMarca}
          textAnchor="middle"
          x={width / 2}
          y={altoMarca * 0.86}
        >
          {t('portada.marca')}
        </TextoSvg>
      </Svg>

      <View style={[estilos.bus, { top: topMarca + 100 }]}>
        <Autobus ancho={width + 8} letrero={t('portada.marca')} />
      </View>

      <View style={[estilos.pie, { bottom: margenes.bottom + 28 }]}>
        <Pressable
          accessibilityLabel={t('portada.empezar')}
          accessibilityRole="button"
          onPress={alEmpezar}
        >
          <Bloque estiloContenido={estilos.boton} radio="pildora">
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {t('portada.empezar')}
            </Text>
            <Loseta tamano={44} variante="negra">
              <Icono
                color={colores.sobreNegro}
                nombre="siguiente"
                tamano="grande"
              />
            </Loseta>
          </Bloque>
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  boton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
    paddingLeft: 30,
    paddingRight: 9,
    paddingVertical: 9,
  },
  bus: { left: -4, position: 'absolute' },
  lema: { left: 28, position: 'absolute' },
  marca: { left: 0, position: 'absolute' },
  pantalla: { flex: 1, overflow: 'hidden' },
  pie: { alignItems: 'center', left: 0, position: 'absolute', right: 0 },
  ruta: { left: 0, position: 'absolute', top: 0 },
  textoLema: { fontSize: 19, lineHeight: 26, marginTop: 6 },
});
