import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Autobus } from '@/componentes/Autobus';
import { Aparece } from '@/componentes/Aparece';
import { Bloque } from '@/componentes/Bloque';
import { Boton } from '@/componentes/Boton';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { abrirAjustesDelSistema } from '@/datos/notificaciones';
import { textoAviso } from '@/datos/textoAviso';
import { useAvisos } from '@/datos/useAvisos';
import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesAvisos {
  alVolver: () => void;
}

/** el centro de avisos: interruptor de notificaciones y la lista de lo que pasa con tus viajes */
export function Avisos({ alVolver }: PropiedadesAvisos) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const {
    activadas,
    activar,
    avisos,
    desactivar,
    leidos,
    marcarLeido,
    marcarTodos,
    noLeidos,
    permiso,
  } = useAvisos();

  const activado = activadas && permiso === 'concedido';

  function cambiarInterruptor() {
    void (activado ? desactivar() : activar());
  }

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        { paddingBottom: 48, paddingTop: margenes.top + 8 },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <CabeceraPantalla alVolver={alVolver} titulo={t('avisos.titulo')} />
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('avisos.detalle')}
      </Text>

      <Pressable
        accessibilityLabel={t('avisos.interruptor')}
        accessibilityRole="switch"
        accessibilityState={{ checked: activado }}
        onPress={cambiarInterruptor}
      >
        <Bloque estiloContenido={estilos.interruptor}>
          <View style={estilos.textoInterruptor}>
            <Text style={[estilos.nombre, { color: colores.tinta }]}>
              {t('avisos.interruptor')}
            </Text>
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {permiso === 'sin-preguntar' && !activadas
                ? t('avisos.explicacion')
                : t('avisos.interruptorDetalle')}
            </Text>
          </View>
          <View
            style={[
              estilos.pista,
              { backgroundColor: activado ? colores.ambar : colores.linea },
            ]}
          >
            <View
              style={[
                estilos.perilla,
                {
                  alignSelf: activado ? 'flex-end' : 'flex-start',
                  backgroundColor: activado
                    ? colores.sobreAmbar
                    : colores.fondo,
                },
              ]}
            />
          </View>
        </Bloque>
      </Pressable>

      {permiso === 'negado' && (
        <Bloque estiloContenido={estilos.sinPermiso}>
          <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
            {t('avisos.sinPermiso')}
          </Text>
          <Boton
            alPresionar={() => void abrirAjustesDelSistema()}
            etiqueta={t('avisos.abrirAjustes')}
            variante="secundario"
          />
        </Bloque>
      )}

      {avisos.length === 0 ? (
        <Bloque estiloContenido={estilos.vacio}>
          <Autobus ancho={150} />
          <Text style={[estilos.nombre, { color: colores.tinta }]}>
            {t('avisos.vacioTitulo')}
          </Text>
          <Text
            style={[
              tipografia.cuerpo,
              estilos.centrado,
              { color: colores.tintaSuave },
            ]}
          >
            {t('avisos.vacioDetalle')}
          </Text>
        </Bloque>
      ) : (
        <>
          {noLeidos > 0 && (
            <Boton
              alPresionar={() => void marcarTodos()}
              etiqueta={t('avisos.marcarTodos')}
              variante="secundario"
            />
          )}
          {avisos.map((aviso, indice) => {
            const leido = leidos.includes(aviso.id);
            const { detalle, titulo } = textoAviso(aviso);
            return (
              <Aparece indice={indice} key={aviso.id}>
                <Pressable
                  accessibilityHint={
                    leido ? t('avisos.leido') : t('avisos.noLeido')
                  }
                  accessibilityLabel={`${titulo}. ${detalle}`}
                  accessibilityRole="button"
                  onPress={() => void marcarLeido(aviso.id)}
                >
                  <Bloque estiloContenido={estilos.aviso} hundido={leido}>
                    {!leido && (
                      <View
                        style={[
                          estilos.punto,
                          { backgroundColor: colores.ambar },
                        ]}
                        testID="aviso-sin-leer"
                      />
                    )}
                    <View style={estilos.textoAviso}>
                      <Text style={[estilos.nombre, { color: colores.tinta }]}>
                        {titulo}
                      </Text>
                      <Text
                        style={[
                          tipografia.pequeno,
                          { color: colores.tintaSuave },
                        ]}
                      >
                        {detalle}
                      </Text>
                    </View>
                  </Bloque>
                </Pressable>
              </Aparece>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  aviso: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: espacios.doce,
    padding: espacios.dieciseis,
  },
  centrado: { textAlign: 'center' },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  interruptor: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
    padding: espacios.dieciseis,
  },
  nombre: { fontFamily: 'Archivo_600SemiBold', fontSize: 18, lineHeight: 22 },
  punto: { borderRadius: 5, height: 10, marginTop: 6, width: 10 },
  perilla: {
    borderRadius: radios.pildora,
    height: espacios.veinticuatro,
    width: espacios.veinticuatro,
  },
  pista: {
    borderRadius: radios.pildora,
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
    padding: espacios.cuatro,
    width: espacios.cuarentaYOcho,
  },
  sinPermiso: { gap: espacios.doce, padding: espacios.veinticuatro },
  textoAviso: { flex: 1, gap: 2 },
  textoInterruptor: { flex: 1, gap: 2 },
  vacio: {
    alignItems: 'center',
    gap: espacios.dieciseis,
    padding: espacios.treintaYDos,
  },
});
