import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Autobus } from '@/componentes/Autobus';
import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { formatoHora, sufijoHora } from '@/datos/formato';
import { etiquetaPunto } from '@/datos/puntoEncuentro';
import type { Salida } from '@/datos/salidas';
import {
  MOTIVOS_CANCELACION,
  type MotivoCancelacion,
} from '@/datos/motivoCancelacion';
import { conAlfa } from '@/tema/alfa';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesFilaDeViajeChofer {
  alAbrir: () => void;
  alElegirMotivo: (motivo: MotivoCancelacion) => void;
  /** toca retirar: la primera vez pide confirmar, la segunda retira */
  alRetirar: () => void;
  /** lo cobrado, si el viaje ya se cerró */
  cobrado: number | null;
  /** el chofer ya tocó retirar y falta confirmar */
  confirmando: boolean;
  motivo: MotivoCancelacion | null;
  /** al retirar un viaje con pasajeros hay que decir por qué */
  pideMotivo: boolean;
  transmitiendo: boolean;
  viaje: Salida;
}

/**
 * un viaje del chofer como una sola tarjeta: ruta, hora, unidad y punto de encuentro arriba y, abajo, separado por una
 * línea, lo que se puede hacer con él. Cerrado o en vivo no se puede retirar
 */
export function FilaDeViajeChofer({
  alAbrir,
  alElegirMotivo,
  alRetirar,
  cobrado,
  confirmando,
  motivo,
  pideMotivo,
  transmitiendo,
  viaje,
}: PropiedadesFilaDeViajeChofer) {
  const { colores } = useTema();
  const cerrado = cobrado !== null;
  const puedeRetirar = !cerrado && !transmitiendo;

  return (
    <Bloque>
      <Pressable
        accessibilityLabel={rellenar(t('conductor.abrirViaje'), {
          destino: viaje.destino,
        })}
        accessibilityRole="button"
        onPress={alAbrir}
        style={estilos.cuerpo}
      >
        <Loseta variante="negra">
          {viaje.servicio === 'expreso' ? (
            <Icono nombre="rayo" tamano="ilustracion" />
          ) : (
            <Autobus ancho={tamanosControl.toqueMinimo} usarMiUnidad />
          )}
          {transmitiendo && (
            <View
              style={[
                estilos.enVivo,
                {
                  backgroundColor: colores.aTiempo,
                  borderColor: colores.bloqueNegro,
                },
              ]}
            />
          )}
        </Loseta>
        <View style={estilos.texto}>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            numberOfLines={1}
            style={[tipografia.subtitulo, { color: colores.tinta }]}
          >
            {`${viaje.origen} → ${viaje.destino}`}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {`${t(`servicios.${viaje.servicio}`)} · ${viaje.placa}`}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {etiquetaPunto(viaje.puntoEncuentro)}
          </Text>
          {cerrado ? (
            <Text style={[tipografia.etiqueta, { color: colores.aTiempo }]}>
              {rellenar(t('conductor.cerradoCorto'), { cobrado })}
            </Text>
          ) : null}
          {transmitiendo ? (
            <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
              {t('conductor.enVivo')}
            </Text>
          ) : null}
        </View>
        <View style={estilos.hora}>
          <Text style={[tipografia.dato, { color: colores.ambarTexto }]}>
            {formatoHora(viaje.salida)}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {sufijoHora(viaje.salida)}
          </Text>
        </View>
      </Pressable>

      {pideMotivo ? (
        <View
          style={[
            estilos.motivos,
            { borderColor: conAlfa(colores.tinta, 0.12) },
          ]}
        >
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('nuevoViaje.motivoTitulo')}
          </Text>
          <View style={estilos.fichas}>
            {MOTIVOS_CANCELACION.map((clave) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: motivo === clave }}
                key={clave}
                onPress={() => alElegirMotivo(clave)}
                style={[
                  estilos.ficha,
                  {
                    backgroundColor:
                      motivo === clave
                        ? conAlfa(colores.ambar, 0.2)
                        : 'transparent',
                    borderColor:
                      motivo === clave
                        ? colores.ambar
                        : conAlfa(colores.tinta, 0.2),
                  },
                ]}
              >
                <Text style={[tipografia.pequeno, { color: colores.tinta }]}>
                  {t(`motivoCancelacion.${clave}`)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {puedeRetirar ? (
        <Pressable
          accessibilityRole="button"
          onPress={alRetirar}
          style={[estilos.pie, { borderColor: conAlfa(colores.tinta, 0.12) }]}
        >
          <Text style={[tipografia.etiqueta, { color: colores.cancelado }]}>
            {confirmando
              ? t('nuevoViaje.retirarConfirmar')
              : t('nuevoViaje.retirar')}
          </Text>
        </Pressable>
      ) : null}
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  cuerpo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    padding: espacios.dieciseis,
  },
  enVivo: {
    borderRadius: 7,
    borderWidth: 2,
    height: 14,
    position: 'absolute',
    right: 4,
    top: 4,
    width: 14,
  },
  ficha: {
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: espacios.dieciseis,
  },
  fichas: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
  hora: { alignItems: 'flex-end' },
  motivos: {
    borderTopWidth: 1,
    gap: espacios.ocho,
    padding: espacios.dieciseis,
  },
  pie: {
    alignItems: 'center',
    borderTopWidth: 1,
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
  },
  texto: { flex: 1, gap: 2 },
});
