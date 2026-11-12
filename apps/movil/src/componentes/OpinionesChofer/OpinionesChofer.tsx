import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Chip } from '@/componentes/Chip';
import { Icono } from '@/componentes/Icono';
import {
  guardarOpinion,
  guardarReporte,
  leerOpiniones,
  MOTIVOS_REPORTE,
  opinionesDe,
  opinionValida,
  type MotivoReporte,
  type Opinion,
} from '@/datos/opiniones';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesOpinionesChofer {
  choferId: string;
}

function vibrar() {
  void Haptics.selectionAsync().catch(() => undefined);
}

/** opiniones de la gente, formulario para dejar la tuya y reporte de un chofer */
export function OpinionesChofer({ choferId }: PropiedadesOpinionesChofer) {
  const { colores } = useTema();
  const [todas, establecerTodas] = useState<Opinion[]>([]);
  const [estrellas, establecerEstrellas] = useState(0);
  const [comentario, establecerComentario] = useState('');
  const [error, establecerError] = useState(false);
  const [enviada, establecerEnviada] = useState(false);
  const [reportando, establecerReportando] = useState(false);
  const [reportado, establecerReportado] = useState(false);

  useEffect(() => {
    void leerOpiniones().then(establecerTodas);
  }, []);

  const propias = opinionesDe(todas, choferId);

  async function enviar() {
    if (!opinionValida(estrellas, comentario)) {
      establecerError(true);
      return;
    }
    establecerError(false);
    const lista = await guardarOpinion({ choferId, comentario, estrellas });
    establecerTodas(lista);
    establecerEstrellas(0);
    establecerComentario('');
    establecerEnviada(true);
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => undefined);
  }

  async function reportar(motivo: MotivoReporte) {
    await guardarReporte(choferId, motivo);
    establecerReportado(true);
    establecerReportando(false);
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Warning,
    ).catch(() => undefined);
  }

  return (
    <View style={estilos.seccion}>
      <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
        {t('opiniones.titulo')}
      </Text>

      {propias.length === 0 ? (
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('opiniones.vacio')}
        </Text>
      ) : (
        propias.map((opinion) => (
          <Bloque
            estiloContenido={estilos.opinion}
            hundido
            key={opinion.id}
            radio="loseta"
          >
            <View
              accessibilityLabel={`${opinion.estrellas} ${t('opiniones.deCinco')}`}
              accessible
              style={estilos.fila}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <Icono
                  color={n <= opinion.estrellas ? undefined : colores.linea}
                  key={n}
                  nombre="estrella"
                  tamano="mediano"
                />
              ))}
            </View>
            {opinion.comentario !== '' && (
              <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
                {opinion.comentario}
              </Text>
            )}
          </Bloque>
        ))
      )}

      <Bloque estiloContenido={estilos.formulario}>
        <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
          {t('opiniones.dejar')}
        </Text>
        <View style={estilos.fila}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              accessibilityLabel={`${n} ${t('opiniones.estrellas')}`}
              accessibilityRole="button"
              accessibilityState={{ selected: estrellas === n }}
              hitSlop={6}
              key={n}
              onPress={() => {
                vibrar();
                establecerEstrellas(n);
              }}
              style={estilos.estrella}
            >
              <Icono
                color={n <= estrellas ? undefined : colores.linea}
                nombre="estrella"
                tamano="ilustracion"
              />
            </Pressable>
          ))}
        </View>
        <CampoTexto
          alCambiar={establecerComentario}
          error={
            error
              ? estrellas === 0
                ? t('opiniones.faltaEstrellas')
                : t('opiniones.muyLargo')
              : undefined
          }
          etiqueta={t('opiniones.comentario')}
          marcador={t('opiniones.marcador')}
          valor={comentario}
        />
        <BotonAccion
          alPresionar={() => void enviar()}
          etiqueta={t('opiniones.enviar')}
        />
        {enviada && (
          <Text
            accessibilityLiveRegion="polite"
            style={[tipografia.pequeno, { color: colores.aTiempo }]}
          >
            {t('opiniones.gracias')}
          </Text>
        )}
      </Bloque>

      {reportado ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[tipografia.pequeno, { color: colores.tintaSuave }]}
        >
          {t('opiniones.reporteEnviado')}
        </Text>
      ) : reportando ? (
        <View style={estilos.motivos}>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {t('opiniones.motivo')}
          </Text>
          <View style={estilos.chips}>
            {MOTIVOS_REPORTE.map((motivo) => (
              <Chip
                alCambiar={() => void reportar(motivo)}
                etiqueta={t(`opiniones.motivos.${motivo}`)}
                key={motivo}
              />
            ))}
          </View>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => establecerReportando(true)}
        >
          <Text
            style={[
              tipografia.pequeno,
              estilos.reportar,
              { color: colores.cancelado },
            ]}
          >
            {t('opiniones.reportar')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
  estrella: { padding: 2 },
  fila: { flexDirection: 'row', gap: espacios.cuatro },
  formulario: { gap: espacios.dieciseis, padding: espacios.veinticuatro },
  motivos: { gap: espacios.ocho },
  opinion: { gap: espacios.ocho, padding: espacios.dieciseis },
  reportar: { paddingVertical: espacios.doce, textDecorationLine: 'underline' },
  seccion: { gap: espacios.dieciseis },
});
