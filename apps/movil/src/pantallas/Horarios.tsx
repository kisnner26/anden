import type { TipoServicio } from '@anden/dominio';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Aparece } from '@/componentes/Aparece';
import { AtajosDelDia } from '@/componentes/AtajosDelDia';
import { BarraPreguntaIA } from '@/componentes/BarraPreguntaIA';
import { FiltroDestinos } from '@/componentes/FiltroDestinos';
import { LineaDelDia } from '@/componentes/LineaDelDia';
import { ProximaSalidaFoto } from '@/componentes/ProximaSalidaFoto';
import { ResumenIA } from '@/componentes/ResumenIA';
import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { Hoja } from '@/componentes/Hoja';
import { HojaRecordatorio } from '@/componentes/HojaRecordatorio';
import { Chip } from '@/componentes/Chip';
import { SelectorDia } from '@/componentes/SelectorDia';
import { FilaSalida } from '@/componentes/FilaSalida';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { MarcoPestana } from '@/componentes/MarcoPestana';
import { TableroSalidas } from '@/componentes/TableroSalidas';
import { CORREDORES_INICIALES, TERMINAL_POR_CIUDAD } from '@/datos/corredores';

import { atajosDelDia, contextoDelDia } from '@/datos/resumenDelDia';
import { rellenar } from '@/textos/rellenar';
import type { MinutosAntes } from '@/datos/recordatorios';
import type { Salida } from '@/datos/salidas';
import { useSonidos } from '@/datos/useSonidos';
import { useSuscripcion } from '@/datos/useSuscripcion';
import { useFavoritos } from '@/datos/useFavoritos';
import {
  useRecordatorios,
  type ResultadoRecordatorio,
} from '@/datos/useRecordatorios';
import { useSalidas } from '@/datos/useSalidas';
import { destinoHabitual } from '@/datos/memoriaIA';
import { useMemoriaIA } from '@/datos/useMemoriaIA';
import { diasDeReserva, inicioDelDia, mismoDia } from '@/datos/dias';
import { diasDeAnticipacion } from '@/servicios/beneficios';
import { proximaSalida } from '@/datos/salidas';
import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

type Filtro = TipoServicio | 'todos';

const FILTROS: readonly { clave: Filtro; etiqueta: () => string }[] = [
  { clave: 'todos', etiqueta: () => t('horarios.todos') },
  { clave: 'ordinario', etiqueta: () => t('servicios.ordinario') },
  { clave: 'expreso', etiqueta: () => t('servicios.expreso') },
];

export interface PropiedadesHorarios {
  /** abre el asistente con una pregunta; solo se ofrece con la IA lista */
  alPreguntar?: (pregunta: string) => void;
  alAbrirBuscador?: () => void;
  alAbrirViaje?: (viajeId: string) => void;
}

