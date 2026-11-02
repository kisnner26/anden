import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icono, NOMBRES_ICONO } from '@/componentes/Icono';
import { coloresClaros, coloresOscuros } from '@/tema/colores';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { t } from '@/textos/t';

type ModoVitrina = 'oscuro' | 'claro';

export function Vitrina() {
  const [modo, establecerModo] = useState<ModoVitrina>('oscuro');
  const colores = modo === 'oscuro' ? coloresOscuros : coloresClaros;

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        { backgroundColor: colores.fondo },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <View style={estilos.cabecera}>
        <View style={estilos.titulos}>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {t('vitrina.marca')}
          </Text>
          <Text style={[tipografia.display, { color: colores.tinta }]}>
            {t('vitrina.titulo')}
          </Text>
          <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
            {t('vitrina.subtitulo')}
          </Text>
        </View>
        <SelectorTema
          modo={modo}
          alCambiar={establecerModo}
          colores={colores}
        />
      </View>
      <MuestraTipografia colores={colores} />
      <MuestraIconos colores={colores} />
      <MuestraColores colores={colores} />
      <MuestraEspacios colores={colores} />
    </ScrollView>
  );
}

function MuestraIconos({
  colores,
}: {
  colores: typeof coloresOscuros | typeof coloresClaros;
}) {
  return (
    <View style={[estilos.seccion, { borderColor: colores.linea }]}>
      <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
        {t('vitrina.iconos')}
      </Text>
      <View style={estilos.paleta}>
        {NOMBRES_ICONO.map((nombre) => (
          <View key={nombre} style={estilos.muestraColor}>
            <Icono
              color={colores.tinta}
              colorDetalle={colores.fondo}
              etiquetaAccesible={nombre}
              nombre={nombre}
              tamano="ilustracion"
            />
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {nombre}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function MuestraEspacios({
  colores,
}: {
  colores: typeof coloresOscuros | typeof coloresClaros;
}) {
  const escala = [4, 8, 12, 16, 24, 32, 48] as const;
  return (
    <View style={[estilos.seccion, { borderColor: colores.linea }]}>
      <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
        {t('vitrina.espacios')}
      </Text>
      {escala.map((valor) => (
        <View key={valor} style={estilos.filaEspacio}>
          <Text style={[tipografia.dato, { color: colores.tintaSuave }]}>
            {valor}
          </Text>
          <View
            style={[
              estilos.barraEspacio,
              { backgroundColor: colores.ambar, width: valor },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

function MuestraColores({
  colores,
}: {
  colores: typeof coloresOscuros | typeof coloresClaros;
}) {
  const muestras = [
    [t('vitrina.colorFondo'), colores.fondo],
    [t('vitrina.colorSuperficie'), colores.superficie],
    [t('vitrina.colorTinta'), colores.tinta],
    [t('vitrina.colorAmbar'), colores.ambar],
    [t('vitrina.colorATiempo'), colores.aTiempo],
    [t('vitrina.colorAtrasado'), colores.atrasado],
    [t('vitrina.colorCancelado'), colores.cancelado],
  ] as const;
  return (
    <View style={[estilos.seccion, { borderColor: colores.linea }]}>
      <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
        {t('vitrina.colores')}
      </Text>
      <View style={estilos.paleta}>
        {muestras.map(([nombre, color]) => (
          <View key={nombre} style={estilos.muestraColor}>
            <View
              accessibilityLabel={nombre}
              style={[
                estilos.color,
                { backgroundColor: color, borderColor: colores.linea },
              ]}
            />
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {nombre}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function MuestraTipografia({
  colores,
}: {
  colores: typeof coloresOscuros | typeof coloresClaros;
}) {
  return (
    <View style={[estilos.seccion, { borderColor: colores.linea }]}>
      <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
        {t('vitrina.tipografia')}
      </Text>
      <Text style={[tipografia.display, { color: colores.tinta }]}>
        {t('vitrina.muestraDisplay')}
      </Text>
      <Text style={[tipografia.titulo, { color: colores.tinta }]}>
        {t('vitrina.muestraTitulo')}
      </Text>
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('vitrina.muestraCuerpo')}
      </Text>
      <Text style={[tipografia.datoGrande, { color: colores.ambar }]}>
        {t('vitrina.muestraDato')}
      </Text>
    </View>
  );
}

function SelectorTema({
  modo,
  alCambiar,
  colores,
}: {
  modo: ModoVitrina;
  alCambiar: (modo: ModoVitrina) => void;
  colores: typeof coloresOscuros | typeof coloresClaros;
}) {
  const siguiente = modo === 'oscuro' ? 'claro' : 'oscuro';
  return (
    <Pressable
      accessibilityLabel={t('vitrina.cambiarTema')}
      accessibilityRole="switch"
      accessibilityState={{ checked: modo === 'claro' }}
      onPress={() => alCambiar(siguiente)}
      style={[
        estilos.selector,
        { backgroundColor: colores.superficie, borderColor: colores.linea },
      ]}
    >
      <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
        {modo === 'oscuro' ? t('vitrina.temaOscuro') : t('vitrina.temaClaro')}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cabecera: { gap: espacios.veinticuatro },
  color: {
    borderRadius: radios.cuadrado,
    borderWidth: 1,
    height: espacios.cuarentaYOcho,
    width: espacios.cuarentaYOcho,
  },
  contenido: {
    flexGrow: 1,
    gap: espacios.treintaYDos,
    paddingBottom: espacios.cuarentaYOcho,
    paddingHorizontal: espacios.lateral,
    paddingTop: espacios.veinticuatro,
  },
  barraEspacio: { borderRadius: radios.cuadrado, height: espacios.ocho },
  filaEspacio: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
  },
  selector: {
    alignSelf: 'flex-start',
    borderRadius: radios.pildora,
    borderWidth: 1,
    paddingHorizontal: espacios.dieciseis,
    paddingVertical: espacios.doce,
  },
  muestraColor: { alignItems: 'center', gap: espacios.ocho },
  paleta: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.dieciseis },
  seccion: {
    borderTopWidth: 1,
    gap: espacios.dieciseis,
    paddingTop: espacios.veinticuatro,
  },
  titulos: { gap: espacios.ocho },
});
