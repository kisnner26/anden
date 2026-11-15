import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { BrilloQueBarre } from '@/componentes/BrilloQueBarre';
import { resolverFoto } from '@/datos/almacenFotos';
import { conAlfa } from '@/tema/alfa';
import { paletaPasaporte as p } from '@/tema/colores';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { t } from '@/textos/t';

export interface PropiedadesPaginaDeDatos {
  alto: number;
  ancho: number;
  apellido: string;
  /** desde cuándo viaja, ya escrito; vacío si todavía no viajó */
  desde: string;
  fotoUri: string | null;
  iniciales: string;
  lineasDeLectura: [string, string];
  nivel: string;
  nombre: string;
  numero: string;
}

/** el fondo de las hojas de seguridad: ondas finas que se cruzan, como el guilloché de un billete */
function Guilloche({ alto, ancho }: { alto: number; ancho: number }) {
  const ondas = Array.from({ length: 14 }, (_, i) => {
    const y0 = (alto / 13) * i;
    const fase = i * 0.7;
    let d = `M0 ${y0.toFixed(1)}`;
    for (let x = 8; x <= ancho; x += 8) {
      const y = y0 + Math.sin(x / 26 + fase) * 9 + Math.sin(x / 11 - fase) * 3;
      d += ` L${x} ${y.toFixed(1)}`;
    }
    return d;
  });
  return (
    <Svg height={alto} style={StyleSheet.absoluteFill} width={ancho}>
      {ondas.map((d, i) => (
        <Path
          d={d}
          fill="none"
          key={i}
          stroke={p.guilloche}
          strokeOpacity={0.55}
          strokeWidth={0.7}
        />
      ))}
    </Svg>
  );
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={estilos.campo}>
      <Text style={[tipografia.etiqueta, estilos.micro]}>{etiqueta}</Text>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[tipografia.subtitulo, { color: p.tintaHoja }]}
      >
        {valor === '' ? '—' : valor}
      </Text>
    </View>
  );
}

/**
 * la página de datos del pasaporte: foto, nombre, número, nivel y desde cuándo se viaja, sobre papel de seguridad
 * con un destello de holograma y las dos líneas de lectura de máquina al pie
 */
export function PaginaDeDatos({
  alto,
  ancho,
  apellido,
  desde,
  fotoUri,
  iniciales,
  lineasDeLectura,
  nivel,
  nombre,
  numero,
}: PropiedadesPaginaDeDatos) {
  const [fallo, establecerFallo] = useState(false);
  const foto = fotoUri !== null && !fallo;
  return (
    <View
      accessible
      accessibilityLabel={`${t('pasaporte.datos.titulo')}: ${nombre} ${apellido}, ${nivel}, ${numero}`}
      style={[
        estilos.hoja,
        { backgroundColor: p.hoja, height: alto, width: ancho },
      ]}
      testID="pagina-de-datos"
    >
      <Guilloche alto={alto} ancho={ancho} />
      <View style={estilos.cabecera}>
        <Text style={[tipografia.etiqueta, estilos.micro]}>
          {t('pasaporte.datos.titulo')}
        </Text>
        <Text style={[tipografia.etiqueta, { color: p.tintaSello }]}>
          {numero}
        </Text>
      </View>

      <View style={estilos.cuerpo}>
        <View style={[estilos.foto, { borderColor: p.tintaHojaSuave }]}>
          {foto ? (
            <Image
              onError={() => establecerFallo(true)}
              source={{ uri: resolverFoto(fotoUri) }}
              style={estilos.imagen}
            />
          ) : (
            <Text
              style={[
                tipografia.iniciales,
                { color: conAlfa(p.tintaHoja, 0.7) },
              ]}
            >
              {iniciales === '' ? '·' : iniciales}
            </Text>
          )}
        </View>
        <View style={estilos.campos}>
          <Campo etiqueta={t('pasaporte.datos.apellidos')} valor={apellido} />
          <Campo etiqueta={t('pasaporte.datos.nombres')} valor={nombre} />
          <Campo etiqueta={t('pasaporte.datos.nivel')} valor={nivel} />
          <Campo etiqueta={t('pasaporte.datos.desde')} valor={desde} />
        </View>
      </View>

      <View style={[estilos.lectura, { backgroundColor: p.hojaSombra }]}>
        {lineasDeLectura.map((linea) => (
          <Text
            key={linea}
            numberOfLines={1}
            style={[estilos.linea, { color: p.zonaDeLectura }]}
          >
            {linea}
          </Text>
        ))}
      </View>
      <BrilloQueBarre pausa={3400} retardo={1800} />
    </View>
  );
}

const estilos = StyleSheet.create({
  cabecera: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  campo: { gap: 1 },
  campos: { flex: 1, gap: espacios.doce, justifyContent: 'space-between' },
  cuerpo: { flex: 1, flexDirection: 'row', gap: espacios.dieciseis },
  foto: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    aspectRatio: 0.78,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '36%',
  },
  hoja: {
    borderRadius: 14,
    gap: espacios.dieciseis,
    overflow: 'hidden',
    padding: espacios.dieciseis,
  },
  imagen: { height: '100%', width: '100%' },
  linea: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    letterSpacing: 0.4,
    lineHeight: 14,
  },
  lectura: {
    borderRadius: 6,
    gap: 2,
    marginHorizontal: -4,
    paddingHorizontal: 6,
    paddingVertical: espacios.ocho,
  },
  micro: { color: p.tintaHojaSuave },
});
