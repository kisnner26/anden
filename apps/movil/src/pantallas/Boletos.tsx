import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { Aparece } from '@/componentes/Aparece';
import { FilaBoleto } from '@/componentes/FilaBoleto';
import { PilaBoletos } from '@/componentes/PilaBoletos';
import { agruparBoletos } from '@/datos/gruposBoletos';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { MarcoPestana } from '@/componentes/MarcoPestana';
import type { BoletoGuardado } from '@/datos/reserva';
import { useBoletos } from '@/datos/useBoletos';
import { useAhora } from '@/datos/useSalidas';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

/** cuántos boletos pasados se ven sin desplegar el resto */
const PASADOS_VISIBLES = 3;

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
  const [verTodos, establecerVerTodos] = useState(false);
  const proximos = boletos
    .filter(({ resumen }) => new Date(resumen.salida) >= ahora)
    .sort(porSalida);
  const pasados = boletos
    .filter(({ resumen }) => new Date(resumen.salida) < ahora)
    .sort((a, b) => porSalida(b, a));

  const gruposProximos = agruparBoletos(proximos);

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
              <PilaBoletos
                ahora={ahora}
                alAbrirBoleto={alAbrirBoleto}
                grupo={gruposProximos[0]!}
              />
              {gruposProximos.length > 1 && (
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
                  {gruposProximos.slice(1).map((grupo, indice) => (
                    <Aparece indice={indice} key={grupo.clave}>
                      <View style={estilos.pila}>
                        <PilaBoletos
                          ahora={ahora}
                          alAbrirBoleto={alAbrirBoleto}
                          grupo={grupo}
                        />
                      </View>
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
              {(verTodos ? pasados : pasados.slice(0, PASADOS_VISIBLES)).map(
                (guardado) => (
                  <FilaBoleto
                    alPresionar={alAbrirBoleto}
                    ahora={ahora}
                    guardado={guardado}
                    key={guardado.boleto.id}
                  />
                ),
              )}
              {pasados.length > PASADOS_VISIBLES && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => establecerVerTodos(!verTodos)}
                  style={estilos.verMas}
                >
                  <Text
                    style={[
                      tipografia.subtitulo,
                      { color: colores.ambarTexto },
                    ]}
                  >
                    {verTodos
                      ? t('boletos.verMenos')
                      : t('boletos.verAnteriores').replace(
                          '{{cantidad}}',
                          String(pasados.length - PASADOS_VISIBLES),
                        )}
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </>
      )}
    </MarcoPestana>
  );
}

const estilos = StyleSheet.create({
  verMas: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: espacios.doce,
    minHeight: tamanosControl.toqueMinimo,
  },
  bloque: { marginTop: espacios.veinticuatro },
  centrada: { alignItems: 'center' },
  detalle: { textAlign: 'center' },
  seccion: { marginTop: espacios.veinticuatro },
  pila: { marginTop: espacios.doce },
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
