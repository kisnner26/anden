import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Aparece } from '@/componentes/Aparece';
import { BarraPreguntaIA } from '@/componentes/BarraPreguntaIA';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CarruselBoletos } from '@/componentes/CarruselBoletos';
import { ControlSegmentado } from '@/componentes/ControlSegmentado';
import { FotoDestino } from '@/componentes/FotoDestino';
import { HistorialViajes } from '@/componentes/HistorialViajes';
import { ResumenIA } from '@/componentes/ResumenIA';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { MarcoPestana } from '@/componentes/MarcoPestana';
import { lineaDeBoleto } from '@/datos/contextoIA';
import { FICHAS } from '@/datos/fichasCiudad';
import type { BoletoGuardado } from '@/datos/reserva';
import { useBoletos } from '@/datos/useBoletos';
import { useAhora } from '@/datos/useSalidas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesBoletos {
  alAbrirBoleto: (boletoId: string) => void;
  alBuscar: () => void;
  /** abre el asistente con una pregunta sobre los boletos; solo se ofrece con la IA lista */
  alPreguntar?: (pregunta: string) => void;
  /** abre la pantalla de Andén Plus */
  alAbrirPlus?: () => void;
}

function porSalida(a: BoletoGuardado, b: BoletoGuardado): number {
  return (
    new Date(a.resumen.salida).getTime() - new Date(b.resumen.salida).getTime()
  );
}

/** los boletos guardados en el teléfono, próximos primero; sin boletos muestra cómo conseguir uno */
export function Boletos({
  alAbrirBoleto,
  alAbrirPlus,
  alBuscar,
  alPreguntar,
}: PropiedadesBoletos) {
  const { colores } = useTema();
  const ahora = useAhora();
  const { boletos } = useBoletos();
  const [vista, establecerVista] = useState<'historial' | 'proximos'>(
    'proximos',
  );
  const proximos = boletos
    .filter(({ resumen }) => new Date(resumen.salida) >= ahora)
    .sort(porSalida);
  const pasados = boletos
    .filter(({ resumen }) => new Date(resumen.salida) < ahora)
    .sort((a, b) => porSalida(b, a));

  const mostrandoHistorial =
    proximos.length === 0 || (vista === 'historial' && pasados.length > 0);

  return (
    <MarcoPestana estiloContenido={estilos.contenido}>
      <Text style={[tipografia.titularPantalla, { color: colores.tinta }]}>
        {t('boletos.titulo')}.
      </Text>

      {boletos.length === 0 ? (
        <Bloque estilo={estilos.bloque} estiloContenido={estilos.vacio}>
          <View style={estilos.centrada}>
            <Loseta tamano={72}>
              <Icono nombre="boleto" tamano="ilustracion" />
            </Loseta>
          </View>
          <View style={estilos.textos}>
            <Text
              style={[
                tipografia.subtitulo,
                estilos.vacioTitulo,
                { color: colores.tinta },
              ]}
            >
              {t('boletos.vacioTitulo')}
            </Text>
            <Text
              style={[
                tipografia.cuerpo,
                estilos.detalle,
                { color: colores.tintaSuave },
              ]}
            >
              {t('boletos.vacioDetalle')}
            </Text>
          </View>
          <BotonAccion alPresionar={alBuscar} etiqueta={t('boletos.buscar')} />
        </Bloque>
      ) : null}
      {boletos.length === 0 ? (
        <View style={estilos.destinos}>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {t('boletosVisual.destinosTitulo')}
          </Text>
          <ScrollView
            contentContainerStyle={estilos.carrusel}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {FICHAS.map((ficha) => (
              <Pressable
                accessibilityLabel={ficha.ciudad}
                accessibilityRole="link"
                key={ficha.ciudad}
                onPress={alBuscar}
                style={({ pressed }) => pressed && estilos.presionada}
              >
                <FotoDestino
                  destino={ficha.ciudad}
                  estilo={estilos.ciudad}
                  radio="tarjeta"
                >
                  <View style={estilos.ciudadTexto}>
                    <Text
                      style={[
                        tipografia.subtitulo,
                        { color: colores.sobreNegro },
                      ]}
                    >
                      {ficha.ciudad}
                    </Text>
                  </View>
                </FotoDestino>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : (
        <>
          {proximos.length > 0 && pasados.length > 0 && (
            <ControlSegmentado
              alCambiar={establecerVista}
              opciones={[
                { clave: 'proximos', etiqueta: t('boletos.pestanaProximos') },
                { clave: 'historial', etiqueta: t('boletos.historial') },
              ]}
              valor={mostrandoHistorial ? 'historial' : 'proximos'}
            />
          )}
          {!mostrandoHistorial ? (
            <CarruselBoletos
              ahora={ahora}
              alAbrirBoleto={alAbrirBoleto}
              boletos={proximos}
            />
          ) : (
            <HistorialViajes
              ahora={ahora}
              alAbrirBoleto={alAbrirBoleto}
              alAbrirPlus={alAbrirPlus}
              boletos={pasados}
            />
          )}
          {!mostrandoHistorial && proximos.length > 0 && (
            <Aparece indice={1}>
              <View style={estilos.ia}>
                <ResumenIA
                  contexto={`Boletos vigentes de esta persona:\n${proximos
                    .slice(0, 4)
                    .map(lineaDeBoleto)
                    .join('\n')}`}
                  pedido={t('boletosVisual.resumenPedido')}
                  titulo={t('boletosVisual.resumenTitulo')}
                />
                {alPreguntar && (
                  <BarraPreguntaIA
                    alPreguntar={alPreguntar}
                    sugerencias={[
                      t('boletosVisual.preguntas.cuando'),
                      t('boletosVisual.preguntas.hora'),
                      t('boletosVisual.preguntas.donde'),
                    ]}
                  />
                )}
              </View>
            </Aparece>
          )}
        </>
      )}
    </MarcoPestana>
  );
}

const estilos = StyleSheet.create({
  carrusel: { gap: espacios.doce, paddingRight: espacios.lateral },
  ciudad: { height: 132, justifyContent: 'flex-end', width: 200 },
  ciudadTexto: { padding: espacios.doce },
  destinos: { gap: espacios.ocho },
  ia: { gap: espacios.dieciseis },
  presionada: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  bloque: { marginTop: espacios.veinticuatro },
  centrada: { alignItems: 'center' },
  contenido: { gap: espacios.treintaYDos },
  detalle: { textAlign: 'center' },
  textos: { alignItems: 'center', gap: espacios.ocho },
  vacio: {
    alignItems: 'stretch',
    gap: espacios.veinticuatro,
    padding: espacios.veinticuatro,
  },
  vacioTitulo: { textAlign: 'center' },
});
