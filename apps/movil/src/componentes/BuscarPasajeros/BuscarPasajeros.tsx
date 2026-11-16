import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { formatoHora, formatoHoraCompleta, sufijoHora } from '@/datos/formato';
import { MINUTOS_DE_BUSQUEDA } from '@/datos/comunicacion';
import { busquedaDe } from '@/datos/historialSalidas';
import type { Salida } from '@/datos/salidas';
import { conAlfa } from '@/tema/alfa';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesBuscarPasajeros {
  ahora: Date;
  /** empieza la búsqueda por esa cantidad de minutos; con nulo la detiene */
  alBuscar: (viajeId: string, minutos: number | null, libres: number) => void;
  /** no se pudo avisar al servidor */
  fallo: boolean;
  /** los viajes en que se puede pedir pasajeros: con asientos libres, sin cerrar y sin salir */
  viajes: readonly Salida[];
}

/**
 * pedirle pasajeros a la gente cerca: un botón tan grande como el de publicar un viaje; al tocarlo se elige el viaje
 * y el tiempo, y las búsquedas en marcha quedan a la vista con su botón para detenerlas
 */
export function BuscarPasajeros({
  ahora,
  alBuscar,
  fallo,
  viajes,
}: PropiedadesBuscarPasajeros) {
  const { colores } = useTema();
  const [abierto, establecerAbierto] = useState(false);
  const activas = viajes.filter((viaje) => busquedaDe(viaje.viajeId, ahora));
  const posibles = viajes.filter(
    (viaje) => viaje.asientosLibres > 0 && !busquedaDe(viaje.viajeId, ahora),
  );
  if (viajes.length === 0) return null;

  return (
    <View style={estilos.grupo}>
      {activas.map((viaje) => (
        <Pressable
          accessibilityLabel={t('buscarPasajeros.detener')}
          accessibilityRole="button"
          key={viaje.viajeId}
          onPress={() => alBuscar(viaje.viajeId, null, 0)}
        >
          <Bloque estiloContenido={estilos.activa}>
            <View style={estilos.textoActiva}>
              <Text
                style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
              >
                {`${viaje.origen} → ${viaje.destino}`}
              </Text>
              <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
                {rellenar(t('buscarPasajeros.activa'), {
                  hora: formatoHoraCompleta(
                    busquedaDe(viaje.viajeId, ahora)!.hasta,
                  ),
                })}
              </Text>
            </View>
            <Text style={[tipografia.etiqueta, { color: colores.cancelado }]}>
              {t('buscarPasajeros.detener')}
            </Text>
          </Bloque>
        </Pressable>
      ))}

      {posibles.length > 0 && !abierto && (
        <BotonAccion
          alPresionar={() => establecerAbierto(true)}
          etiqueta={t('buscarPasajeros.boton')}
        />
      )}

      {posibles.length > 0 && abierto && (
        <Bloque estiloContenido={estilos.panel}>
          <View style={estilos.cabecera}>
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {t('buscarPasajeros.boton')}
            </Text>
            <Pressable
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => establecerAbierto(false)}
            >
              <Text
                style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
              >
                {t('buscarPasajeros.cerrar')}
              </Text>
            </Pressable>
          </View>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('buscarPasajeros.explicacion')}
          </Text>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {t('buscarPasajeros.cuanto')}
          </Text>
          {posibles.map((viaje) => (
            <View
              key={viaje.viajeId}
              style={[
                estilos.viaje,
                { borderColor: conAlfa(colores.tinta, 0.12) },
              ]}
            >
              <View style={estilos.cabecera}>
                <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                  {`${viaje.origen} → ${viaje.destino}`}
                </Text>
                <Text
                  style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
                >
                  {`${formatoHora(viaje.salida)} ${sufijoHora(viaje.salida)}`}
                </Text>
              </View>
              <View style={estilos.fichas}>
                {MINUTOS_DE_BUSQUEDA.map((minutos) => (
                  <Pressable
                    accessibilityLabel={`${rellenar(t('buscarPasajeros.minutos'), { n: minutos })}, ${viaje.destino}`}
                    accessibilityRole="button"
                    key={minutos}
                    onPress={() => {
                      establecerAbierto(false);
                      alBuscar(viaje.viajeId, minutos, viaje.asientosLibres);
                    }}
                    style={[
                      estilos.ficha,
                      { borderColor: conAlfa(colores.tinta, 0.2) },
                    ]}
                  >
                    <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
                      {rellenar(t('buscarPasajeros.minutos'), { n: minutos })}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </Bloque>
      )}

      {fallo && (
        <Text
          accessibilityLiveRegion="polite"
          style={[tipografia.pequeno, { color: colores.cancelado }]}
        >
          {t('buscarPasajeros.fallo')}
        </Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  activa: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    padding: espacios.dieciseis,
  },
  cabecera: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ficha: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexGrow: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: espacios.dieciseis,
  },
  fichas: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
  grupo: { gap: espacios.doce },
  panel: { gap: espacios.doce, padding: espacios.dieciseis },
  textoActiva: { flex: 1, gap: 2 },
  viaje: {
    borderTopWidth: 1,
    gap: espacios.ocho,
    paddingTop: espacios.doce,
  },
});
