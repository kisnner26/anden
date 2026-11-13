import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { BotonFavorito } from '@/componentes/BotonFavorito';
import {
  TERMINAL_POR_CIUDAD,
  type CorredorInterlocal,
} from '@/datos/corredores';
import {
  minutosParaSalir,
  nivelDisponibilidad,
  proximaHaciaDestino,
} from '@/datos/disponibilidad';
import { inicioDelDia } from '@/datos/dias';
import { formatoHoraCompleta } from '@/datos/formato';
import { useFavoritos } from '@/datos/useFavoritos';
import { useSalidas } from '@/datos/useSalidas';
import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { movimiento } from '@/tema/movimiento';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

interface PropiedadesTarjetaCorredor {
  alPresionar: (id: CorredorInterlocal['id']) => void;
  corredor: CorredorInterlocal;
}

export function TarjetaCorredor({
  alPresionar,
  corredor,
}: PropiedadesTarjetaCorredor) {
  const { colores } = useTema();
  const etiqueta = t('rutas.abrirCorredor')
    .replace('{{origen}}', corredor.origen)
    .replace('{{destino}}', corredor.destino);
  const { alternar, esFavorito } = useFavoritos();
  const favorito = esFavorito(corredor.id);
  const hoy = useMemo(() => inicioDelDia(new Date()), []);
  const { ahora, salidas } = useSalidas(
    TERMINAL_POR_CIUDAD[corredor.origen],
    hoy,
  );
  const proxima = proximaHaciaDestino(salidas, corredor.destino);
  const nivel = proxima ? nivelDisponibilidad(proxima.asientosLibres) : null;
  const textoLibres =
    nivel === 'agotado'
      ? t('horarios.agotado')
      : nivel === 'pocos'
        ? t('horarios.pocosAsientos')
        : proxima
          ? t('rutas.asientosLibres').replace(
              '{{cantidad}}',
              String(proxima.asientosLibres),
            )
          : '';
  const codigoOrigen = corredor.origen.slice(0, 3).toUpperCase();
  const codigoDestino = corredor.destino.slice(0, 3).toUpperCase();

  return (
    <View style={estilos.envoltura}>
      <Pressable
        accessibilityHint={t('rutas.datosPendientes')}
        accessibilityLabel={etiqueta}
        accessibilityRole="button"
        onPress={() => alPresionar(corredor.id)}
        style={({ pressed }) => [
          estilos.tarjeta,
          pressed && estilos.tarjetaPresionada,
        ]}
      >
        <Bloque estiloContenido={estilos.contenido} radio="tarjeta">
          <View style={estilos.cabecera}>
            <View style={estilos.extremo}>
              <View
                style={[
                  estilos.codigo,
                  { backgroundColor: colores.bloqueNegro },
                ]}
              >
                <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
                  {codigoOrigen}
                </Text>
              </View>
              <Text
                numberOfLines={1}
                style={[tipografia.subtitulo, { color: colores.tinta }]}
              >
                {corredor.origen}
              </Text>
            </View>
            <View style={estilos.conector}>
              <View style={[estilos.guia, { borderColor: colores.linea }]} />
              <Icono color={colores.tinta} nombre="siguiente" tamano="grande" />
              <View style={[estilos.guia, { borderColor: colores.linea }]} />
            </View>
            <View style={estilos.extremo}>
              <View
                style={[
                  estilos.codigo,
                  { backgroundColor: colores.bloqueNegro },
                ]}
              >
                <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
                  {codigoDestino}
                </Text>
              </View>
              <Text
                numberOfLines={1}
                style={[tipografia.subtitulo, { color: colores.tinta }]}
              >
                {corredor.destino}
              </Text>
            </View>
          </View>

          <View
            style={[estilos.separador, { backgroundColor: colores.linea }]}
          />

          <View style={estilos.pie}>
            <View style={estilos.operacion}>
              <Text
                style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
              >
                {t('rutas.operacionMuestra')}
              </Text>
              {proxima ? (
                <View style={estilos.horario}>
                  <Text style={[tipografia.dato, { color: colores.tinta }]}>
                    {formatoHoraCompleta(proxima.salida)}
                  </Text>
                  <Text
                    style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                  >
                    {t('rutas.proximaSaleEn').replace(
                      '{{minutos}}',
                      String(minutosParaSalir(proxima, ahora)),
                    )}
                  </Text>
                  <Text
                    style={[
                      tipografia.etiqueta,
                      {
                        color:
                          nivel === 'hay'
                            ? colores.tintaSuave
                            : colores.ambarTexto,
                      },
                    ]}
                  >
                    {textoLibres}
                  </Text>
                </View>
              ) : (
                <View style={estilos.sinServicio}>
                  <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
                    {t('rutas.sinServicio')}
                  </Text>
                  <Text
                    style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                  >
                    {t('rutas.sinServicioDetalle')}
                  </Text>
                </View>
              )}
            </View>
            <View style={estilos.acciones}>
              <View style={estilos.huecoEstrella} />
              <View
                style={[
                  estilos.avance,
                  { backgroundColor: colores.bloqueNegro },
                ]}
              >
                <Icono
                  color={colores.ambar}
                  nombre="siguiente"
                  tamano="mediano"
                />
              </View>
            </View>
          </View>
        </Bloque>
      </Pressable>
      {/* la estrella es hermana de la tarjeta, no hija: un botón dentro de otro no es válido */}
      <View style={estilos.estrella}>
        <BotonFavorito
          activo={favorito}
          alCambiar={() => void alternar(corredor.id)}
          etiqueta={t(
            favorito ? 'rutas.quitarFavorita' : 'rutas.marcarFavorita',
          )
            .replace('{{origen}}', corredor.origen)
            .replace('{{destino}}', corredor.destino)}
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  avance: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    height: tamanosControl.toqueMinimo,
    justifyContent: 'center',
    width: tamanosControl.toqueMinimo,
  },
  acciones: { alignItems: 'center', flexDirection: 'row', gap: espacios.ocho },
  cabecera: { alignItems: 'center', flexDirection: 'row', gap: espacios.doce },
  conector: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: espacios.cuatro,
  },
  estrella: {
    bottom: espacios.dieciseis,
    position: 'absolute',
    right: espacios.dieciseis + tamanosControl.toqueMinimo + espacios.ocho,
  },
  huecoEstrella: {
    height: tamanosControl.toqueMinimo,
    width: tamanosControl.toqueMinimo,
  },
  extremo: { alignItems: 'center', gap: espacios.ocho, width: 104 },
  guia: { borderStyle: 'dashed', borderTopWidth: 2, flex: 1 },
  codigo: {
    alignItems: 'center',
    borderRadius: radios.loseta,
    height: tamanosControl.toqueMinimo,
    justifyContent: 'center',
    width: tamanosControl.toqueMinimo,
  },
  contenido: { gap: espacios.doce, padding: espacios.dieciseis },
  envoltura: { position: 'relative' },
  horario: { gap: espacios.cuatro },
  operacion: {
    flex: 1,
    gap: espacios.cuatro,
  },
  pie: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'space-between',
  },
  separador: { height: espacios.trazo },
  sinServicio: { gap: espacios.cuatro },
  tarjeta: { minHeight: tamanosControl.toqueMinimo },
  tarjetaPresionada: { transform: [{ scale: movimiento.escalaPresion }] },
});
