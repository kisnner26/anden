import { StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Interruptor } from '@/componentes/Interruptor';
import { autenticar } from '@/datos/biometria';
import { useAjustesConductor } from '@/datos/useAjustesConductor';
import { useBloqueo } from '@/datos/useBloqueo';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

import { Ajustes } from './Ajustes';

export interface PropiedadesConductorAjustes {
  /** abre el perfil del conductor: es la primera opción de los ajustes */
  alAbrirPerfil: () => void;
  /** cierra la sesión y vuelve al ingreso */
  alSalir: () => void;
}

/** lo que solo tiene quien conduce: pedir su identidad para iniciar un viaje y no dejar que la pantalla se apague en ruta */
function SeccionesDeConductor() {
  const { colores } = useTema();
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
    <>
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('conductorAjustes.viajeSeccion')}
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
    </>
  );
}

/**
 * la pestaña de ajustes del conductor: son los mismos ajustes del pasajero (modo de uso, seguridad, Rumbo, inicio, IA,
 * detección de choques, ubicación, apariencia y sesión), con su perfil como primera opción y, antes de la sesión, lo
 * que solo le toca a quien conduce
 */
export function ConductorAjustes({
  alAbrirPerfil,
  alSalir,
}: PropiedadesConductorAjustes) {
  return (
    <Ajustes
      alAbrirPerfilConductor={alAbrirPerfil}
      alSalir={alSalir}
      extra={<SeccionesDeConductor />}
    />
  );
}

const estilos = StyleSheet.create({
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
    minHeight: tamanosControl.toqueMinimo,
    padding: espacios.dieciseis,
  },
  texto: { flex: 1, gap: 2 },
});
