import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CarruselBoletos } from '@/componentes/CarruselBoletos';
import { ControlSegmentado } from '@/componentes/ControlSegmentado';
import { HistorialViajes } from '@/componentes/HistorialViajes';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { MarcoPestana } from '@/componentes/MarcoPestana';
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
        </>
      )}
    </MarcoPestana>
  );
}

const estilos = StyleSheet.create({
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
