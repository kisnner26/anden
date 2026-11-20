import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { Autobus, varianteDeClave } from '@/componentes/Autobus';
import {
  contactoDeCooperativa,
  rotuloDelServicio,
  trayectoImpreso,
} from '@/datos/boletoDePapel';
import { formatoFechaCorta, formatoHoraCompleta } from '@/datos/formato';
import type { BoletoGuardado } from '@/datos/reserva';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesBoletoDePapel {
  guardado: BoletoGuardado;
}

/** un dato escrito a mano sobre su raya, como en el boleto de papel: el número en tinta roja y la etiqueta debajo */
function CampoAMano({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const { colores } = useTema();
  return (
    <View style={estilos.campo}>
      <Text
        style={[
          tipografia.datoGrande,
          estilos.mano,
          { color: colores.atrasado },
        ]}
      >
        {valor}
      </Text>
      <View style={[estilos.raya, { backgroundColor: colores.tintaPapel }]} />
      <Text style={[tipografia.etiqueta, { color: colores.tintaPapel }]}>
        {etiqueta.toUpperCase()}
      </Text>
    </View>
  );
}

/**
 * el boleto como lo imprime la cooperativa, adaptado a Andén: marco doble, nombre de la cooperativa, la unidad,
 * servicio y trayecto en letras grandes, teléfonos, asiento y valor "a mano" y las leyendas al pie; con el código para abordar
 */
export function BoletoDePapel({ guardado }: PropiedadesBoletoDePapel) {
  const { colores } = useTema();
  const { boleto, resumen } = guardado;
  const contacto = contactoDeCooperativa(resumen.cooperativa);
  const salida = new Date(resumen.salida);

  return (
    <View
      accessibilityLabel={`${t('boletoDePapel.titulo')}: ${rotuloDelServicio(resumen.servicio)} ${trayectoImpreso(resumen.origen, resumen.destino)}, ${t('boletoDePapel.asiento')} ${boleto.asiento}, ${t('boletoDePapel.valor')} C$ ${boleto.precio}`}
      accessible
      style={[
        estilos.papel,
        { backgroundColor: colores.papel, borderColor: colores.tintaPapel },
      ]}
      testID="boleto-de-papel"
    >
      <View style={[estilos.marco, { borderColor: colores.tintaPapel }]}>
        <Text
          style={[
            tipografia.titularResumen,
            estilos.centrado,
            { color: colores.tintaPapel },
          ]}
        >
          {resumen.cooperativa.toUpperCase()}
        </Text>
        <View style={estilos.unidad}>
          <Autobus
            ancho={190}
            variante={varianteDeClave(
              `${resumen.origen ?? ''}-${resumen.destino}`,
            )}
          />
        </View>
        <Text
          style={[
            tipografia.titularBoleto,
            estilos.centrado,
            { color: colores.tintaPapel },
          ]}
        >
          {rotuloDelServicio(resumen.servicio).toUpperCase()}
        </Text>
        <Text
          style={[
            tipografia.titularResumen,
            estilos.centrado,
            { color: colores.tintaPapel },
          ]}
        >
          {trayectoImpreso(resumen.origen, resumen.destino)}
        </Text>
        <Text
          style={[
            tipografia.etiqueta,
            estilos.centrado,
            { color: colores.tintaPapel },
          ]}
        >
          {`${t('boletoDePapel.sale').toUpperCase()} ${formatoFechaCorta(salida).toUpperCase()} · ${formatoHoraCompleta(salida).toUpperCase()}`}
        </Text>

        <Text
          style={[
            tipografia.etiqueta,
            estilos.centrado,
            estilos.llamar,
            { color: colores.tintaPapel },
          ]}
        >
          {t('boletoDePapel.llamar').toUpperCase()}
        </Text>
        {contacto.telefonos.map((telefono) => (
          <View key={telefono.numero} style={estilos.telefono}>
            <View
              style={[
                estilos.operador,
                { backgroundColor: colores.tintaPapel },
              ]}
            >
              <Text style={[tipografia.etiqueta, { color: colores.papel }]}>
                {telefono.operador.toUpperCase()}
              </Text>
            </View>
            <Text
              style={[tipografia.datoGrande, { color: colores.tintaPapel }]}
            >
              {telefono.numero}
            </Text>
          </View>
        ))}

        <View style={estilos.campos}>
          <CampoAMano
            etiqueta={t('boletoDePapel.asiento')}
            valor={String(boleto.asiento)}
          />
          <CampoAMano
            etiqueta={t('boletoDePapel.valor')}
            valor={`C$ ${boleto.precio}`}
          />
        </View>

        <View style={estilos.codigo}>
          <View style={estilos.codigoTexto}>
            <Text style={[tipografia.etiqueta, { color: colores.tintaPapel }]}>
              {t('boletoDePapel.codigo').toUpperCase()}
            </Text>
            <Text
              style={[tipografia.codigoBoleto, { color: colores.tintaPapel }]}
            >
              {boleto.codigo}
            </Text>
          </View>
          <View accessibilityLabel={`QR ${boleto.codigo}`} accessible>
            <QRCode
              backgroundColor={colores.papel}
              color={colores.tintaPapel}
              size={84}
              value={`ANDEN:${boleto.codigo}`}
            />
          </View>
        </View>

        {contacto.leyendas.map((leyenda) => (
          <Text
            key={leyenda}
            style={[
              tipografia.pequeno,
              estilos.centrado,
              estilos.leyenda,
              { color: colores.tintaPapel },
            ]}
          >
            {leyenda.toUpperCase()}
          </Text>
        ))}
        <Text
          style={[
            tipografia.subtitulo,
            estilos.centrado,
            estilos.cierre,
            { color: colores.tintaPapel },
          ]}
        >
          {contacto.cierre}
        </Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: { alignItems: 'center', flex: 1, gap: 2 },
  campos: {
    flexDirection: 'row',
    gap: espacios.veinticuatro,
    marginTop: espacios.doce,
  },
  centrado: { textAlign: 'center' },
  cierre: { fontStyle: 'italic', marginTop: espacios.cuatro },
  codigo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
    justifyContent: 'space-between',
    marginTop: espacios.dieciseis,
  },
  codigoTexto: { flex: 1, gap: 2 },
  leyenda: { opacity: 0.85 },
  llamar: { marginTop: espacios.doce },
  mano: { transform: [{ rotate: '-4deg' }] },
  marco: {
    alignItems: 'stretch',
    borderRadius: radios.loseta - 8,
    borderWidth: 1.5,
    gap: espacios.cuatro,
    padding: espacios.dieciseis,
  },
  operador: {
    borderRadius: radios.pildora,
    paddingHorizontal: espacios.ocho,
    paddingVertical: 2,
  },
  papel: {
    borderRadius: radios.loseta,
    borderWidth: 3,
    padding: espacios.cuatro,
  },
  raya: { alignSelf: 'stretch', height: 2 },
  telefono: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'center',
  },
  unidad: { alignItems: 'center', paddingVertical: espacios.ocho },
});
