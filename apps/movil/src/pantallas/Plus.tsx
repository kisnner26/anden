import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Autobus, VARIANTES_BUS } from '@/componentes/Autobus';
import { Bloque } from '@/componentes/Bloque';
import { BienvenidaPlus } from '@/componentes/BienvenidaPlus';
import { BloqueNegro } from '@/componentes/BloqueNegro';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { formatoFechaCorta } from '@/datos/formato';
import { useBusPropio } from '@/datos/useBusPropio';
import { useSuscripcion } from '@/datos/useSuscripcion';
import { Icono } from '@/componentes/Icono';
import { BENEFICIOS_PLUS } from '@/servicios/beneficios';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesPlus {
  alVolver: () => void;
}

/** Andén Plus: el precio, el estado de la suscripción y cómo activarla o cancelarla */
export function Plus({ alVolver }: PropiedadesPlus) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { activar, cancelar, estado, plus } = useSuscripcion();
  const { elegido, elegir } = useBusPropio();
  const [celebrando, establecerCelebrando] = useState(false);

  async function activarPlus() {
    await activar();
    establecerCelebrando(true);
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          estilos.contenido,
          {
            paddingBottom: espacios.cuarentaYOcho,
            paddingTop: margenes.top + espacios.ocho,
          },
        ]}
        style={{ backgroundColor: colores.fondo }}
      >
        <CabeceraPantalla alVolver={alVolver} titulo={t('plus.titulo')} />
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('plus.detalle')}
        </Text>

        <BloqueNegro estiloContenido={estilos.tarjeta}>
          <View style={estilos.precio}>
            <Text style={[tipografia.display, { color: colores.ambar }]}>
              {t('plus.precio')}
            </Text>
            <Text
              style={[tipografia.cuerpo, { color: colores.sobreNegroSuave }]}
            >
              {t('plus.periodo')}
            </Text>
          </View>
          <Text style={[tipografia.cuerpo, { color: colores.sobreNegro }]}>
            {plus && estado.desde
              ? rellenar(t('plus.estadoPlus'), {
                  fecha: formatoFechaCorta(new Date(estado.desde)),
                })
              : t('plus.estadoGratis')}
          </Text>
        </BloqueNegro>

        {plus ? (
          <BotonAccion
            alPresionar={() => void cancelar()}
            etiqueta={t('plus.cancelar')}
          />
        ) : (
          <BotonAccion
            alPresionar={() => void activarPlus()}
            etiqueta={t('plus.activar')}
          />
        )}
        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {t('plus.notaPrueba')}
        </Text>

        <View style={estilos.seccion}>
          <Text style={[tipografia.titulo, { color: colores.tinta }]}>
            {t('plus.incluyeTitulo')}
          </Text>
          {BENEFICIOS_PLUS.map((beneficio) => (
            <Bloque estiloContenido={estilos.beneficio} key={beneficio.id}>
              <View
                style={[
                  estilos.icono,
                  { backgroundColor: colores.bloqueNegro },
                ]}
              >
                <Icono
                  color={colores.ambar}
                  nombre={beneficio.icono}
                  tamano="mediano"
                />
              </View>
              <View style={estilos.textoBeneficio}>
                <Text style={[tipografia.nombreFila, { color: colores.tinta }]}>
                  {t(`plus.${beneficio.id}Titulo`)}
                </Text>
                <Text
                  style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                >
                  {t(`plus.${beneficio.id}Detalle`)}
                </Text>
              </View>
              {plus && (
                <Text style={[tipografia.etiqueta, { color: colores.aTiempo }]}>
                  {t('plus.incluido')}
                </Text>
              )}
            </Bloque>
          ))}
        </View>

        <View style={estilos.seccion}>
          <Text style={[tipografia.titulo, { color: colores.tinta }]}>
            {t('plus.busTitulo')}
          </Text>
          {!plus && (
            <Text style={[tipografia.pequeno, { color: colores.ambarTexto }]}>
              {t('plus.busBloqueado')}
            </Text>
          )}
          <View style={estilos.rejilla}>
            {VARIANTES_BUS.map((variante) => {
              const activo = elegido === variante.id;
              return (
                <Pressable
                  accessibilityLabel={variante.nombre}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !plus, selected: activo }}
                  disabled={!plus}
                  key={variante.id}
                  onPress={() => void elegir(activo ? null : variante.id)}
                  style={[
                    estilos.bus,
                    {
                      backgroundColor: activo
                        ? colores.barroOscuro
                        : colores.barroClaro,
                      borderColor: activo ? colores.ambar : colores.linea,
                      opacity: plus ? 1 : 0.5,
                    },
                  ]}
                >
                  <Autobus ancho={78} variante={variante.id} />
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
      {celebrando && (
        <BienvenidaPlus alEmpezar={() => establecerCelebrando(false)} />
      )}
    </>
  );
}

const estilos = StyleSheet.create({
  beneficio: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    padding: espacios.dieciseis,
  },
  bus: {
    alignItems: 'center',
    borderRadius: radios.loseta,
    borderWidth: 2,
    flexBasis: '30%',
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: espacios.doce,
  },
  contenido: {
    gap: espacios.veinticuatro,
    paddingHorizontal: espacios.lateral,
  },
  icono: {
    alignItems: 'center',
    borderRadius: radios.loseta,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.doce },
  seccion: { gap: espacios.doce },
  textoBeneficio: { flex: 1, gap: 2 },
  precio: { alignItems: 'baseline', flexDirection: 'row', gap: espacios.ocho },
  tarjeta: { gap: espacios.doce, padding: espacios.veinticuatro },
});
