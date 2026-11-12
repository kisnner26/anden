import { FRANJAS, type Franja, type TipoServicio } from '@anden/dominio';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Autobus } from '@/componentes/Autobus';
import { Bloque } from '@/componentes/Bloque';
import { Boton } from '@/componentes/Boton';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { Chip } from '@/componentes/Chip';
import { FilaSalida } from '@/componentes/FilaSalida';
import { Icono } from '@/componentes/Icono';
import {
  SIN_FILTROS,
  buscarSalidas,
  hayFiltros,
  type FiltrosBusqueda,
} from '@/datos/buscarSalidas';
import {
  borrarRecientes,
  guardarReciente,
  leerRecientes,
} from '@/datos/recientes';
import { armarRutas } from '@/datos/rutas';
import { obtenerMuestra, useSalidas } from '@/datos/useSalidas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesBuscador {
  alAbrirViaje: (viajeId: string) => void;
  alVolver: () => void;
  /** texto con el que se abre la búsqueda, por ejemplo el destino de un viaje anterior */
  consultaInicial?: string;
}

const SERVICIOS: readonly { clave: TipoServicio; etiqueta: () => string }[] = [
  { clave: 'ordinario', etiqueta: () => t('servicios.ordinario') },
  { clave: 'expreso', etiqueta: () => t('servicios.expreso') },
  { clave: 'taxi-interlocal', etiqueta: () => t('servicios.taxi') },
];

const NOMBRE_FRANJA: Record<Franja, () => string> = {
  madrugada: () => t('buscador.madrugada'),
  manana: () => t('buscador.manana'),
  noche: () => t('buscador.noche'),
  tarde: () => t('buscador.tarde'),
};

