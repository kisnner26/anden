import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { Interruptor } from '@/componentes/Interruptor';
import { autenticar } from '@/datos/biometria';
import { nombrePropio } from '@/datos/perfil';
import { useAjustesConductor } from '@/datos/useAjustesConductor';
import { useBloqueo } from '@/datos/useBloqueo';
import { useSesion } from '@/datos/useSesion';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesConductorAjustes {
  /** abre los ajustes generales: apariencia, letra, ubicación */
  alAbrirAjustesGenerales: () => void;
  /** cierra la sesión y vuelve al ingreso */
  alSalir: () => void;
}

/** la pestaña de ajustes del conductor: seguridad, el viaje y la sesión */
export function ConductorAjustes({
  alAbrirAjustesGenerales,
  alSalir,
}: PropiedadesConductorAjustes) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { cerrar, sesion } = useSesion();
  const { ajustes, cambiar } = useAjustesConductor();
  const { biometria } = useBloqueo();

  async function cambiarBiometria(activar: boolean) {
    // para encender la verificación hay que pasarla una vez: así se sabe que funciona y que es quien dice
    if (activar && !(await autenticar(t('conductorAjustes.biometriaMotivo')))) {
      return;
    }
    await cambiar({ exigirBiometria: activar });
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: 120,
          paddingTop: margenes.top + espacios.veinticuatro,
        },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {nombrePropio(sesion?.nombre ?? '')}
      </Text>
      <Text style={[tipografia.titulo, { color: colores.tinta }]}>
        {t('conductorAjustes.titulo')}.
      </Text>
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('conductorAjustes.detalle')}
      </Text>

      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('conductorAjustes.seguridadSeccion')}
      </Text>
      <Bloque estiloContenido={estilos.fila}>
        <View style={estilos.texto}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {t('conductorAjustes.biometriaTitulo')}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {biometria.disponible || ajustes.exigirBiometria
              ? t('conductorAjustes.biometriaDetalle')
              : t('conductorAjustes.biometriaNoDisponible')}
          </Text>
        </View>
        <Interruptor
          activo={ajustes.exigirBiometria}
          alCambiar={(activar) => void cambiarBiometria(activar)}
          deshabilitado={!biometria.disponible && !ajustes.exigirBiometria}
          etiqueta={t('conductorAjustes.biometriaTitulo')}
        />
      </Bloque>

      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('conductorAjustes.viajeSeccion')}
      </Text>
      <Bloque estiloContenido={estilos.fila}>
        <View style={estilos.texto}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {t('conductorAjustes.pantallaTitulo')}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('conductorAjustes.pantallaDetalle')}
          </Text>
        </View>
        <Interruptor
          activo={ajustes.pantallaEncendida}
          alCambiar={(activa) => void cambiar({ pantallaEncendida: activa })}
          etiqueta={t('conductorAjustes.pantallaTitulo')}
        />
      </Bloque>

      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('conductorAjustes.generalesSeccion')}
      </Text>
      <Pressable
        accessibilityLabel={t('conductorAjustes.generalesTitulo')}
        accessibilityRole="button"
        onPress={alAbrirAjustesGenerales}
      >
        <Bloque estiloContenido={estilos.fila}>
          <View style={estilos.texto}>
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {t('conductorAjustes.generalesTitulo')}
            </Text>
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {t('conductorAjustes.generalesDetalle')}
            </Text>
          </View>
          <Icono nombre="siguiente" tamano="mediano" />
        </Bloque>
      </Pressable>

      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('conductorAjustes.sesionSeccion')}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => void cerrar().then(alSalir)}
      >
        <Bloque estiloContenido={estilos.fila}>
          <Text style={[tipografia.subtitulo, { color: colores.cancelado }]}>
            {t('ajustes.cerrarSesion')}
          </Text>
        </Bloque>
      </Pressable>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
    minHeight: tamanosControl.toqueMinimo,
    padding: espacios.dieciseis,
  },
  texto: { flex: 1, gap: 2 },
});
