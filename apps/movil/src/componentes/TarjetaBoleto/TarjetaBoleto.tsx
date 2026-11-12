import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Autobus, varianteDeClave } from '@/componentes/Autobus';
import { BarridoDeLuz } from '@/componentes/BarridoDeLuz';
import { minutosHastaSalida } from '@/datos/estadoBoleto';
import { formatoFechaCorta, formatoHoraCompleta } from '@/datos/formato';
import type { BoletoGuardado } from '@/datos/reserva';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesTarjetaBoleto {
  ahora: Date;
  alPresionar: (boletoId: string) => void;
  ancho: number;
  guardado: BoletoGuardado;
}

/** un boleto vigente como tarjeta con talón: destino, hora, bus, asiento y código */
export function TarjetaBoleto({
  ahora,
  alPresionar,
  ancho,
  guardado,
}: PropiedadesTarjetaBoleto) {
  const { colores } = useTema();
  const { boleto, resumen } = guardado;
  const salida = new Date(resumen.salida);
  const minutos = minutosHastaSalida(guardado, ahora);

  return (
    <Pressable
      accessibilityLabel={`${resumen.destino}, ${formatoFechaCorta(salida)}, ${formatoHoraCompleta(salida)}, ${t('boletos.asientoCorto')} ${boleto.asiento}`}
      accessibilityRole="button"
      onPress={() => alPresionar(boleto.id)}
      style={{ width: ancho }}
    >
      <LinearGradient
        colors={[colores.bloqueNegroClaro, colores.bloqueNegro]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={[
          estilos.cara,
          { borderColor: conAlfa(colores.luzRelieve, 0.12) },
        ]}
      >
        <View style={estilos.superior}>
          <View style={estilos.textos}>
            <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
              {minutos <= 0
                ? t('boletos.ahora')
                : `${t('boletos.saleEn')} ${minutos} ${t('viajar.minutos')}`}
            </Text>
            <Text
              numberOfLines={1}
              style={[tipografia.titulo, { color: colores.sobreNegro }]}
            >
              {resumen.destino}
            </Text>
            <Text
              style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
            >
              {`${formatoFechaCorta(salida)} · ${formatoHoraCompleta(salida)}`}
            </Text>
          </View>
          <Autobus
            ancho={104}
            letrero={resumen.destino.toUpperCase()}
            variante={varianteDeClave(resumen.destino)}
          />
        </View>
        <View
          style={[
            estilos.perforacion,
            { borderColor: conAlfa(colores.luzRelieve, 0.2) },
          ]}
        />
        <View style={estilos.inferior}>
          <View style={estilos.dato}>
            <Text
              style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
            >
              {t('boletos.asientoCorto')}
            </Text>
            <Text style={[tipografia.dato, { color: colores.sobreNegro }]}>
              {boleto.asiento}
            </Text>
          </View>
          <View style={estilos.dato}>
            <Text
              style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
            >
              {t('boleto.anden')}
            </Text>
            <Text style={[tipografia.dato, { color: colores.sobreNegro }]}>
              {resumen.anden}
            </Text>
          </View>
          <View style={estilos.dato}>
            <Text
              style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
            >
              {t('boletos.codigoCorto')}
            </Text>
            <Text style={[tipografia.dato, { color: colores.ambar }]}>
              {boleto.codigo}
            </Text>
          </View>
        </View>
        <BarridoDeLuz radio={radios.bloqueNegro} retraso={500} />
      </LinearGradient>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cara: {
    borderRadius: radios.bloqueNegro,
    borderWidth: 1,
    gap: espacios.dieciseis,
    overflow: 'hidden',
    padding: espacios.lateral,
  },
  dato: { alignItems: 'center', flex: 1, gap: espacios.cuatro },
  inferior: { flexDirection: 'row' },
  perforacion: { borderStyle: 'dashed', borderTopWidth: 1 },
  superior: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textos: { flex: 1, gap: espacios.cuatro },
});
