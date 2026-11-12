import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Autobus, varianteDeClave } from '@/componentes/Autobus';
import { Avatar } from '@/componentes/Avatar';
import { Bloque } from '@/componentes/Bloque';
import { EtiquetaMuestra } from '@/componentes/EtiquetaMuestra';
import { EnlaceTerminal } from '@/componentes/EnlaceTerminal';
import { Campaneo } from '@/componentes/Campaneo';
import { Aparece } from '@/componentes/Aparece';
import { FilaSalida } from '@/componentes/FilaSalida';
import { Icono } from '@/componentes/Icono';
import { MarcoPestana } from '@/componentes/MarcoPestana';
import { TarjetaHabitual } from '@/componentes/TarjetaHabitual';
import { TarjetaProximoViaje } from '@/componentes/TarjetaProximoViaje';
import { destinosDeHoy } from '@/datos/destinosDeHoy';
import { formatoHoraCompleta } from '@/datos/formato';
import { iniciales, nombrePropio } from '@/datos/perfil';
import { useAvisos } from '@/datos/useAvisos';
import { usePerfil } from '@/datos/usePerfil';
import { usePreferenciaUbicacion } from '@/datos/ProveedorUbicacion';
import { useUbicacionCercana } from '@/datos/useUbicacionCercana';
import { useSalidas } from '@/datos/useSalidas';
import { inicioDelDia } from '@/datos/dias';
import { proximaDelHabitual } from '@/datos/habituales';
import { useHabituales } from '@/datos/useHabituales';
import { proximaSalida } from '@/datos/salidas';
import { espacios, tamanosControl } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesViajar {
  alAbrirAjustes?: () => void;
  alAbrirAvisos?: () => void;
  alAbrirViaje: (viajeId: string) => void;
  alElegirAsiento: (viajeId: string) => void;
  /** lleva a Horarios, donde se elige otro día */
  alReservarOtroDia?: () => void;
  /** salta a otra pestaña desde los atajos */
  alIrA?: (pestana: 'boletos' | 'horarios' | 'rutas') => void;
}

const ESTADOS_PENDIENTES = ['abordando', 'atrasado', 'programado'];

