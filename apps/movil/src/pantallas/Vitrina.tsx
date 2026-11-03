import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/componentes/Boton';
import { Chip } from '@/componentes/Chip';
import { CampoLugar } from '@/componentes/CampoLugar';
import { Hoja } from '@/componentes/Hoja';
import { Icono, NOMBRES_ICONO } from '@/componentes/Icono';
import { TableroSalidas } from '@/componentes/TableroSalidas';
import { armarSalidas } from '@/datos/salidas';
import { crearMuestra } from '@/datos/muestra';
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
      <MuestraControles colores={colores} />
      <MuestraCampoLugar colores={colores} />
      <MuestraHoja colores={colores} />
      <MuestraTablero colores={colores} />
      <MuestraColores colores={colores} />
      <MuestraEspacios colores={colores} />
    </ScrollView>
  );
}

function MuestraCampoLugar({
  colores,
}: {
  colores: typeof coloresOscuros | typeof coloresClaros;
}) {
  const [valorId, establecerValorId] = useState<string | null>('ter_uca');
  const [lugares] = useState(() =>
    crearMuestra(new Date()).terminales.map(({ codigo, id, nombre }) => ({
      codigo,
      id,
      nombre,
    })),
  );
  return (
    <View style={[estilos.seccion, { borderColor: colores.linea }]}>
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('vitrina.campoLugar')}
      </Text>
      <CampoLugar
        alCambiar={establecerValorId}
        etiqueta={t('vitrina.campoLugarEtiqueta')}
        lugares={lugares}
        marcador={t('vitrina.campoLugarMarcador')}
        textoSinResultados={t('viajar.sinTerminales')}
        valorId={valorId}
      />
    </View>
  );
}

function MuestraHoja({
  colores,
}: {
  colores: typeof coloresOscuros | typeof coloresClaros;
}) {
  const [abierta, establecerAbierta] = useState(false);
  return (
    <View style={[estilos.seccion, { borderColor: colores.linea }]}>
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('vitrina.hoja')}
      </Text>
      <Boton
        alPresionar={() => establecerAbierta(true)}
        etiqueta={t('vitrina.hojaAbrir')}
      />
      <Hoja
        abierta={abierta}
        alCerrar={() => establecerAbierta(false)}
        etiquetaCerrar={t('vitrina.hojaCerrar')}
      >
        <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
          {t('vitrina.hojaDetalle')}
        </Text>
      </Hoja>
    </View>
  );
}

function MuestraControles({
  colores,
}: {
  colores: typeof coloresOscuros | typeof coloresClaros;
}) {
  const [filtro, establecerFiltro] = useState<'hoy' | 'manana'>('hoy');
  return (
    <View style={[estilos.seccion, { borderColor: colores.linea }]}>
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('vitrina.botones')}
      </Text>
      <View style={estilos.columnaControles}>
        <Boton alPresionar={sinAccion} etiqueta={t('vitrina.botonPrincipal')} />
        <Boton
          alPresionar={sinAccion}
          etiqueta={t('vitrina.botonSecundario')}
          variante="secundario"
        />
        <Boton
          alPresionar={sinAccion}
          etiqueta={t('vitrina.botonPildora')}
          variante="pildora"
        />
        <Boton
          alPresionar={sinAccion}
          cargando
          etiqueta={t('vitrina.botonCargando')}
        />
        <Boton
          alPresionar={sinAccion}
          deshabilitado
          etiqueta={t('vitrina.botonSecundario')}
        />
      </View>
      <View style={estilos.filaControles}>
        <Chip
          alCambiar={() => establecerFiltro('hoy')}
          etiqueta={t('vitrina.chipHoy')}
          seleccionado={filtro === 'hoy'}
        />
        <Chip
          alCambiar={() => establecerFiltro('manana')}
          etiqueta={t('vitrina.chipManana')}
          seleccionado={filtro === 'manana'}
        />
      </View>
    </View>
  );
}

function MuestraTablero({
  colores,
}: {
  colores: typeof coloresOscuros | typeof coloresClaros;
}) {
  const [cambiada, establecerCambiada] = useState(false);
  const [base] = useState(() => {
    const ahora = new Date();
    return armarSalidas(crearMuestra(ahora), ahora)[0];
  });
  if (!base) return null;
  // solo cambian los minutos y el estado: giran únicamente las fichas que difieren
  const salida = cambiada
    ? {
        ...base,
        estado: 'atrasado' as const,
        minutosAtraso: 10,
        salida: new Date(base.salida.getTime() + 10 * 60000),
      }
    : base;
  return (
    <View style={[estilos.seccion, { borderColor: colores.linea }]}>
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('vitrina.tablero')}
      </Text>
      <TableroSalidas salidas={[salida]} />
      <Boton
        alPresionar={() => establecerCambiada((valor) => !valor)}
        etiqueta={t('vitrina.tableroCambiar')}
      />
    </View>
  );
}

function sinAccion() {}

function MuestraIconos({
  colores,
}: {
  colores: typeof coloresOscuros | typeof coloresClaros;
}) {
  return (
    <View style={[estilos.seccion, { borderColor: colores.linea }]}>
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
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
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
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
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
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
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
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
      <Text style={[tipografia.datoGrande, { color: colores.ambarTitular }]}>
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
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {modo === 'oscuro' ? t('vitrina.temaOscuro') : t('vitrina.temaClaro')}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cabecera: { gap: espacios.veinticuatro },
  columnaControles: { gap: espacios.doce },
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
  filaControles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacios.ocho,
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
