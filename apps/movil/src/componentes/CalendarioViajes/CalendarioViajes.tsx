import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Aparece } from '@/componentes/Aparece';
import { colorDeDestino } from '@/componentes/Autobus';
import { Bloque } from '@/componentes/Bloque';
import { CarruselBoletos } from '@/componentes/CarruselBoletos';
import { Icono } from '@/componentes/Icono';
import {
  compararMeses,
  mesAnterior,
  mesDe,
  mesSiguiente,
  rangoDeMeses,
  semanasDelMes,
  viajesPorDia,
  type MesCalendario,
} from '@/datos/calendarioViajes';
import type { BoletoGuardado } from '@/datos/reserva';
import { luminancia } from '@/tema/contraste';
import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { inicialesDias, nombresMeses } from '@/textos/es';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesCalendarioViajes {
  ahora: Date;
  alAbrirBoleto: (boletoId: string) => void;
  boletos: readonly BoletoGuardado[];
}

/**
 * los viajes hechos sobre un calendario: cada día con viaje es un círculo del color de su destino;
 * al tocarlo aparecen las tarjetas de ese día. Se navega por meses, solo entre los que tienen viajes.
 */
export function CalendarioViajes({
  ahora,
  alAbrirBoleto,
  boletos,
}: PropiedadesCalendarioViajes) {
  const { colores } = useTema();
  const rango = rangoDeMeses(boletos);
  const [mes, establecerMes] = useState<MesCalendario>(
    rango?.hasta ?? mesDe(ahora),
  );
  const [dia, establecerDia] = useState<number | null>(null);
  const porDia = viajesPorDia(boletos, mes);
  const semanas = semanasDelMes(mes);
  const hoy = mesDe(ahora);
  const puedeAtras = rango ? compararMeses(mes, rango.desde) > 0 : false;
  const puedeAdelante = rango ? compararMeses(mes, rango.hasta) < 0 : false;
  const delDia = dia === null ? undefined : porDia.get(dia);

  function irA(destino: MesCalendario) {
    establecerMes(destino);
    establecerDia(null);
  }

  return (
    <View style={estilos.contenedor}>
      <Bloque estiloContenido={estilos.tarjeta}>
        <View style={estilos.cabecera}>
          <Pressable
            accessibilityLabel={t('boletos.mesAnterior')}
            accessibilityRole="button"
            accessibilityState={{ disabled: !puedeAtras }}
            disabled={!puedeAtras}
            onPress={() => irA(mesAnterior(mes))}
            style={[estilos.flecha, !puedeAtras && estilos.apagada]}
          >
            <View style={estilos.girada}>
              <Icono color={colores.tinta} nombre="siguiente" tamano="grande" />
            </View>
          </Pressable>
          <View style={estilos.titulo}>
            <Text style={[tipografia.titulo, { color: colores.tinta }]}>
              {nombresMeses[mes.mes]}
            </Text>
            <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
              {mes.anio}
            </Text>
          </View>
          <Pressable
            accessibilityLabel={t('boletos.mesSiguiente')}
            accessibilityRole="button"
            accessibilityState={{ disabled: !puedeAdelante }}
            disabled={!puedeAdelante}
            onPress={() => irA(mesSiguiente(mes))}
            style={[estilos.flecha, !puedeAdelante && estilos.apagada]}
          >
            <Icono color={colores.tinta} nombre="siguiente" tamano="grande" />
          </Pressable>
        </View>

        <View style={estilos.semana}>
          {inicialesDias.map((inicial, i) => (
            <Text
              key={`${inicial}${i}`}
              style={[
                tipografia.etiqueta,
                estilos.celdaTexto,
                { color: colores.tintaSuave },
              ]}
            >
              {inicial}
            </Text>
          ))}
        </View>

        {semanas.map((semana, indice) => (
          <View key={indice} style={estilos.semana}>
            {semana.map((numero, columna) => {
              if (numero === null) {
                return <View key={`v${columna}`} style={estilos.celda} />;
              }
              const viajes = porDia.get(numero);
              const esHoy =
                compararMeses(mes, hoy) === 0 && numero === ahora.getDate();
              if (!viajes) {
                return (
                  <View key={numero} style={estilos.celda}>
                    <Text
                      style={[
                        tipografia.pequeno,
                        {
                          color: esHoy
                            ? colores.ambarTexto
                            : colores.tintaSuave,
                        },
                      ]}
                    >
                      {numero}
                    </Text>
                  </View>
                );
              }
              const color = colorDeDestino(viajes[0]!.resumen.destino);
              const sobre =
                luminancia(color) > 0.4
                  ? colores.sobreAmbar
                  : colores.sobreNegro;
              const elegido = dia === numero;
              return (
                <Pressable
                  accessibilityLabel={rellenar(t('boletos.verDia'), {
                    dia: `${numero} ${nombresMeses[mes.mes]}`,
                  })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: elegido }}
                  key={numero}
                  onPress={() => establecerDia(elegido ? null : numero)}
                  style={estilos.celda}
                >
                  <View
                    style={[
                      estilos.marca,
                      { backgroundColor: color },
                      elegido && {
                        borderColor: colores.tinta,
                        borderWidth: 3,
                      },
                    ]}
                  >
                    <Text style={[tipografia.nombreLinea, { color: sobre }]}>
                      {numero}
                    </Text>
                    {viajes.length > 1 && (
                      <View
                        style={[
                          estilos.cuenta,
                          { backgroundColor: colores.bloqueNegro },
                        ]}
                      >
                        <Text
                          style={[
                            tipografia.etiqueta,
                            estilos.cuentaTexto,
                            { color: colores.sobreNegro },
                          ]}
                        >
                          {viajes.length}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </Bloque>

      {delDia && (
        <Aparece>
          <CarruselBoletos
            ahora={ahora}
            alAbrirBoleto={alAbrirBoleto}
            boletos={delDia}
            pasados
          />
        </Aparece>
      )}
    </View>
  );
}

const CELDA = 100 / 7;

const estilos = StyleSheet.create({
  apagada: { opacity: 0.25 },
  cabecera: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: espacios.doce,
  },
  celda: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
    width: `${CELDA}%`,
  },
  celdaTexto: { textAlign: 'center', width: `${CELDA}%` },
  contenedor: { gap: espacios.dieciseis },
  cuenta: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    height: 18,
    justifyContent: 'center',
    minWidth: 18,
    position: 'absolute',
    right: -4,
    top: -4,
  },
  cuentaTexto: { fontSize: 10, lineHeight: 12 },
  flecha: {
    alignItems: 'center',
    height: tamanosControl.toqueMinimo,
    justifyContent: 'center',
    width: tamanosControl.toqueMinimo,
  },
  girada: { transform: [{ scaleX: -1 }] },
  marca: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  semana: { flexDirection: 'row' },
  tarjeta: { padding: espacios.dieciseis },
  titulo: { alignItems: 'center', gap: 2 },
});
