import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Autobus, type IdVarianteBus } from '@/componentes/Autobus';
import { Avatar } from '@/componentes/Avatar';
import { Hoja } from '@/componentes/Hoja';
import type { PasajeroDeLista } from '@/componentes/ListaPasajeros';
import type { IdVehiculoPlus } from '@/componentes/VehiculoPlus';
import { iniciales, nombrePropio } from '@/datos/perfil';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesHojaPasajero {
  abierta: boolean;
  abordo: boolean;
  alAlternarAbordaje: (boletoId: string) => void;
  alAlternarPago: (boletoId: string, pagado: boolean) => void;
  alCerrar: () => void;
  /** llama al pasajero; solo se ofrece si el servidor lo permite en este momento */
  alLlamar?: (boletoId: string) => void;
  /** la llamada no se pudo hacer: no hay número o el viaje está fuera de la ventana */
  llamadaFallida?: boolean;
  /** con el viaje cerrado ya no se cambia nada */
  bloqueada?: boolean;
  pagado: boolean;
  pasajero: PasajeroDeLista | null;
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const { colores } = useTema();
  return (
    <View style={estilos.dato}>
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {etiqueta}
      </Text>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        numberOfLines={1}
        style={[tipografia.subtitulo, { color: colores.tinta }]}
      >
        {valor}
      </Text>
    </View>
  );
}

/**
 * la ficha de una persona que va a bordo, para conocerla un poco antes de que suba: sea Plus o no, el conductor ve su
 * nombre, su asiento, su documento, su boleto y el cobro, y puede marcar que abordó o que pagó desde acá
 */
export function HojaPasajero({
  abierta,
  abordo,
  alAlternarAbordaje,
  alAlternarPago,
  alCerrar,
  alLlamar,
  bloqueada = false,
  llamadaFallida = false,
  pagado,
  pasajero,
}: PropiedadesHojaPasajero) {
  const { colores } = useTema();
  const nombre = pasajero ? nombrePropio(pasajero.nombre) : '';
  const partes = nombre.split(' ');

  return (
    <Hoja
      abierta={abierta && pasajero !== null}
      alCerrar={alCerrar}
      etiquetaCerrar={t('conductorPasajeros.cerrarFicha')}
    >
      {pasajero ? (
        <View style={estilos.contenido} testID="ficha-pasajero">
          <View style={estilos.cabecera}>
            <Avatar
              descripcion={nombre}
              iniciales={iniciales({
                apellido: partes.slice(1).join(' '),
                nombre: partes[0] ?? '',
              })}
              tamano={72}
              uri={pasajero.fotoUrl ?? null}
            />
            <View style={estilos.titulos}>
              <Text
                accessibilityRole="header"
                style={[tipografia.titulo, { color: colores.tinta }]}
              >
                {nombre}
              </Text>
              {pasajero.plus ? (
                <View
                  style={[
                    estilos.sello,
                    { backgroundColor: colores.bloqueNegro },
                  ]}
                >
                  {pasajero.unidadPlus ? (
                    <Autobus
                      ancho={44}
                      variante={
                        pasajero.unidadPlus as IdVarianteBus | IdVehiculoPlus
                      }
                    />
                  ) : null}
                  <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
                    {t('plus.sello')}
                  </Text>
                </View>
              ) : (
                <Text
                  style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                >
                  {t('conductorPasajeros.pasajeroComun')}
                </Text>
              )}
            </View>
          </View>

          {pasajero.plus ? (
            <Text style={[tipografia.pequeno, { color: colores.ambarTexto }]}>
              {t('conductorPasajeros.prioridadPlus')}
            </Text>
          ) : null}

          <View style={estilos.cuadricula}>
            <Dato
              etiqueta={t('conductorPasajeros.asientoRotulo')}
              valor={String(pasajero.asiento)}
            />
            <Dato
              etiqueta={t('conductorPasajeros.codigo')}
              valor={pasajero.codigo}
            />
            <Dato
              etiqueta={t('conductor.cedula')}
              valor={pasajero.cedula ?? t('conductor.sinCedula')}
            />
            <Dato
              etiqueta={t('conductorPasajeros.tarifa')}
              valor={`C$ ${pasajero.precio}`}
            />
          </View>

          {pasajero.esMenorEnBrazos ? (
            <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
              {t('conductor.menorEnBrazos')}
            </Text>
          ) : null}

          <View style={estilos.acciones}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ checked: abordo, disabled: bloqueada }}
              disabled={bloqueada}
              onPress={() => alAlternarAbordaje(pasajero.boletoId)}
              style={[
                estilos.accion,
                abordo
                  ? { backgroundColor: colores.bloqueNegro }
                  : { borderColor: colores.linea, borderWidth: 1 },
              ]}
            >
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                numberOfLines={1}
                style={[
                  tipografia.subtitulo,
                  { color: abordo ? colores.sobreNegro : colores.tinta },
                ]}
              >
                {abordo ? t('conductor.abordo') : t('conductor.marcarAbordo')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ checked: pagado, disabled: bloqueada }}
              disabled={bloqueada}
              onPress={() => alAlternarPago(pasajero.boletoId, pagado)}
              style={[
                estilos.accion,
                pagado
                  ? { backgroundColor: colores.aTiempo }
                  : {
                      backgroundColor: conAlfa(colores.tinta, 0.05),
                      borderColor: colores.linea,
                      borderWidth: 1,
                    },
              ]}
            >
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                numberOfLines={1}
                style={[
                  tipografia.subtitulo,
                  { color: pagado ? colores.sobreNegro : colores.tinta },
                ]}
              >
                {pagado
                  ? t('conductor.pagoCorto')
                  : t('conductor.marcarPagado')}
              </Text>
            </Pressable>
          </View>
          {alLlamar ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => alLlamar(pasajero.boletoId)}
              style={[
                estilos.accion,
                { borderColor: colores.linea, borderWidth: 1 },
              ]}
            >
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {t('comunicacion.llamarPasajero')}
              </Text>
            </Pressable>
          ) : null}
          {llamadaFallida ? (
            <Text style={[tipografia.pequeno, { color: colores.cancelado }]}>
              {t('comunicacion.sinNumero')}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Hoja>
  );
}

const estilos = StyleSheet.create({
  accion: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    flex: 1,
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
    paddingHorizontal: espacios.doce,
  },
  acciones: { flexDirection: 'row', gap: espacios.ocho },
  cabecera: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
  },
  contenido: { gap: espacios.dieciseis, paddingBottom: espacios.dieciseis },
  cuadricula: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacios.dieciseis,
  },
  dato: { gap: 2, width: '46%' },
  sello: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radios.pildora,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: espacios.doce,
    paddingVertical: 4,
  },
  titulos: { flex: 1, gap: espacios.cuatro },
});
