import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { FilaBoleto } from '@/componentes/FilaBoleto';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
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
  const margenes = useSafeAreaInsets();
  const ahora = useAhora();
  const { boletos } = useBoletos();
  const proximos = boletos
    .filter(({ resumen }) => new Date(resumen.salida) >= ahora)
    .sort(porSalida);
  const pasados = boletos
    .filter(({ resumen }) => new Date(resumen.salida) < ahora)
    .sort((a, b) => porSalida(b, a));

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        { paddingBottom: 130, paddingTop: margenes.top + 8 },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <Text style={[estilos.titulo, { color: colores.tinta }]}>
        {t('boletos.titulo')}
        <Text style={{ color: colores.ambarTitular }}>.</Text>
      </Text>

      {boletos.length === 0 ? (
        <Bloque estilo={estilos.bloque} estiloContenido={estilos.vacio}>
          <View style={estilos.centrada}>
            <Loseta tamano={72}>
              <Icono nombre="boleto" tamano="ilustracion" />
            </Loseta>
          </View>
          <View style={estilos.textos}>
            <Text style={[estilos.vacioTitulo, { color: colores.tinta }]}>
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
            <View>
              <Text
                style={[
                  tipografia.subtitulo,
                  estilos.seccion,
                  { color: colores.tinta },
                ]}
              >
                {t('boletos.proximos')}
              </Text>
              {proximos.map((guardado) => (
                <FilaBoleto
                  alPresionar={alAbrirBoleto}
                  ahora={ahora}
                  guardado={guardado}
                  key={guardado.boleto.id}
                />
              ))}
            </View>
          )}
          {pasados.length > 0 && (
            <View>
              <Text
                style={[
                  tipografia.subtitulo,
                  estilos.seccion,
                  { color: colores.tinta },
                ]}
              >
                {t('boletos.pasados')}
              </Text>
              {pasados.map((guardado) => (
                <FilaBoleto
                  alPresionar={alAbrirBoleto}
                  ahora={ahora}
                  guardado={guardado}
                  key={guardado.boleto.id}
                />
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  bloque: { marginTop: espacios.veinticuatro },
  centrada: { alignItems: 'center' },
  contenido: { paddingHorizontal: espacios.lateral },
  detalle: { textAlign: 'center' },
  seccion: { marginTop: espacios.veinticuatro },
  textos: { alignItems: 'center', gap: espacios.ocho },
  titulo: {
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 46,
    lineHeight: 48,
  },
  vacio: {
    alignItems: 'stretch',
    gap: espacios.veinticuatro,
    padding: espacios.veinticuatro,
  },
  vacioTitulo: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
  },
});
