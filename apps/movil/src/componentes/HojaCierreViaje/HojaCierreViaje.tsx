import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BotonAccion } from '@/componentes/BotonAccion';
import { Hoja } from '@/componentes/Hoja';
import { nombrePropio } from '@/datos/perfil';
import type { CierreViaje } from '@/servicios/cierres';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesHojaCierreViaje {
  alCerrarHoja: () => void;
  alConfirmar: () => void;
  /** el resumen que se guardaría; nulo mantiene la hoja cerrada */
  resumen: CierreViaje | null;
}

/** el resumen del cobro antes de cerrar un viaje: cuánto se cobró, cuánto falta y quién no pagó */
export function HojaCierreViaje({
  alCerrarHoja,
  alConfirmar,
  resumen,
}: PropiedadesHojaCierreViaje) {
  const { colores } = useTema();

  return (
    <Hoja
      abierta={resumen !== null}
      alCerrar={alCerrarHoja}
      etiquetaCerrar={t('conductor.cerrarHoja')}
    >
      {resumen && (
        <View style={estilos.contenido}>
          <Text
            accessibilityRole="header"
            style={[tipografia.titulo, { color: colores.tinta }]}
          >
            {t('conductor.cierreTitulo')}
          </Text>
          <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
            {t('conductor.cierreDetalle')}
          </Text>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {rellenar(t('conductor.cierrePagaron'), {
              pagados: resumen.pagados,
              total: resumen.pasajeros,
            })}
          </Text>
          <Text style={[tipografia.datoGrande, { color: colores.aTiempo }]}>
            {rellenar(t('conductor.cierreCobrado'), {
              cobrado: resumen.cobrado,
            })}
          </Text>
          <Text style={[tipografia.datoGrande, { color: colores.ambarTexto }]}>
            {rellenar(t('conductor.cierrePendiente'), {
              pendiente: resumen.pendiente,
            })}
          </Text>
          {resumen.sinPagar.length === 0 ? (
            <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
              {t('conductor.cierreTodoPagado')}
            </Text>
          ) : (
            <View style={estilos.sinPagar}>
              <Text style={[tipografia.etiqueta, { color: colores.cancelado }]}>
                {t('conductor.cierreSinPagar')}
              </Text>
              {resumen.sinPagar.map((pasajero) => (
                <Text
                  key={pasajero.boletoId}
                  style={[tipografia.cuerpo, { color: colores.tinta }]}
                >
                  {`${t('pasajeros.asiento')} ${pasajero.asiento} · ${nombrePropio(pasajero.nombre)} · C$ ${pasajero.precio}`}
                </Text>
              ))}
            </View>
          )}
          <BotonAccion
            alPresionar={alConfirmar}
            etiqueta={t('conductor.cierreConfirmar')}
            icono="confirmar"
          />
          <Pressable
            accessibilityRole="button"
            onPress={alCerrarHoja}
            style={estilos.seguir}
          >
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {t('conductor.cierreSeguir')}
            </Text>
          </Pressable>
        </View>
      )}
    </Hoja>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    gap: espacios.doce,
    paddingBottom: espacios.cuarentaYOcho,
    paddingHorizontal: espacios.lateral,
  },
  seguir: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
  },
  sinPagar: { gap: espacios.cuatro },
});
