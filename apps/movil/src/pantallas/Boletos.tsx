import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { BloqueNegro } from '@/componentes/BloqueNegro';
import { BotonAccion } from '@/componentes/BotonAccion';
import { Aparece } from '@/componentes/Aparece';
import { FilaBoleto } from '@/componentes/FilaBoleto';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { MarcoPestana } from '@/componentes/MarcoPestana';
import { minutosHastaSalida } from '@/datos/estadoBoleto';
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
            <View>
              <Text
                style={[
                  tipografia.etiqueta,
                  estilos.proximoEtiqueta,
                  { color: colores.ambarTexto },
                ]}
              >
                {t('boletos.proximo')}
              </Text>
              <Pressable
                accessibilityLabel={`${t('boletos.proximo')} ${proximos[0]?.resumen.destino ?? ''}`}
                accessibilityRole="button"
                onPress={() => alAbrirBoleto(proximos[0]?.boleto.id ?? '')}
              >
                <BloqueNegro estiloContenido={estilos.proximo}>
                  <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
                    {`${t('boletos.saleEn')} ${minutosHastaSalida(proximos[0]!, ahora)} ${t('viajar.minutos')}`}
                  </Text>
                  <Text
                    style={[
                      tipografia.titularProximo,
                      { color: colores.fondo },
                    ]}
                  >
                    {proximos[0]?.resumen.destino}
                  </Text>
                  <Text style={[tipografia.dato, { color: colores.fondo }]}>
                    {`${t('boleto.anden')} ${proximos[0]?.resumen.anden} · ${t('boletos.asientoCorto')} ${proximos[0]?.boleto.asiento}`}
                  </Text>
                </BloqueNegro>
              </Pressable>
              {proximos.length > 1 && (
                <>
                  <Text
                    style={[
                      tipografia.subtitulo,
                      estilos.seccion,
                      { color: colores.tinta },
                    ]}
                  >
                    {t('boletos.proximos')}
                  </Text>
                  {proximos.slice(1).map((guardado, indice) => (
                    <Aparece indice={indice} key={guardado.boleto.id}>
                      <FilaBoleto
                        alPresionar={alAbrirBoleto}
                        ahora={ahora}
                        guardado={guardado}
                      />
                    </Aparece>
                  ))}
                </>
              )}
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
    </MarcoPestana>
  );
}

const estilos = StyleSheet.create({
  bloque: { marginTop: espacios.veinticuatro },
  centrada: { alignItems: 'center' },
  detalle: { textAlign: 'center' },
  seccion: { marginTop: espacios.veinticuatro },
  proximo: { gap: espacios.ocho, padding: espacios.veinticuatro },
  proximoEtiqueta: {
    marginTop: espacios.veinticuatro,
    marginBottom: espacios.ocho,
  },
  textos: { alignItems: 'center', gap: espacios.ocho },
  vacio: {
    alignItems: 'stretch',
    gap: espacios.veinticuatro,
    padding: espacios.veinticuatro,
  },
  vacioTitulo: { textAlign: 'center' },
});