/** el tablero de salidas de la terminal, con filtro por servicio */
export function Horarios({
  alAbrirBuscador,
  alAbrirViaje,
  alPreguntar,
}: PropiedadesHorarios) {
  const { colores } = useTema();
  const [terminalId, establecerTerminalId] = useState('ter_may');
  const hoy = useMemo(() => inicioDelDia(new Date()), []);
  const [dia, establecerDia] = useState(hoy);
  const { ahora, datos, salidas } = useSalidas(terminalId, dia);
  const proxima = proximaSalida(salidas);
  const esHoy = mismoDia(dia, ahora);
  const { plus } = useSuscripcion();
  const dias = useMemo(
    () => diasDeReserva(hoy, diasDeAnticipacion(plus)),
    [hoy, plus],
  );
  const memoriaIA = useMemoriaIA();
  const { favoritos } = useFavoritos();
  const [soloFavoritas, establecerSoloFavoritas] = useState(false);
  const recordatorios = useRecordatorios();
  const sonar = useSonidos();
  const [filtrando, establecerFiltrando] = useState(false);
  const [eligiendo, establecerEligiendo] = useState<Salida | null>(null);
  const [errorRecordatorio, establecerErrorRecordatorio] = useState<Exclude<
    ResultadoRecordatorio,
    'listo'
  > | null>(null);

  function cerrarHoja() {
    establecerEligiendo(null);
    establecerErrorRecordatorio(null);
  }

  async function elegirMinutos(minutos: MinutosAntes) {
    if (!eligiendo) return;
    const resultado = await recordatorios.programar(eligiendo, minutos);
    if (resultado === 'listo') {
      sonar('recordatorio');
      cerrarHoja();
    } else establecerErrorRecordatorio(resultado);
  }

  async function quitarRecordatorio() {
    if (!eligiendo) return;
    await recordatorios.quitar(eligiendo.viajeId);
    cerrarHoja();
  }
  const terminal = datos.terminales.find(
    (candidata) => candidata.id === terminalId,
  );
  const [filtro, establecerFiltro] = useState<Filtro>('todos');
  const [soloProximas, establecerSoloProximas] = useState(false);
  const [destinoElegido, establecerDestinoElegido] = useState<string | null>(
    null,
  );
  const porServicio =
    filtro === 'todos'
      ? salidas
      : salidas.filter((salida) => salida.servicio === filtro);
  const porProximas = soloProximas
    ? porServicio.filter(
        (salida) => salida.estado !== 'en-ruta' && salida.estado !== 'llego',
      )
    : porServicio;
  const activos =
    (soloFavoritas ? 1 : 0) +
    (soloProximas ? 1 : 0) +
    (filtro !== 'todos' ? 1 : 0);
  function limpiarFiltros() {
    establecerSoloFavoritas(false);
    establecerSoloProximas(false);
    establecerFiltro('todos');
  }
  const destinosFavoritos: string[] = CORREDORES_INICIALES.filter(
    (corredor) =>
      favoritos.includes(corredor.id) &&
      TERMINAL_POR_CIUDAD[corredor.origen] === terminalId,
  ).map((corredor) => corredor.destino);
  const porFavoritas = soloFavoritas
    ? porProximas.filter((salida) => destinosFavoritos.includes(salida.destino))
    : porProximas;
  const visibles =
    destinoElegido === null
      ? porFavoritas
      : porFavoritas.filter((salida) => salida.destino === destinoElegido);
  const destinosDeLaTerminal = [
    ...new Set(salidas.map((salida) => salida.destino)),
  ];
  const disponibles = visibles.filter(
    (salida) => salida.estado !== 'en-ruta' && salida.estado !== 'llego',
  );
  // con la IA activada y su memoria, se marca la salida que más le conviene: el destino de siempre con asientos
  const habitual = memoriaIA.activa ? destinoHabitual(memoriaIA.memoria) : null;
  const sugeridaId =
    habitual === null
      ? null
      : (disponibles.find(
          (salida) =>
            salida.destino === habitual &&
            salida.asientosLibres > 0 &&
            salida.salida.getTime() >= ahora.getTime(),
        )?.viajeId ?? null);
  const atajos = atajosDelDia(visibles, ahora);

  return (
    <MarcoPestana>
      <View style={estilos.cabecera}>
        <Text style={[tipografia.display, { color: colores.tinta }]}>
          {t('horarios.titulo')}.
        </Text>
        <Pressable
          accessibilityLabel={t('horarios.buscar')}
          accessibilityRole="button"
          onPress={alAbrirBuscador}
        >
          <Bloque estiloContenido={estilos.buscar} radio="pildora">
            <Icono nombre="lupa" tamano="ilustracion" />
          </Bloque>
        </Pressable>
      </View>

      <Bloque estilo={estilos.terminal} estiloContenido={estilos.filaTerminal}>
        <Loseta tamano={50} variante="ambar">
          <Text style={[tipografia.dato, { color: colores.sobreAmbar }]}>
            {terminal?.codigo}
          </Text>
        </Loseta>
        <View style={estilos.datosTerminal}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {terminal?.nombre}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {terminal?.ciudad}
          </Text>
        </View>
      </Bloque>

      {alPreguntar && (
        <View style={estilos.terminal}>
          <BarraPreguntaIA
            alPreguntar={alPreguntar}
            sugerencias={[
              t('preguntaIA.horarios.conviene'),
              t('preguntaIA.horarios.barata'),
              t('preguntaIA.horarios.tarde'),
            ]}
          />
        </View>
      )}

      {proxima ? (
        <Aparece>
          <View style={estilos.terminal}>
            <ProximaSalidaFoto
              ahora={ahora}
              alAbrir={alAbrirViaje}
              esHoy={esHoy}
              salida={proxima}
            />
          </View>
        </Aparece>
      ) : null}

      <FiltroDestinos
        alElegir={establecerDestinoElegido}
        destinos={destinosDeLaTerminal}
        elegido={destinoElegido}
      />

      <SelectorDia
        ahora={ahora}
        alElegir={establecerDia}
        dias={dias}
        seleccionado={dia}
      />
      <View style={estilos.barraFiltros}>
        <Pressable
          accessibilityLabel={
            activos > 0
              ? `${t('horarios.filtros')}, ${activos}`
              : t('horarios.filtros')
          }
          accessibilityRole="button"
          onPress={() => establecerFiltrando(true)}
        >
          <Bloque estiloContenido={estilos.botonFiltros} radio="pildora">
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {t('horarios.filtros')}
            </Text>
            {activos > 0 && (
              <View
                style={[estilos.cuenta, { backgroundColor: colores.ambar }]}
              >
                <Text
                  style={[tipografia.etiqueta, { color: colores.sobreAmbar }]}
                >
                  {activos}
                </Text>
              </View>
            )}
          </Bloque>
        </Pressable>
        {activos > 0 && (
          <Pressable
            accessibilityRole="button"
            onPress={limpiarFiltros}
            style={estilos.limpiar}
          >
            <Text style={[tipografia.pequeno, { color: colores.ambarTexto }]}>
              {t('horarios.quitarFiltros')}
            </Text>
          </Pressable>
        )}
      </View>
      <Hoja
        abierta={filtrando}
        alCerrar={() => establecerFiltrando(false)}
        etiquetaCerrar={t('recordatorios.cerrar')}
      >
        <View style={estilos.hojaFiltros}>
          <Text
            accessibilityRole="header"
            style={[tipografia.titulo, { color: colores.tinta }]}
          >
            {t('horarios.filtrarTitulo')}
          </Text>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {t('horarios.origen')}
          </Text>
          <View style={estilos.filtros}>
            {datos.terminales.map((candidata) => (
              <Chip
                alCambiar={() => establecerTerminalId(candidata.id)}
                etiqueta={candidata.ciudad}
                key={candidata.id}
                seleccionado={terminalId === candidata.id}
              />
            ))}
          </View>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {t('horarios.mostrar')}
          </Text>
          <View style={estilos.filtros}>
            <Chip
              alCambiar={() => establecerSoloFavoritas(!soloFavoritas)}
              etiqueta={t('horarios.favoritas')}
              seleccionado={soloFavoritas}
            />
            <Chip
              alCambiar={() => establecerSoloProximas(!soloProximas)}
              etiqueta={t('horarios.proximas')}
              seleccionado={soloProximas}
            />
          </View>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {t('horarios.servicio')}
          </Text>
          <View style={estilos.filtros}>
            {FILTROS.map(({ clave, etiqueta }) => (
              <Chip
                alCambiar={() => establecerFiltro(clave)}
                etiqueta={etiqueta()}
                key={clave}
                seleccionado={filtro === clave}
              />
            ))}
          </View>
          <BotonAccion
            alPresionar={() => establecerFiltrando(false)}
            etiqueta={t('horarios.verSalidas')}
          />
        </View>
      </Hoja>

      <View style={estilos.graficos}>
        <LineaDelDia
          ahora={ahora}
          alElegir={alAbrirViaje}
          esHoy={esHoy}
          salidas={visibles}
        />
        <AtajosDelDia alAbrir={alAbrirViaje} atajos={atajos} />
        {visibles.length > 0 && (
          <ResumenIA
            contexto={contextoDelDia(visibles, terminal?.ciudad ?? '')}
            pedido={rellenar(t('vistaDia.resumenPedido'), {
              terminal: terminal?.ciudad ?? '',
            })}
            titulo={t('vistaDia.resumenTitulo')}
          />
        )}
      </View>

      <View style={estilos.tablero}>
        <TableroSalidas
          alElegir={
            alAbrirViaje ? (salida) => alAbrirViaje(salida.viajeId) : undefined
          }
          salidas={visibles}
        />
      </View>

      {soloFavoritas && destinosFavoritos.length === 0 ? (
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('horarios.sinFavoritas')}
        </Text>
      ) : null}

      {disponibles.length > 0 ? (
        <View>
          <Text
            style={[
              tipografia.subtitulo,
              estilos.tituloLista,
              { color: colores.tinta },
            ]}
          >
            {t('horarios.disponibilidad')}
          </Text>
          {disponibles.map((salida, indice) => (
            <Aparece indice={indice} key={salida.viajeId}>
              <FilaSalida
                alPresionar={alAbrirViaje}
                mostrarDisponibilidad
                recordatorio={{
                  activo: recordatorios.de(salida.viajeId) !== undefined,
                  alPresionar: () => establecerEligiendo(salida),
                  etiqueta: t(
                    recordatorios.de(salida.viajeId)
                      ? 'recordatorios.quitarEtiqueta'
                      : 'recordatorios.abrir',
                  ).replace('{{destino}}', salida.destino),
                }}
                salida={salida}
                sugerida={
                  salida.viajeId === sugeridaId ? t('ia.paraVos') : undefined
                }
              />
            </Aparece>
          ))}
        </View>
      ) : null}

      <HojaRecordatorio
        actual={eligiendo ? recordatorios.de(eligiendo.viajeId) : undefined}
        ahora={ahora}
        alCerrar={cerrarHoja}
        alElegir={(minutos) => void elegirMinutos(minutos)}
        alQuitar={() => void quitarRecordatorio()}
        error={errorRecordatorio}
        plus={plus}
        salida={eligiendo}
      />
    </MarcoPestana>
  );
}

