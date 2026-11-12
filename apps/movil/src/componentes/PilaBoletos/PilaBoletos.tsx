import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Aparece } from '@/componentes/Aparece';
import { Autobus, varianteDeClave } from '@/componentes/Autobus';
import { BloqueNegro } from '@/componentes/BloqueNegro';
import { minutosHastaSalida } from '@/datos/estadoBoleto';
import { formatoFechaCorta, formatoHoraCompleta } from '@/datos/formato';
import type { GrupoBoletos } from '@/datos/gruposBoletos';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

/** cuánto asoma cada tarjeta que queda detrás de la primera */
const ASOMO = 12;
const MAXIMO_DETRAS = 2;

export interface PropiedadesPilaBoletos {
  ahora: Date;
  alAbrirBoleto: (boletoId: string) => void;
  grupo: GrupoBoletos;
}

/** los boletos de un mismo viaje como tarjetas apiladas; una sola tarjeta se abre de una, varias se despliegan */
export function PilaBoletos({
  ahora,
  alAbrirBoleto,
  grupo,
}: PropiedadesPilaBoletos) {
  const { colores } = useTema();
  const [abierta, establecerAbierta] = useState(false);
  const primero = grupo.boletos[0];
  if (!primero) return null;
  const { resumen } = primero;
  const salida = new Date(resumen.salida);
  const cuando = `${formatoFechaCorta(salida)}, ${formatoHoraCompleta(salida)}`;
  const cantidad = grupo.boletos.length;
  const detras = Math.min(cantidad - 1, MAXIMO_DETRAS);

  const tarjeta = (asiento: number, codigo: string, id: string) => (
    <Pressable
      accessibilityLabel={`${resumen.destino}, ${cuando}, ${t('boletos.asientoCorto')} ${asiento}`}
      accessibilityRole="button"
      key={id}
      onPress={() => alAbrirBoleto(id)}
    >
      <BloqueNegro estiloContenido={estilos.tarjeta}>
        <View style={estilos.fila}>
          <View style={estilos.textos}>
            <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
              {`${t('boletos.saleEn')} ${minutosHastaSalida(primero, ahora)} ${t('viajar.minutos')}`}
            </Text>
            <Text style={[tipografia.subtitulo, { color: colores.fondo }]}>
              {resumen.destino}
            </Text>
            <Text style={[tipografia.pequeno, { color: colores.fondo }]}>
              {cuando}
            </Text>
          </View>
          <Autobus
            ancho={96}
            letrero={resumen.destino.toUpperCase()}
            variante={varianteDeClave(resumen.destino)}
          />
        </View>
        <View style={estilos.pie}>
          <Text style={[tipografia.dato, { color: colores.fondo }]}>
            {`${t('boletos.asientoCorto')} ${asiento}`}
          </Text>
          <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
            {codigo}
          </Text>
        </View>
      </BloqueNegro>
    </Pressable>
  );

  if (cantidad === 1) {
    return tarjeta(
      primero.boleto.asiento,
      primero.boleto.codigo,
      primero.boleto.id,
    );
  }

  if (abierta) {
    return (
      <View style={estilos.desplegada}>
        {grupo.boletos.map((guardado, indice) => (
          <Aparece indice={indice} key={guardado.boleto.id}>
            {tarjeta(
              guardado.boleto.asiento,
              guardado.boleto.codigo,
              guardado.boleto.id,
            )}
          </Aparece>
        ))}
        <Pressable
          accessibilityRole="button"
          onPress={() => establecerAbierta(false)}
          style={estilos.cerrar}
        >
          <Text style={[tipografia.subtitulo, { color: colores.ambarTexto }]}>
            {t('boletos.recoger')}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={`${resumen.destino}, ${cuando}, ${t('boletos.cantidad').replace('{{cantidad}}', String(cantidad))}`}
      accessibilityRole="button"
      onPress={() => establecerAbierta(true)}
      style={{ paddingBottom: detras * ASOMO }}
    >
      {Array.from({ length: detras }, (_, i) => detras - i).map((nivel) => (
        <View
          key={nivel}
          style={[
            estilos.detras,
            {
              backgroundColor: conAlfa(colores.tinta, 0.9 - nivel * 0.18),
              bottom: (detras - nivel) * ASOMO,
              left: nivel * 8,
              right: nivel * 8,
            },
          ]}
        />
      ))}
      <View pointerEvents="none">
        {tarjeta(
          primero.boleto.asiento,
          primero.boleto.codigo,
          primero.boleto.id,
        )}
      </View>
      <View
        style={[estilos.cuenta, { backgroundColor: colores.ambar }]}
        pointerEvents="none"
      >
        <Text style={[tipografia.etiqueta, { color: colores.tinta }]}>
          {t('boletos.cantidad').replace('{{cantidad}}', String(cantidad))}
        </Text>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cerrar: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cuenta: {
    borderRadius: radios.pildora,
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.cuatro,
    position: 'absolute',
    right: espacios.doce,
    top: -espacios.ocho,
  },
  desplegada: { gap: espacios.doce },
  detras: {
    borderRadius: radios.bloqueNegro,
    height: 60,
    position: 'absolute',
  },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pie: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tarjeta: { gap: espacios.doce, padding: espacios.lateral },
  textos: { flex: 1, gap: espacios.cuatro },
});