/** la lupa de Horarios: texto, servicio y franja filtran las salidas mientras se escribe */
export function Buscador({
  alAbrirViaje,
  alVolver,
  consultaInicial = '',
}: PropiedadesBuscador) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { ahora, salidas } = useSalidas();
  const [filtros, establecerFiltros] = useState<FiltrosBusqueda>({
    ...SIN_FILTROS,
    texto: consultaInicial,
  });
  const [recientes, establecerRecientes] = useState<string[]>([]);
  const frecuentes = useMemo(
    () => armarRutas(obtenerMuestra(), ahora).map((ruta) => ruta.destino),
    [ahora],
  );

  useEffect(() => {
    let activo = true;
    void leerRecientes().then((guardadas) => {
      if (activo) establecerRecientes(guardadas);
    });
    return () => {
      activo = false;
    };
  }, []);

  const resultados = useMemo(
    () => buscarSalidas(salidas, filtros),
    [filtros, salidas],
  );
  const buscando = hayFiltros(filtros);

  function elegirSugerencia(texto: string) {
    establecerFiltros({ ...filtros, texto });
  }

  async function recordarBusqueda() {
    if (filtros.texto.trim().length >= 2) {
      establecerRecientes(await guardarReciente(filtros.texto));
    }
  }

  async function olvidar() {
    await borrarRecientes();
    establecerRecientes([]);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[estilos.pantalla, { backgroundColor: colores.fondo }]}
    >
      <ScrollView
        contentContainerStyle={[
          estilos.contenido,
          { paddingBottom: 48, paddingTop: margenes.top + 8 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <CabeceraPantalla alVolver={alVolver} titulo={t('buscador.titulo')} />

        <Bloque estiloContenido={estilos.campo} hundido radio="pildora">
          <Icono nombre="lupa" tamano="mediano" />
          <TextInput
            accessibilityLabel={t('buscador.campo')}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            onChangeText={(texto) => establecerFiltros({ ...filtros, texto })}
            onSubmitEditing={() => void recordarBusqueda()}
            placeholder={t('buscador.marcador')}
            placeholderTextColor={colores.tintaSuave}
            returnKeyType="search"
            selectionColor={colores.ambarTexto}
            style={[
              tipografia.cuerpo,
              estilos.entrada,
              { color: colores.tinta },
            ]}
            value={filtros.texto}
          />
        </Bloque>

        <View style={estilos.grupo}>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {t('buscador.servicio')}
          </Text>
          <ScrollView
            contentContainerStyle={estilos.chips}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {SERVICIOS.map(({ clave, etiqueta }) => (
              <Chip
                alCambiar={() =>
                  establecerFiltros({
                    ...filtros,
                    servicio: filtros.servicio === clave ? null : clave,
                  })
                }
                etiqueta={etiqueta()}
                key={clave}
                seleccionado={filtros.servicio === clave}
              />
            ))}
          </ScrollView>
        </View>

        <View style={estilos.grupo}>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {t('buscador.franja')}
          </Text>
          <ScrollView
            contentContainerStyle={estilos.chips}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {FRANJAS.map((franja) => (
              <Chip
                alCambiar={() =>
                  establecerFiltros({
                    ...filtros,
                    franja: filtros.franja === franja ? null : franja,
                  })
                }
                etiqueta={NOMBRE_FRANJA[franja]()}
                key={franja}
                seleccionado={filtros.franja === franja}
              />
            ))}
          </ScrollView>
        </View>

        {!buscando && (
          <>
            {recientes.length > 0 && (
              <View style={estilos.grupo}>
                <View style={estilos.filaTitulo}>
                  <Text
                    style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
                  >
                    {t('buscador.recientes')}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void olvidar()}
                    style={estilos.toque}
                  >
                    <Text
                      style={[
                        tipografia.etiqueta,
                        { color: colores.ambarTexto },
                      ]}
                    >
                      {t('buscador.borrarRecientes')}
                    </Text>
                  </Pressable>
                </View>
                <View style={estilos.envuelto}>
                  {recientes.map((reciente) => (
                    <Chip
                      alCambiar={() => elegirSugerencia(reciente)}
                      etiqueta={reciente}
                      key={reciente}
                    />
                  ))}
                </View>
              </View>
            )}
            <View style={estilos.grupo}>
              <Text
                style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
              >
                {t('buscador.frecuentes')}
              </Text>
              <View style={estilos.envuelto}>
                {frecuentes.map((destino) => (
                  <Chip
                    alCambiar={() => elegirSugerencia(destino)}
                    etiqueta={destino}
                    key={destino}
                  />
                ))}
              </View>
            </View>
          </>
        )}

        {buscando && resultados.length > 0 && (
          <>
            <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
              {`${resultados.length} ${
                resultados.length === 1
                  ? t('buscador.unResultado')
                  : t('buscador.resultados')
              }`}
            </Text>
            {resultados.map((salida) => (
              <FilaSalida
                alPresionar={alAbrirViaje}
                key={salida.viajeId}
                salida={salida}
              />
            ))}
          </>
        )}

        {buscando && resultados.length === 0 && (
          <Bloque estiloContenido={estilos.vacio}>
            <Autobus ancho={150} />
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {t('buscador.sinResultadosTitulo')}
            </Text>
            <Text
              style={[
                tipografia.cuerpo,
                estilos.centrado,
                { color: colores.tintaSuave },
              ]}
            >
              {t('buscador.sinResultadosDetalle')}
            </Text>
            <Boton
              alPresionar={() => establecerFiltros(SIN_FILTROS)}
              etiqueta={t('buscador.limpiar')}
              variante="secundario"
            />
          </Bloque>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  campo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    paddingHorizontal: espacios.dieciseis,
  },
  centrado: { textAlign: 'center' },
  chips: { gap: espacios.ocho },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  entrada: { flex: 1, minHeight: 52 },
  envuelto: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
  filaTitulo: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  grupo: { gap: espacios.ocho },
  pantalla: { flex: 1 },
  toque: { justifyContent: 'center', minHeight: 44, paddingHorizontal: 8 },
  vacio: {
    alignItems: 'center',
    gap: espacios.dieciseis,
    padding: espacios.treintaYDos,
  },
});