const estilos = StyleSheet.create({
  barraFiltros: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
  },
  botonFiltros: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.ocho,
    paddingHorizontal: espacios.dieciseis,
    paddingVertical: espacios.ocho,
  },
  cuenta: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    minWidth: 24,
    paddingHorizontal: espacios.ocho,
  },
  hojaFiltros: {
    gap: espacios.doce,
    paddingBottom: espacios.cuarentaYOcho,
    paddingHorizontal: espacios.lateral,
  },
  limpiar: { justifyContent: 'center', minHeight: tamanosControl.toqueMinimo },
  buscar: {
    alignItems: 'center',
    height: tamanosControl.toqueMinimo,
    justifyContent: 'center',
    width: tamanosControl.toqueMinimo,
  },
  cabecera: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datosTerminal: { flex: 1 },
  filaTerminal: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.doce,
  },
  filtros: { gap: espacios.ocho, paddingVertical: espacios.ocho },
  filaProxima: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  proxima: { gap: espacios.cuatro, padding: espacios.dieciseis },
  graficos: { gap: espacios.dieciseis, marginTop: espacios.dieciseis },
  tablero: { marginTop: espacios.cuatro },
  tituloLista: { marginTop: espacios.veinticuatro },
  terminal: { marginTop: espacios.dieciseis },
});
