import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aparece } from '@/componentes/Aparece';
import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { formatoFechaCorta, formatoHoraCompleta } from '@/datos/formato';
import { mensajeDeGrupo } from '@/datos/grupo';
import { useGrupo } from '@/datos/useGrupo';
import { useSalidas } from '@/datos/useSalidas';
import { useSesion } from '@/datos/useSesion';
import { espacios, radios } from '@/tema/espacios';
import { conAlfa } from '@/tema/alfa';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesGrupo {
  alElegirAsiento: (viajeId: string) => void;
  alVolver: () => void;
  codigo: string;
}

/** el grupo de un viaje: cuántos van, quiénes ya eligieron asiento (solo el primer nombre) y el botón para elegir el tuyo */
export function Grupo({ alElegirAsiento, alVolver, codigo }: PropiedadesGrupo) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { sesion } = useSesion();
  const { cargando, estado, existe } = useGrupo(codigo);
  const { salidas } = useSalidas();
  const salida = estado
    ? salidas.find((s) => s.viajeId === estado.viaje_id)
    : undefined;

  function compartir() {
    if (!estado || !salida) return;
    void Share.share({
      message: mensajeDeGrupo({
        codigo,
        cupo: estado.cupo,
        destino: salida.destino,
        hora: formatoHoraCompleta(salida.salida),
      }),
    });
  }

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: espacios.cuarentaYOcho,
          paddingTop: margenes.top + espacios.ocho,
        },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <CabeceraPantalla alVolver={alVolver} titulo={t('grupo.titulo')} />

      {!sesion ? (
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('grupo.sinSesion')}
        </Text>
      ) : cargando ? (
        <Text
          accessibilityRole="progressbar"
          style={[tipografia.cuerpo, { color: colores.tintaSuave }]}
        >
          {t('perfil.cargando')}
        </Text>
      ) : !existe || !estado ? (
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('grupo.noExiste')}
        </Text>
      ) : (
        <>
          {salida ? (
            <Bloque estiloContenido={estilos.resumen}>
              <Text style={[tipografia.titulo, { color: colores.tinta }]}>
                {salida.destino}
              </Text>
              <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
                {`${formatoFechaCorta(salida.salida)}, ${formatoHoraCompleta(salida.salida)}`}
              </Text>
            </Bloque>
          ) : null}

          <View
            accessibilityLabel={rellenar(t('grupo.avance'), {
              cupo: estado.cupo,
              n: estado.miembros.length,
            })}
            accessible
            style={estilos.avance}
            testID="avance-del-grupo"
          >
            <View
              style={[
                estilos.pista,
                { backgroundColor: conAlfa(colores.tinta, 0.12) },
              ]}
            >
              <View
                style={[
                  estilos.relleno,
                  {
                    backgroundColor: colores.ambar,
                    width: `${Math.min(100, Math.round((estado.miembros.length / estado.cupo) * 100))}%`,
                  },
                ]}
              />
            </View>
            <Text style={[tipografia.pequeno, { color: colores.tinta }]}>
              {rellenar(t('grupo.avance'), {
                cupo: estado.cupo,
                n: estado.miembros.length,
              })}
            </Text>
          </View>

          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {t('grupo.miembros')}
          </Text>
          {estado.miembros.length === 0 ? (
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {t('grupo.ninguno')}
            </Text>
          ) : (
            estado.miembros.map((m, indice) => (
              <Aparece indice={indice} key={`${m.asiento}`}>
                <View
                  style={[
                    estilos.miembro,
                    { borderColor: conAlfa(colores.tinta, 0.14) },
                  ]}
                >
                  <Text
                    style={[tipografia.nombreFila, { color: colores.tinta }]}
                  >
                    {m.nombre}
                  </Text>
                  <Text
                    style={[tipografia.dato, { color: colores.ambarTexto }]}
                  >
                    {rellenar(t('grupo.asiento'), { n: m.asiento })}
                  </Text>
                </View>
              </Aparece>
            ))
          )}

          {estado.vencido ? (
            <Text style={[tipografia.pequeno, { color: colores.cancelado }]}>
              {t('grupo.expirado')}
            </Text>
          ) : (
            <>
              <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
                {t('grupo.juntos')}
              </Text>
              <BotonAccion
                alPresionar={() => alElegirAsiento(estado.viaje_id)}
                etiqueta={t('grupo.elegirAsiento')}
              />
              <Pressable accessibilityRole="button" onPress={compartir}>
                <View style={estilos.compartir}>
                  <Text
                    style={[
                      tipografia.subtitulo,
                      { color: colores.ambarTexto },
                    ]}
                  >
                    {t('grupo.compartir')}
                  </Text>
                </View>
              </Pressable>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  avance: { gap: espacios.ocho },
  compartir: { alignItems: 'center', minHeight: 48, justifyContent: 'center' },
  contenido: { gap: espacios.doce, paddingHorizontal: espacios.lateral },
  miembro: {
    alignItems: 'center',
    borderRadius: radios.loseta,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: espacios.doce,
  },
  pista: { borderRadius: radios.pildora, height: 8, overflow: 'hidden' },
  relleno: { borderRadius: radios.pildora, height: 8 },
  resumen: { gap: 4, padding: espacios.dieciseis },
});
