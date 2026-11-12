import { StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { TarjeteroBoletos } from '@/componentes/TarjeteroBoletos';
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
}

function porSalida(a: BoletoGuardado, b: BoletoGuardado): number {
  return (
    new Date(a.resumen.salida).getTime() - new Date(b.resumen.salida).getTime()
  );
}

/** los boletos guardados en el teléfono, próximos primero; sin boletos muestra cómo conseguir uno */
export function Boletos({ alAbrirBoleto, alBuscar }: PropiedadesBoletos) {
  const { colores } = useTema();
  const ahora = useAhora();
  const { boletos } = useBoletos();
  const proximos = boletos
    .filter(({ resumen }) => new Date(resumen.salida) >= ahora)
    .sort(porSalida);
  const pasados = boletos
    .filter(({ resumen }) => new Date(resumen.salida) < ahora)
    .sort((a, b) => porSalida(b, a));

  return (
    <MarcoPestana>
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
          {proximos.length > 0 && (
            <View style={estilos.grupo}>
              <Text
                style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
              >
                {t('boletos.proximos')}
              </Text>
              <TarjeteroBoletos
                ahora={ahora}
                alAbrirBoleto={alAbrirBoleto}
                boletos={proximos}
              />
            </View>
          )}
          {pasados.length > 0 && (
            <View style={estilos.grupo}>
              <Text
                style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
              >
                {t('boletos.pasados')}
              </Text>
              <TarjeteroBoletos
                ahora={ahora}
                alAbrirBoleto={alAbrirBoleto}
                boletos={pasados}
                pasados
              />
            </View>
          )}
        </>
      )}
    </MarcoPestana>
  );
}

const estilos = StyleSheet.create({
  grupo: { gap: espacios.doce, marginTop: espacios.veinticuatro },
  bloque: { marginTop: espacios.veinticuatro },
  centrada: { alignItems: 'center' },
  detalle: { textAlign: 'center' },
  textos: { alignItems: 'center', gap: espacios.ocho },
  vacio: {
    alignItems: 'stretch',
    gap: espacios.veinticuatro,
    padding: espacios.veinticuatro,
  },
  vacioTitulo: { textAlign: 'center' },
});
