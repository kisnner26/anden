import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { TalonBoleto } from '@/componentes/TalonBoleto';
import { estadoVisibleBoleto } from '@/datos/estadoBoleto';
import { useBoletos } from '@/datos/useBoletos';
import { useAvisos } from '@/datos/useAvisos';
import { useAhora } from '@/datos/useSalidas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesVerBoleto {
  alCancelado: () => void;
  alVerChofer: (choferId: string) => void;
  alVolver: () => void;
  boletoId: string;
}

/** un boleto reservado con pago en efectivo: el talón con su código y QR y lo que hay que pagar al subir */
export function VerBoleto({
  alCancelado,
  alVerChofer,
  alVolver,
  boletoId,
}: PropiedadesVerBoleto) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const ahora = useAhora();
  const { boletos, cancelar } = useBoletos();
  const { activar } = useAvisos();
  const [confirmando, establecerConfirmando] = useState(false);
  const [cambioNoDisponible, establecerCambioNoDisponible] = useState(false);
  const guardado = boletos.find(({ boleto }) => boleto.id === boletoId);

  if (!guardado) {
    return (
      <View style={[estilos.centro, { backgroundColor: colores.fondo }]}>
        <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
          {t('boleto.noExiste')}
        </Text>
      </View>
    );
  }

  const minutos = Math.round(
    (new Date(guardado.resumen.salida).getTime() - ahora.getTime()) / 60_000,
  );
  const estado = estadoVisibleBoleto(guardado, ahora);
  const puedeOperar = estado === 'vigente';
  const etiquetaEstado = {
    cancelado: t('boleto.cancelado'),
    usado: t('boleto.usado'),
    vencido: t('boleto.vencido'),
    vigente: t('boleto.estadoVigente'),
  }[estado];
  const compartir = () =>
    Share.share({
      message: `${t('boleto.titulo')} a ${guardado.resumen.destino}. ${t('boleto.sale')} ${new Date(guardado.resumen.salida).toLocaleString('es-NI')}. ${t('boleto.anden')} ${guardado.resumen.anden}. ${t('boleto.placa')} ${guardado.resumen.placa}.`,
    });

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        { paddingBottom: 48, paddingTop: margenes.top + 8 },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <CabeceraPantalla alVolver={alVolver} titulo={t('boleto.titulo')} />

      {minutos > 0 && (
        <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
          {`${t('viajar.saleEn')} ${minutos} ${t('viajar.minutos')}`}
        </Text>
      )}

      <TalonBoleto guardado={guardado} />

      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {t('boleto.muestra')}
      </Text>
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {`${t('boletos.estado')}: ${etiquetaEstado}`}
      </Text>

      <Bloque estiloContenido={estilos.pago} hundido radio="loseta">
        <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
          {t('boleto.totalAbordar')}
        </Text>
        <Text
          style={[tipografia.datoGrande, { color: colores.tinta }]}
        >{`C$ ${guardado.boleto.precio}`}</Text>
        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {t('boleto.exacto')}
        </Text>
      </Bloque>

      <Pressable
        accessibilityLabel={`${t('boleto.verChofer')} ${guardado.resumen.choferNombre}`}
        accessibilityRole="button"
        onPress={() => alVerChofer(guardado.resumen.choferId)}
      >
        <Bloque estiloContenido={estilos.boton} radio="pildora">
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {`${t('boleto.verChofer')} · ${guardado.resumen.choferNombre}`}
          </Text>
        </Bloque>
      </Pressable>

      {puedeOperar && (
        <View style={estilos.acciones}>
          <Pressable
            accessibilityLabel={t('boleto.compartir')}
            accessibilityRole="button"
            onPress={() => void compartir()}
            style={estilos.accion}
          >
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {t('boleto.compartir')}
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel={t('boleto.recordatorio')}
            accessibilityRole="button"
            onPress={() => void activar()}
            style={estilos.accion}
          >
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {t('boleto.recordatorio')}
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel={t('boleto.cambiar')}
            accessibilityRole="button"
            onPress={() => establecerCambioNoDisponible(true)}
            style={estilos.accion}
          >
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {t('boleto.cambiar')}
            </Text>
          </Pressable>
        </View>
      )}

      {cambioNoDisponible && (
        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {t('boleto.cambioNoDisponible')}
        </Text>
      )}

      {puedeOperar && confirmando ? (
        <Bloque estiloContenido={estilos.confirmar} hundido radio="loseta">
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {t('boleto.confirmarCancelar')}
          </Text>
          <View style={estilos.botones}>
            <Pressable
              accessibilityRole="button"
              onPress={() => establecerConfirmando(false)}
              style={estilos.opcion}
            >
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {t('boleto.noCancelar')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void cancelar(boletoId).then(alCancelado);
              }}
              style={estilos.opcion}
            >
              <Text
                style={[tipografia.subtitulo, { color: colores.cancelado }]}
              >
                {t('boleto.siCancelar')}
              </Text>
            </Pressable>
          </View>
        </Bloque>
      ) : puedeOperar ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => establecerConfirmando(true)}
          style={estilos.cancelar}
        >
          <Text style={[tipografia.subtitulo, { color: colores.cancelado }]}>
            {t('boleto.cancelar')}
          </Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  acciones: { gap: espacios.ocho },
  accion: { minHeight: 44, justifyContent: 'center', paddingHorizontal: espacios.doce },
  boton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: espacios.dieciseis,
  },
  botones: {
    flexDirection: 'row',
    gap: espacios.dieciseis,
    justifyContent: 'space-between',
  },
  cancelar: { alignItems: 'center', paddingVertical: espacios.dieciseis },
  centro: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: espacios.treintaYDos,
  },
  confirmar: { gap: espacios.dieciseis, padding: espacios.veinticuatro },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  opcion: { flex: 1, paddingVertical: espacios.doce },
  pago: { gap: 4, padding: espacios.dieciseis },
});
