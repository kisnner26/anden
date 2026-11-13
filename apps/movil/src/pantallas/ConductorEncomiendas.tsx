import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Aparece } from '@/componentes/Aparece';
import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Chip } from '@/componentes/Chip';
import { LineaEstadoEncomienda } from '@/componentes/LineaEstadoEncomienda';
import {
  etapasCumplidas,
  MOTIVOS_RECHAZO,
  type Encomienda,
  type MotivoRechazo,
} from '@/datos/encomiendas';
import { nombrePropio } from '@/datos/perfil';
import { useEncomiendas } from '@/datos/useEncomiendas';
import { useSesion } from '@/datos/useSesion';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

const SECCIONES = [
  { clave: 'solicitada', titulo: 'conductorEncomiendas.porResponder' },
  { clave: 'aceptada', titulo: 'conductorEncomiendas.porRecibir' },
  { clave: 'recibida', titulo: 'conductorEncomiendas.enElBus' },
] as const;

function Pildora({ color, texto }: { color: string; texto: string }) {
  return (
    <View style={[estilos.pildora, { backgroundColor: conAlfa(color, 0.16) }]}>
      <Text style={[tipografia.etiqueta, { color }]}>{texto}</Text>
    </View>
  );
}

/**
 * las encomiendas de los viajes del conductor: las acepta o las rechaza dando un motivo, marca cuándo
 * las recibe y cuándo las entrega; quien las envía ve cada cambio en su teléfono
 */
