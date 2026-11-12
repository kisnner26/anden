import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { nombrePropio } from '@/datos/perfil';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PasajeroDeLista {
  asiento: number;
  boletoId: string;
  cedula?: string;
  codigo: string;
  esMenorEnBrazos: boolean;
  nombre: string;
  precio: number;
}

export interface PropiedadesListaPasajeros {
  abordo: (boletoId: string) => boolean;
  alAlternarAbordaje: (boletoId: string) => void;
  alAlternarPago: (boletoId: string, pagado: boolean) => void;
  /** con el viaje cerrado ya no se cambia nada */
  bloqueada?: boolean;
  pagado: (boletoId: string) => boolean;
  pasajeros: readonly PasajeroDeLista[];
}

/** quién va en el bus: asiento, nombre, datos del boleto y dos marcas, si abordó y si pagó */
export function ListaPasajeros({
  abordo,
  alAlternarAbordaje,
  alAlternarPago,
  bloqueada = false,
  pagado,
  pasajeros,
}: PropiedadesListaPasajeros) {
  const { colores } = useTema();
  const abordaron = pasajeros.filter((p) => abordo(p.boletoId)).length;
  const avance = pasajeros.length === 0 ? 0 : abordaron / pasajeros.length;

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
          {t('conductor.aBordo')}
        </Text>
        <Text
          accessibilityLiveRegion="polite"
          style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
        >
          {rellenar(t('conductor.abordoDe'), {
            abordo: abordaron,
            total: pasajeros.length,
          })}
        </Text>
      </View>
      <View style={[estilos.pista, { backgroundColor: colores.linea }]}>
        <View
          style={[
            estilos.relleno,
            { backgroundColor: colores.ambar, width: `${avance * 100}%` },
          ]}
        />
      </View>

      {pasajeros.map((pasajero) => {
        const subio = abordo(pasajero.boletoId);
        const pago = pagado(pasajero.boletoId);
        const nombre = nombrePropio(pasajero.nombre);
        return (
          <Bloque estiloContenido={estilos.tarjeta} key={pasajero.boletoId}>
            <View
              style={[
                estilos.asiento,
                subio
                  ? { backgroundColor: colores.ambar }
                  : {
                      backgroundColor: conAlfa(colores.tinta, 0.06),
                      borderColor: colores.linea,
                      borderWidth: 1,
                    },
              ]}
            >
              <Text
                style={[
                  tipografia.dato,
                  { color: subio ? colores.sobreAmbar : colores.tinta },
                ]}
              >
                {pasajero.asiento}
              </Text>
            </View>

            <View style={estilos.datos}>
              <Text
                numberOfLines={1}
                style={[tipografia.nombreFila, { color: colores.tinta }]}
              >
                {nombre}
              </Text>
              <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
                {pasajero.cedula
                  ? `${t('conductor.cedula')} ${pasajero.cedula}`
                  : t('conductor.sinCedula')}
              </Text>
              <Text
                style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
              >
                {`${t('conductor.codigo')} ${pasajero.codigo}`}
              </Text>
              {pasajero.esMenorEnBrazos && (
                <Text
                  style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
                >
                  {t('conductor.menorEnBrazos')}
                </Text>
              )}
            </View>

            <View style={estilos.acciones}>
              <Pressable
                accessibilityLabel={`${subio ? t('conductor.quitarAbordo') : t('conductor.marcarAbordo')}, ${nombre}`}
                accessibilityRole="button"
                accessibilityState={{ checked: subio, disabled: bloqueada }}
                disabled={bloqueada}
                onPress={() => alAlternarAbordaje(pasajero.boletoId)}
                style={[
                  estilos.pildora,
                  subio
                    ? { backgroundColor: colores.bloqueNegro }
                    : { borderColor: colores.linea, borderWidth: 1 },
                ]}
              >
                <Text
                  style={[
                    tipografia.etiqueta,
                    { color: subio ? colores.sobreNegro : colores.tinta },
                  ]}
                >
                  {subio ? t('conductor.abordo') : t('conductor.sinAbordar')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel={`${pago ? t('conductor.quitarPago') : t('conductor.marcarPagado')}, ${nombre}`}
                accessibilityRole="button"
                accessibilityState={{ checked: pago, disabled: bloqueada }}
                disabled={bloqueada}
                onPress={() => alAlternarPago(pasajero.boletoId, pago)}
                style={[
                  estilos.pildora,
                  pago
                    ? { backgroundColor: colores.aTiempo }
                    : { borderColor: colores.linea, borderWidth: 1 },
                ]}
              >
                <Text
                  style={[
                    tipografia.etiqueta,
                    { color: pago ? colores.sobreNegro : colores.tinta },
                  ]}
                >
                  {pago ? t('conductor.pagoCorto') : `C$ ${pasajero.precio}`}
                </Text>
              </Pressable>
            </View>
          </Bloque>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  acciones: { gap: espacios.ocho },
  asiento: {
    alignItems: 'center',
    borderRadius: radios.asiento,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  contenedor: { gap: espacios.doce },
  datos: { flex: 1, gap: 2 },
  encabezado: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pildora: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo - 8,
    minWidth: 84,
    paddingHorizontal: espacios.doce,
  },
  pista: { borderRadius: radios.pildora, height: 8, overflow: 'hidden' },
  relleno: { borderRadius: radios.pildora, height: 8 },
  tarjeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    padding: espacios.doce,
  },
});
