import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { formatoHoraCompleta } from '@/datos/formato';
import { pasoSiguiente, type PasoDelPlan } from '@/datos/planViaje';
import { conAlfa } from '@/tema/alfa';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesPlanDelViaje {
  ahora: Date;
  /** pide la ubicación una vez para calcular cuándo salir de casa; sin esto no se ofrece */
  alCalcularDeCasa?: () => void;
  calculando?: boolean;
  /** la ubicación no se pudo leer */
  fallo?: boolean;
  pasos: readonly PasoDelPlan[];
}

/**
 * el día del viaje como una línea de tiempo: salir de casa, estar en el andén, la salida y la llegada, con la hora de cada
 * paso y el siguiente resaltado; el primer paso se calcula con tu ubicación solo si lo pedís
 */
export function PlanDelViaje({
  ahora,
  alCalcularDeCasa,
  calculando = false,
  fallo = false,
  pasos,
}: PropiedadesPlanDelViaje) {
  const { colores } = useTema();
  const siguiente = pasoSiguiente(pasos, ahora);
  const tieneCasa = pasos.some((p) => p.clave === 'casa');

  return (
    <Bloque estiloContenido={estilos.contenido} testID="plan-del-viaje">
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('plan.titulo')}
      </Text>
      <View style={estilos.linea}>
        {pasos.map((paso, indice) => {
          const esSiguiente = paso.clave === siguiente;
          const paso_pasado = paso.hora.getTime() <= ahora.getTime();
          return (
            <View
              accessibilityLabel={`${t(`plan.${paso.clave}`)}, ${formatoHoraCompleta(paso.hora)}${esSiguiente ? `, ${t('plan.siguiente')}` : ''}`}
              accessible
              key={paso.clave}
              style={estilos.paso}
            >
              <View style={estilos.eje}>
                <View
                  style={[
                    estilos.punto,
                    {
                      backgroundColor: esSiguiente
                        ? colores.ambar
                        : paso_pasado
                          ? colores.tintaSuave
                          : 'transparent',
                      borderColor: esSiguiente
                        ? colores.ambar
                        : conAlfa(colores.tinta, 0.4),
                    },
                  ]}
                />
                {indice < pasos.length - 1 ? (
                  <View
                    style={[
                      estilos.hilo,
                      { backgroundColor: conAlfa(colores.tinta, 0.18) },
                    ]}
                  />
                ) : null}
              </View>
              <View style={estilos.texto}>
                <Text
                  style={[
                    tipografia.nombreFila,
                    { color: paso_pasado ? colores.tintaSuave : colores.tinta },
                  ]}
                >
                  {t(`plan.${paso.clave}`)}
                </Text>
                <Text
                  style={[
                    tipografia.dato,
                    {
                      color: esSiguiente
                        ? colores.ambarTexto
                        : colores.tintaSuave,
                    },
                  ]}
                >
                  {formatoHoraCompleta(paso.hora)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      {!tieneCasa && alCalcularDeCasa ? (
        <Pressable
          accessibilityRole="button"
          disabled={calculando}
          onPress={alCalcularDeCasa}
        >
          <Text style={[tipografia.subtitulo, { color: colores.ambarTexto }]}>
            {calculando ? t('plan.calculando') : t('plan.calcular')}
          </Text>
        </Pressable>
      ) : null}
      {fallo ? (
        <Text style={[tipografia.pequeno, { color: colores.cancelado }]}>
          {t('plan.sinUbicacion')}
        </Text>
      ) : null}
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  contenido: { gap: espacios.doce, padding: espacios.dieciseis },
  eje: { alignItems: 'center', width: 18 },
  hilo: { flex: 1, minHeight: 16, width: 2 },
  linea: { gap: 0 },
  paso: { flexDirection: 'row', gap: espacios.doce },
  punto: {
    borderRadius: 7,
    borderWidth: 2,
    height: 14,
    marginTop: 4,
    width: 14,
  },
  texto: { flex: 1, gap: 2, paddingBottom: espacios.doce },
});
