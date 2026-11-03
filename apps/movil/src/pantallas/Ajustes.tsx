import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema, type PreferenciaTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesAjustes {
  alVolver: () => void;
}

const OPCIONES: readonly {
  clave: PreferenciaTema;
  detalle: () => string;
  nombre: () => string;
}[] = [
  {
    clave: 'claro',
    detalle: () => t('ajustes.claroDetalle'),
    nombre: () => t('ajustes.claro'),
  },
  {
    clave: 'oscuro',
    detalle: () => t('ajustes.oscuroDetalle'),
    nombre: () => t('ajustes.oscuro'),
  },
  {
    clave: 'automatico',
    detalle: () => t('ajustes.automaticoDetalle'),
    nombre: () => t('ajustes.automatico'),
  },
];

/** apariencia: claro, oscuro o automático según la hora */
export function Ajustes({ alVolver }: PropiedadesAjustes) {
  const { colores, establecerPreferencia, preferencia } = useTema();
  const margenes = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        { paddingTop: margenes.top + 8, paddingBottom: 48 },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <Pressable
        accessibilityLabel={t('ajustes.volver')}
        accessibilityRole="button"
        onPress={alVolver}
      >
        <Bloque estiloContenido={estilos.circulo} radio="pildora">
          <Icono nombre="volver" tamano="grande" />
        </Bloque>
      </Pressable>

      <Text style={[estilos.titulo, { color: colores.tinta }]}>
        {t('ajustes.titulo')}
        <Text style={{ color: colores.ambarTitular }}>.</Text>
      </Text>
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('ajustes.detalle')}
      </Text>

      {OPCIONES.map(({ clave, detalle, nombre }) => {
        const elegida = preferencia === clave;
        return (
          <Pressable
            accessibilityLabel={nombre()}
            accessibilityRole="radio"
            accessibilityState={{ checked: elegida }}
            key={clave}
            onPress={() => void establecerPreferencia(clave)}
          >
            <Bloque
              estilo={estilos.opcion}
              estiloContenido={estilos.filaOpcion}
              hundido={elegida}
            >
              <View style={estilos.texto}>
                <Text style={[estilos.nombre, { color: colores.tinta }]}>
                  {nombre()}
                </Text>
                <Text
                  style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                >
                  {detalle()}
                </Text>
              </View>
              <Loseta tamano={36} variante={elegida ? 'ambar' : 'claro'}>
                {elegida && (
                  <Icono
                    color={colores.sobreAmbar}
                    nombre="confirmar"
                    tamano="mediano"
                  />
                )}
              </Loseta>
            </Bloque>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  circulo: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  filaOpcion: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
    padding: espacios.dieciseis,
  },
  nombre: { fontFamily: 'Archivo_600SemiBold', fontSize: 18, lineHeight: 22 },
  opcion: {},
  texto: { flex: 1, gap: 2 },
  titulo: {
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 46,
    lineHeight: 48,
  },
});
