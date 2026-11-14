import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { DeslizarParaEliminar } from '@/componentes/DeslizarParaEliminar';
import { FotoDestino } from '@/componentes/FotoDestino';
import { Icono } from '@/componentes/Icono';
import type { GrupoHabitual } from '@/datos/habituales';
import {
  formatoDiasSemana,
  formatoFechaCorta,
  formatoHoraCompleta,
} from '@/datos/formato';
import { mismoDia, nombreDelDia } from '@/datos/dias';
import type { Salida } from '@/datos/salidas';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesTarjetaHabitual {
  ahora: Date;
  alQuitar: () => void;
  /** con la próxima salida abre ese viaje; sin ella lleva a los horarios */
  alAbrir: (viajeId: string | null) => void;
  grupo: GrupoHabitual;
  proxima: Salida | null;
}

function cuando(salida: Date, ahora: Date): string {
  const nombre = nombreDelDia(salida, ahora);
  const hora = formatoHoraCompleta(salida);
  if (nombre === 'hoy') return `${t('dias.hoy').toLowerCase()} ${hora}`;
  if (nombre === 'manana') return `${t('dias.manana').toLowerCase()} ${hora}`;
  return `${formatoFechaCorta(salida)} ${hora}`;
}

/** el trayecto que la persona hace seguido, con la foto del destino; al tocarlo abre su próxima salida */
export function TarjetaHabitual({
  ahora,
  alAbrir,
  alQuitar,
  grupo,
  proxima,
}: PropiedadesTarjetaHabitual) {
  const { colores } = useTema();
  const horas = grupo.horas
    .map((texto) => {
      const [hora = 0, minuto = 0] = texto.split(':').map(Number);
      return formatoHoraCompleta(new Date(2000, 0, 1, hora, minuto));
    })
    .join(' · ');

  return (
    <DeslizarParaEliminar
      accion={rellenar(t('habitual.quitar'), {
        destino: grupo.destino,
        origen: grupo.origen,
      })}
      alEliminar={alQuitar}
    >
      <Pressable
        accessibilityLabel={
          proxima
            ? rellenar(t('habitual.reservar'), {
                cuando: cuando(proxima.salida, ahora),
              })
            : rellenar(t('habitual.verHorarios'), {
                destino: grupo.destino,
                origen: grupo.origen,
              })
        }
        accessibilityRole="button"
        onPress={() => alAbrir(proxima?.viajeId ?? null)}
      >
        <Bloque estiloContenido={estilos.contenido} testID="tarjeta-habitual">
          <FotoDestino
            destino={grupo.destino}
            estilo={estilos.foto}
            origen={grupo.origen}
            radio="tarjeta"
          >
            <View style={estilos.sobreFoto}>
              <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
                {t('habitual.titulo')}
              </Text>
              <Text style={[tipografia.titulo, { color: colores.sobreNegro }]}>
                {`${grupo.origen} → ${grupo.destino}`}
              </Text>
              <Text
                style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
              >
                {`${formatoDiasSemana(grupo.dias)} · ${horas}`}
              </Text>
            </View>
          </FotoDestino>

          <View style={estilos.fila}>
            <View style={estilos.texto}>
              {proxima ? (
                <>
                  <Text
                    style={[
                      tipografia.subtitulo,
                      { color: colores.ambarTexto },
                    ]}
                  >
                    {rellenar(t('habitual.proxima'), {
                      cuando: cuando(proxima.salida, ahora),
                    })}
                  </Text>
                  <Text
                    style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                  >
                    {mismoDia(proxima.salida, ahora)
                      ? t('habitual.reservarHoy')
                      : t('habitual.reservarAhora')}
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    style={[tipografia.cuerpo, { color: colores.tintaSuave }]}
                  >
                    {t('habitual.sinSalida')}
                  </Text>
                  <Text
                    style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                  >
                    {t('habitual.verHorariosCorto')}
                  </Text>
                </>
              )}
            </View>
            <Icono nombre="siguiente" tamano="mediano" />
          </View>
        </Bloque>
      </Pressable>
    </DeslizarParaEliminar>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacios.ocho },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    minHeight: tamanosControl.toqueMinimo,
    padding: espacios.ocho,
    paddingTop: espacios.doce,
  },
  foto: { height: 176, justifyContent: 'flex-end' },
  sobreFoto: { gap: 2, padding: espacios.dieciseis },
  texto: { flex: 1, gap: 2 },
});