/** inicio: el próximo viaje con el bus y las salidas de hoy */
export function Viajar({
  alAbrirAjustes,
  alAbrirAvisos,
  alAbrirViaje,
  alElegirAsiento,
  alReservarOtroDia,
  alIrA,
}: PropiedadesViajar) {
  const { colores } = useTema();
  const { perfil } = usePerfil();
  const [origenId, establecerOrigenId] = useState('ter_may');
  const hoy = useMemo(() => inicioDelDia(new Date()), []);
  const { ahora, datos, salidas } = useSalidas(origenId, hoy);
  const { habituales, quitar: quitarHabitual } = useHabituales();
  const { salidas: todasLasSalidas } = useSalidas();
  const { noLeidos } = useAvisos();
  const preferenciaUbicacion = usePreferenciaUbicacion();
  const ubicacionResuelta = useRef(false);
  const primerNombre = nombrePropio(perfil.nombre).split(' ')[0] ?? '';
  const saludo =
    primerNombre === ''
      ? t('viajar.saludo')
      : `${t('viajar.saludo')}, ${primerNombre}`;
  const proxima = proximaSalida(salidas);
  const pendientes = salidas
    .filter(
      (salida) =>
        salida.viajeId !== proxima?.viajeId &&
        ESTADOS_PENDIENTES.includes(salida.estado),
    )
    .slice(0, 3);
  const destinos = destinosDeHoy(salidas);
  const terminalOrigen = datos.terminales.find(
    (terminal) => terminal.id === origenId,
  );
  const ubicacion = useUbicacionCercana(datos.terminales, establecerOrigenId);

  useEffect(() => {
    if (
      !preferenciaUbicacion.activada ||
      preferenciaUbicacion.estado !== 'otorgado'
    ) {
      ubicacionResuelta.current = false;
      return;
    }
    if (ubicacionResuelta.current) return;
    ubicacionResuelta.current = true;
    void ubicacion.resolver();
  }, [preferenciaUbicacion.activada, preferenciaUbicacion.estado, ubicacion]);

  return (
    <MarcoPestana>
      <View style={estilos.cabecera}>
        <Pressable
          accessibilityLabel={t('ajustes.titulo')}
          accessibilityRole="button"
          onPress={alAbrirAjustes}
          style={({ pressed }) => pressed && estilos.presionado}
        >
          <Avatar
            descripcion={t('perfil.fotoDescripcion')}
            iniciales={iniciales(perfil)}
            tamano={48}
            uri={perfil.fotoUri}
          />
        </Pressable>
        <View style={estilos.saludo}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {saludo}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('viajar.pregunta')}
          </Text>
        </View>
        <Pressable
          accessibilityLabel={
            noLeidos > 0
              ? `${t('viajar.avisos')}, ${noLeidos} ${t('avisos.noLeido').toLowerCase()}`
              : t('viajar.avisos')
          }
          accessibilityRole="button"
          onPress={alAbrirAvisos}
          style={({ pressed }) => pressed && estilos.presionado}
        >
          <Bloque estiloContenido={estilos.campana} radio="pildora">
            <Campaneo activo={noLeidos > 0}>
              <Icono nombre="campana" tamano="ilustracion" />
            </Campaneo>
          </Bloque>
          {noLeidos > 0 && (
            <View
              style={[estilos.puntoCampana, { backgroundColor: colores.ambar }]}
              testID="campana-sin-leer"
            />
          )}
        </Pressable>
      </View>

      {proxima ? (
        <TarjetaProximoViaje
          ahora={ahora}
          alVerBoleto={() => alElegirAsiento(proxima.viajeId)}
          salida={proxima}
        />
      ) : (
        <Text
          style={[
            tipografia.cuerpo,
            estilos.vacio,
            { color: colores.tintaSuave },
          ]}
        >
          {t('viajar.sinSalidas')}
        </Text>
      )}

      {habituales.map((habitual) => (
        <TarjetaHabitual
          ahora={ahora}
          alQuitar={() => void quitarHabitual(habitual.id)}
          alReservar={alAbrirViaje}
          habitual={habitual}
          key={habitual.id}
          proxima={proximaDelHabitual(habitual, todasLasSalidas, ahora)}
        />
      ))}

      <View style={estilos.seccion}>
        <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
          {t('viajar.salidasDeHoy')}
        </Text>
        <EtiquetaMuestra />
      </View>

      {pendientes.length === 0 && (
        <Text
          style={[
            tipografia.cuerpo,
            estilos.vacio,
            { color: colores.tintaSuave },
          ]}
        >
          {t('viajar.sinSalidasOrigen')}
        </Text>
      )}
      {pendientes.map((salida, indice) => (
        <Aparece indice={indice} key={salida.viajeId}>
          <FilaSalida alPresionar={alAbrirViaje} salida={salida} />
        </Aparece>
      ))}

      {destinos.length > 0 && (
        <View>
          <Text
            style={[
              tipografia.subtitulo,
              estilos.seccionSola,
              { color: colores.tinta },
            ]}
          >
            {t('viajar.destinosDesde')}
          </Text>
          <ScrollView
            contentContainerStyle={estilos.destinos}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {destinos.map((salida, indice) => (
              <Aparece indice={indice} key={salida.destino}>
                <Pressable
                  accessibilityLabel={`${salida.destino}, ${formatoHoraCompleta(salida.salida)}`}
                  accessibilityRole="button"
                  onPress={() => alAbrirViaje(salida.viajeId)}
                  style={({ pressed }) => pressed && estilos.presionado}
                >
                  <Bloque estiloContenido={estilos.destino}>
                    <Autobus
                      ancho={96}
                      variante={varianteDeClave(salida.destino)}
                    />
                    <Text
                      style={[tipografia.nombreFila, { color: colores.tinta }]}
                    >
                      {salida.destino}
                    </Text>
                    <Text
                      style={[
                        tipografia.etiqueta,
                        { color: colores.ambarTexto },
                      ]}
                    >
                      {formatoHoraCompleta(salida.salida)}
                    </Text>
                  </Bloque>
                </Pressable>
              </Aparece>
            ))}
          </ScrollView>
        </View>
      )}

      {alIrA && (
        <View>
          <Text
            style={[
              tipografia.subtitulo,
              estilos.seccionSola,
              { color: colores.tinta },
            ]}
          >
            {t('viajar.atajos')}
          </Text>
          <View style={estilos.atajos}>
            {(
              [
                ['boletos', 'viajar.atajoBoletos', 'boleto'],
                ['horarios', 'viajar.atajoHorarios', 'reloj'],
                ['rutas', 'viajar.atajoRutas', 'pestanaRutas'],
              ] as const
            ).map(([destino, texto, icono]) => (
              <Pressable
                accessibilityRole="button"
                key={destino}
                onPress={() => alIrA(destino)}
                style={({ pressed }) => [
                  estilos.atajo,
                  pressed && estilos.presionado,
                ]}
              >
                <Bloque estiloContenido={estilos.atajoContenido}>
                  <Icono nombre={icono} tamano="ilustracion" />
                  <Text style={[tipografia.pequeno, { color: colores.tinta }]}>
                    {t(texto)}
                  </Text>
                </Bloque>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <Pressable
        accessibilityHint={t('dias.selector')}
        accessibilityRole="button"
        onPress={alReservarOtroDia}
        style={estilos.otroDia}
      >
        <Text style={[tipografia.subtitulo, { color: colores.ambarTexto }]}>
          {t('viajar.otroDia')}
        </Text>
        <Icono color={colores.ambarTexto} nombre="siguiente" tamano="mediano" />
      </Pressable>

      {terminalOrigen ? (
        <View style={estilos.terminal}>
          <EnlaceTerminal terminal={terminalOrigen} />
        </View>
      ) : null}
    </MarcoPestana>
  );
}

const estilos = StyleSheet.create({
  atajo: { flex: 1 },
  atajoContenido: {
    alignItems: 'center',
    gap: espacios.ocho,
    padding: espacios.doce,
  },
  atajos: { flexDirection: 'row', gap: espacios.doce },
  destino: {
    alignItems: 'center',
    gap: espacios.cuatro,
    padding: espacios.doce,
    width: 132,
  },
  destinos: { gap: espacios.doce, paddingVertical: espacios.cuatro },
  seccionSola: {
    marginBottom: espacios.doce,
    marginTop: espacios.veinticuatro,
  },
  otroDia: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.ocho,
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
  },
  puntoCampana: {
    borderRadius: 6,
    height: 12,
    position: 'absolute',
    right: 4,
    top: 4,
    width: 12,
  },
  presionado: {
    opacity: 0.9,
    transform: [{ scale: movimiento.escalaPresion }],
  },
  cabecera: { alignItems: 'center', flexDirection: 'row', gap: espacios.doce },
  campana: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  saludo: { flex: 1 },
  seccion: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: espacios.veinticuatro,
  },
  terminal: { marginTop: espacios.veinticuatro },
  vacio: { marginTop: espacios.treintaYDos, textAlign: 'center' },
});