export function ConductorEncomiendas() {
  const { colores } = useTema();
  const { sesion } = useSesion();
  const { cambiarEstado, encomiendas } = useEncomiendas();
  const [rechazando, establecerRechazando] = useState<string | null>(null);
  const [motivo, establecerMotivo] = useState<MotivoRechazo | null>(null);
  const [otroMotivo, establecerOtroMotivo] = useState('');
  const [fallo, establecerFallo] = useState(false);

  const propias = encomiendas.filter(
    (encomienda) => encomienda.choferId === sesion?.choferId,
  );
  const cerradas = propias
    .filter((e) => ['entregada', 'rechazada', 'cancelada'].includes(e.estado))
    .slice(0, 5);

  async function mover(
    encomienda: Encomienda,
    estado: Encomienda['estado'],
    texto?: string,
  ) {
    establecerFallo(false);
    const ok = await cambiarEstado(encomienda.id, estado, texto);
    if (!ok) establecerFallo(true);
    establecerRechazando(null);
    establecerMotivo(null);
    establecerOtroMotivo('');
  }

  function textoDelMotivo(): string {
    if (motivo === null) return '';
    return motivo === 'otro'
      ? otroMotivo.trim()
      : t(`encomiendas.motivos.${motivo}`);
  }

  const tarjeta = (encomienda: Encomienda, indice: number) => (
    <Aparece indice={indice} key={encomienda.id}>
      <Bloque estiloContenido={estilos.tarjeta}>
        <View style={estilos.encabezado}>
          <Text style={[tipografia.dato, { color: colores.tinta }]}>
            {encomienda.codigo}
          </Text>
          <View style={estilos.pildoras}>
            <Pildora
              color={colores.ambarTexto}
              texto={t(`encomiendas.${encomienda.tamano}`)}
            />
            {encomienda.fragil && (
              <Pildora
                color={colores.cancelado}
                texto={t('encomiendas.fragil')}
              />
            )}
          </View>
        </View>
        <Text style={[tipografia.nombreFila, { color: colores.tinta }]}>
          {`${encomienda.origen} → ${encomienda.destino}`}
        </Text>
        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {`${t('encomiendas.de')} ${nombrePropio(encomienda.remitente)} · ${t('encomiendas.para')} ${nombrePropio(encomienda.destinatario)}`}
        </Text>
        <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
          {encomienda.descripcion}
        </Text>
        <Pressable
          accessibilityRole="link"
          onPress={() =>
            void Linking.openURL(
              `tel:+505${encomienda.telefonoDestinatario}`,
            ).catch(() => undefined)
          }
          style={estilos.llamar}
        >
          <Text style={[tipografia.pequeno, { color: colores.ambarTexto }]}>
            {rellenar(t('conductorEncomiendas.llamar'), {
              telefono: encomienda.telefonoDestinatario,
            })}
          </Text>
        </Pressable>
        {encomienda.estado === 'rechazada' ? (
          <Text style={[tipografia.pequeno, { color: colores.cancelado }]}>
            {rellenar(t('encomiendas.motivo'), {
              motivo: encomienda.motivoRechazo ?? '',
            })}
          </Text>
        ) : encomienda.estado === 'cancelada' ? (
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('conductorEncomiendas.cancelaron')}
          </Text>
        ) : (
          <LineaEstadoEncomienda
            cumplidas={etapasCumplidas(encomienda.estado)}
          />
        )}

        {encomienda.estado === 'solicitada' &&
          (rechazando === encomienda.id ? (
            <View style={estilos.rechazo}>
              <Text
                style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
              >
                {t('conductorEncomiendas.motivoTitulo')}
              </Text>
              <View style={estilos.motivos}>
                {MOTIVOS_RECHAZO.map((clave) => (
                  <Chip
                    alCambiar={() => establecerMotivo(clave)}
                    etiqueta={t(`encomiendas.motivos.${clave}`)}
                    key={clave}
                    seleccionado={motivo === clave}
                  />
                ))}
              </View>
              {motivo === 'otro' && (
                <CampoTexto
                  alCambiar={establecerOtroMotivo}
                  etiqueta={t('conductorEncomiendas.otroMotivo')}
                  valor={otroMotivo}
                />
              )}
              <BotonAccion
                alPresionar={() =>
                  void mover(encomienda, 'rechazada', textoDelMotivo())
                }
                deshabilitado={textoDelMotivo() === ''}
                etiqueta={t('conductorEncomiendas.confirmarRechazo')}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => establecerRechazando(null)}
                style={estilos.texto}
              >
                <Text
                  style={[tipografia.subtitulo, { color: colores.tintaSuave }]}
                >
                  {t('conductorEncomiendas.volver')}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={estilos.acciones}>
              <View style={estilos.accion}>
                <BotonAccion
                  alPresionar={() => void mover(encomienda, 'aceptada')}
                  etiqueta={t('conductorEncomiendas.aceptar')}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => establecerRechazando(encomienda.id)}
                style={estilos.texto}
              >
                <Text
                  style={[tipografia.subtitulo, { color: colores.cancelado }]}
                >
                  {t('conductorEncomiendas.rechazar')}
                </Text>
              </Pressable>
            </View>
          ))}
        {encomienda.estado === 'aceptada' && (
          <BotonAccion
            alPresionar={() => void mover(encomienda, 'recibida')}
            etiqueta={t('conductorEncomiendas.recibida')}
          />
        )}
        {encomienda.estado === 'recibida' && (
          <BotonAccion
            alPresionar={() => void mover(encomienda, 'entregada')}
            etiqueta={t('conductorEncomiendas.entregada')}
          />
        )}
      </Bloque>
    </Aparece>
  );

  return (
    <View style={estilos.contenedor}>
      {propias.length === 0 && (
        <Bloque estiloContenido={estilos.vacio}>
          <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
            {t('conductorEncomiendas.vacio')}
          </Text>
        </Bloque>
      )}
      {fallo && (
        <Text
          accessibilityLiveRegion="polite"
          style={[tipografia.pequeno, { color: colores.cancelado }]}
        >
          {t('conductorEncomiendas.fallo')}
        </Text>
      )}
      {SECCIONES.map(({ clave, titulo }) => {
        const lista = propias.filter((e) => e.estado === clave);
        if (lista.length === 0) return null;
        return (
          <View key={clave} style={estilos.seccion}>
            <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
              {`${t(titulo)} · ${lista.length}`}
            </Text>
            {lista.map(tarjeta)}
          </View>
        );
      })}
      {cerradas.length > 0 && (
        <View style={estilos.seccion}>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {t('conductorEncomiendas.cerradas')}
          </Text>
          {cerradas.map(tarjeta)}
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  accion: { flex: 1 },
  acciones: { alignItems: 'center', flexDirection: 'row', gap: espacios.doce },
  contenedor: { gap: espacios.dieciseis },
  encabezado: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  llamar: { justifyContent: 'center', minHeight: tamanosControl.toqueMinimo },
  motivos: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
  pildora: {
    borderRadius: radios.pildora,
    paddingHorizontal: espacios.ocho,
    paddingVertical: 2,
  },
  pildoras: { flexDirection: 'row', gap: espacios.cuatro },
  rechazo: { gap: espacios.doce },
  seccion: { gap: espacios.doce },
  tarjeta: { gap: espacios.ocho, padding: espacios.dieciseis },
  texto: { justifyContent: 'center', minHeight: tamanosControl.toqueMinimo },
  vacio: { padding: espacios.dieciseis },
});
