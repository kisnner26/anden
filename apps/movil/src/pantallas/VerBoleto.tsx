import { useEffect, useState } from 'react';
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
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { HojaObjetoOlvidado } from '@/componentes/HojaObjetoOlvidado';
import { TalonBoleto } from '@/componentes/TalonBoleto';
import { estadoVisibleBoleto } from '@/datos/estadoBoleto';
import { useBoletos } from '@/datos/useBoletos';
import { useAvisos } from '@/datos/useAvisos';
import { usePagos } from '@/datos/usePagos';
import { obtenerMuestra, useAhora } from '@/datos/useSalidas';
import {
  guardarObjeto,
  leerObjetos,
  nuevoObjeto,
  objetosDeBoleto,
  type ObjetoOlvidado,
} from '@/datos/objetosOlvidados';
import { habitualDeSalida, horaTexto, idHabitual } from '@/datos/habituales';
import { useHabituales } from '@/datos/useHabituales';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesVerBoleto {
  alCancelado: () => void;
  /** abre la búsqueda con el destino de este boleto, para volver a viajar */
  alReservarOtra?: (destino: string) => void;
  alVerChofer: (choferId: string) => void;
  alVolver: () => void;
  boletoId: string;
}

/** un boleto reservado con pago en efectivo: el talón con su código y QR y lo que hay que pagar al subir */
export function VerBoleto({
  alCancelado,
  alReservarOtra,
  alVerChofer,
  alVolver,
  boletoId,
}: PropiedadesVerBoleto) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const ahora = useAhora();
  const { boletos, cancelar } = useBoletos();
  const { activar } = useAvisos();
  const { estadoDe } = usePagos();
  const { agregar: agregarHabitual, habituales } = useHabituales();
  const [confirmando, establecerConfirmando] = useState(false);
  const [objetos, establecerObjetos] = useState<ObjetoOlvidado[]>([]);
  const [reportando, establecerReportando] = useState(false);

  useEffect(() => {
    void leerObjetos().then(establecerObjetos);
  }, []);
  const guardado = boletos.find(({ boleto }) => boleto.id === boletoId);

  if (!guardado) {
    return (
      <View
        style={[
          estilos.sinDatos,
          {
            backgroundColor: colores.fondo,
            paddingTop: margenes.top + espacios.ocho,
          },
        ]}
      >
        <CabeceraPantalla alVolver={alVolver} titulo={t('boleto.titulo')} />
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
  // el boleto guarda el nombre de la terminal de origen; el viaje habitual usa la ciudad
  const ciudadOrigen = obtenerMuestra().terminales.find(
    (terminal) => terminal.nombre === guardado.resumen.origen,
  )?.ciudad;
  const salidaGuardada = new Date(guardado.resumen.salida);
  const yaEsHabitual =
    ciudadOrigen !== undefined &&
    habituales.some(
      (habitual) =>
        habitual.id ===
          idHabitual(
            ciudadOrigen,
            guardado.resumen.destino,
            horaTexto(salidaGuardada),
          ) && habitual.dias.includes(salidaGuardada.getDay()),
    );
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
        {
          paddingBottom: espacios.cuarentaYOcho,
          paddingTop: margenes.top + espacios.ocho,
        },
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

      {puedeOperar && (
        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {t('boleto.muestra')}
        </Text>
      )}
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {`${t('boletos.estado')}: ${etiquetaEstado}`}
      </Text>
      {estadoDe(guardado.boleto.id) === 'pagado_efectivo' && (
        <Text
          accessibilityLiveRegion="polite"
          style={[tipografia.etiqueta, { color: colores.aTiempo }]}
        >
          {t('boleto.pagadoEfectivo')}
        </Text>
      )}

      {puedeOperar && (
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
      )}

      {puedeOperar && (
        <Bloque estiloContenido={estilos.verificar} hundido radio="loseta">
          <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
            {t('boleto.verificarTitulo')}
          </Text>
          <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
            {rellenar(t('boleto.verificarPlaca'), {
              placa: guardado.resumen.placa,
            })}
          </Text>
          <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
            {rellenar(t('boleto.verificarChofer'), {
              chofer: guardado.resumen.choferNombre,
            })}
          </Text>
          <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
            {rellenar(t('boleto.verificarAnden'), {
              anden: guardado.resumen.anden,
            })}
          </Text>
        </Bloque>
      )}

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

      {ciudadOrigen && guardado.boleto.estado !== 'cancelado' && (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: yaEsHabitual }}
          disabled={yaEsHabitual}
          onPress={() =>
            void agregarHabitual(
              habitualDeSalida(
                ciudadOrigen,
                guardado.resumen.destino,
                new Date(guardado.resumen.salida),
              ),
            )
          }
        >
          <Bloque estiloContenido={estilos.boton} radio="pildora">
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {yaEsHabitual ? t('habitual.guardado') : t('habitual.guardar')}
            </Text>
          </Bloque>
        </Pressable>
      )}

      {(estado === 'usado' || estado === 'vencido') && (
        <>
          <Pressable
            accessibilityRole="button"
            onPress={() => establecerReportando(true)}
          >
            <Bloque estiloContenido={estilos.boton} radio="pildora">
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {t('objetos.reportar')}
              </Text>
            </Bloque>
          </Pressable>
          {objetosDeBoleto(objetos, guardado.boleto.id).length > 0 && (
            <View style={estilos.verificar}>
              <Text
                style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
              >
                {t('objetos.previos')}
              </Text>
              {objetosDeBoleto(objetos, guardado.boleto.id).map((objeto) => (
                <Text
                  key={objeto.id}
                  style={[tipografia.cuerpo, { color: colores.tinta }]}
                >
                  {objeto.descripcion}
                </Text>
              ))}
              <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
                {t('objetos.enviado')}
              </Text>
            </View>
          )}
        </>
      )}

      {!puedeOperar && alReservarOtra && (
        <Pressable
          accessibilityRole="button"
          onPress={() => alReservarOtra(guardado.resumen.destino)}
        >
          <Bloque estiloContenido={estilos.boton} radio="pildora">
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {rellenar(t('boleto.reservarOtra'), {
                destino: guardado.resumen.destino,
              })}
            </Text>
          </Bloque>
        </Pressable>
      )}

      {puedeOperar && (
        <View style={estilos.acciones}>
          <Pressable
            accessibilityLabel={t('boleto.compartir')}
            accessibilityRole="button"
            onPress={() => void compartir()}
            style={estilos.accionEnFila}
          >
            <Bloque estiloContenido={estilos.accion} radio="pildora">
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {t('boleto.compartir')}
              </Text>
            </Bloque>
          </Pressable>
          <Pressable
            accessibilityLabel={t('boleto.recordatorio')}
            accessibilityRole="button"
            onPress={() => void activar()}
            style={estilos.accionEnFila}
          >
            <Bloque estiloContenido={estilos.accion} radio="pildora">
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {t('boleto.recordatorio')}
              </Text>
            </Bloque>
          </Pressable>
        </View>
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
      <HojaObjetoOlvidado
        abierta={reportando}
        alCerrar={() => establecerReportando(false)}
        alEnviar={(descripcion) => {
          void guardarObjeto(
            nuevoObjeto(
              {
                boletoId: guardado.boleto.id,
                destino: guardado.resumen.destino,
                viajeId: guardado.boleto.viajeId,
              },
              descripcion,
            ),
          ).then(establecerObjetos);
          establecerReportando(false);
        }}
      />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  verificar: { gap: espacios.cuatro, padding: espacios.dieciseis },
  acciones: { flexDirection: 'row', gap: espacios.ocho },
  accion: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    minHeight: tamanosControl.toqueMinimo,
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.ocho,
  },
  accionEnFila: { flex: 1 },
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
  sinDatos: {
    flex: 1,
    gap: espacios.dieciseis,
    paddingHorizontal: espacios.lateral,
  },
  confirmar: { gap: espacios.dieciseis, padding: espacios.veinticuatro },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  opcion: { flex: 1, paddingVertical: espacios.doce },
  pago: { gap: 4, padding: espacios.dieciseis },
});
