import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { formatoFechaCorta, formatoHoraCompleta } from '@/datos/formato';
import { mensajeDeGrupo } from '@/datos/grupo';
import { useSalidas } from '@/datos/useSalidas';
import { crearGrupo } from '@/servicios/supabase/grupoSupabase';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

const CUPOS = [2, 3, 4, 5, 6] as const;

export interface PropiedadesArmarGrupo {
  /** el grupo ya está creado y compartido: se abre su pantalla */
  alCreado: (codigo: string) => void;
  alVolver: () => void;
  viajeId: string;
}

/** armar un grupo para un viaje: se dice cuántos van, se crea el enlace y se comparte por donde la persona quiera */
export function ArmarGrupo({
  alCreado,
  alVolver,
  viajeId,
}: PropiedadesArmarGrupo) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { salidas } = useSalidas();
  const salida = salidas.find((s) => s.viajeId === viajeId);
  const [cupo, establecerCupo] = useState<number>(3);
  const [creando, establecerCreando] = useState(false);
  const [fallo, establecerFallo] = useState(false);

  async function crear() {
    if (!salida || creando) return;
    establecerCreando(true);
    establecerFallo(false);
    const codigo = await crearGrupo(viajeId, cupo);
    establecerCreando(false);
    if (!codigo) {
      establecerFallo(true);
      return;
    }
    await Share.share({
      message: mensajeDeGrupo({
        codigo,
        cupo,
        destino: salida.destino,
        hora: formatoHoraCompleta(salida.salida),
      }),
    }).catch(() => undefined);
    alCreado(codigo);
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

      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {t('grupo.cupo')}
      </Text>
      <View style={estilos.cupos}>
        {CUPOS.map((n) => (
          <Pressable
            accessibilityLabel={String(n)}
            accessibilityRole="button"
            accessibilityState={{ selected: cupo === n }}
            key={n}
            onPress={() => establecerCupo(n)}
            style={[
              estilos.cupo,
              {
                backgroundColor:
                  cupo === n ? conAlfa(colores.ambar, 0.25) : 'transparent',
                borderColor:
                  cupo === n ? colores.ambar : conAlfa(colores.tinta, 0.16),
              },
            ]}
          >
            <Text style={[tipografia.titulo, { color: colores.tinta }]}>
              {n}
            </Text>
          </Pressable>
        ))}
      </View>

      {fallo ? (
        <Text style={[tipografia.pequeno, { color: colores.cancelado }]}>
          {t('grupo.noSePudoCrear')}
        </Text>
      ) : null}
      <BotonAccion
        alPresionar={() => void crear()}
        cargando={creando}
        deshabilitado={!salida}
        etiqueta={t('grupo.crear')}
      />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { gap: espacios.doce, paddingHorizontal: espacios.lateral },
  cupo: {
    alignItems: 'center',
    borderRadius: radios.tarjeta,
    borderWidth: 1.5,
    flex: 1,
    justifyContent: 'center',
    minHeight: 64,
  },
  cupos: { flexDirection: 'row', gap: espacios.ocho },
  resumen: { gap: 4, padding: espacios.dieciseis },
});
