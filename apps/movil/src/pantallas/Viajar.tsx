import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';

import { Avatar } from '@/componentes/Avatar';
import { Bloque } from '@/componentes/Bloque';
import { EtiquetaMuestra } from '@/componentes/EtiquetaMuestra';
import { EnlaceTerminal } from '@/componentes/EnlaceTerminal';
import { Campaneo } from '@/componentes/Campaneo';
import { Aparece } from '@/componentes/Aparece';
import { FilaSalida } from '@/componentes/FilaSalida';
import { Icono } from '@/componentes/Icono';
import { MarcoPestana } from '@/componentes/MarcoPestana';
import { TarjetaProximoViaje } from '@/componentes/TarjetaProximoViaje';
import { iniciales } from '@/datos/perfil';
import { useAvisos } from '@/datos/useAvisos';
import { usePerfil } from '@/datos/usePerfil';
import { usePreferenciaUbicacion } from '@/datos/ProveedorUbicacion';
import { useUbicacionCercana } from '@/datos/useUbicacionCercana';
import { useSalidas } from '@/datos/useSalidas';
import { proximaSalida } from '@/datos/salidas';
import { espacios } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesViajar {
  alAbrirAjustes?: () => void;
  alAbrirAvisos?: () => void;
  alAbrirViaje: (viajeId: string) => void;
  alElegirAsiento: (viajeId: string) => void;
}

const ESTADOS_PENDIENTES = ['abordando', 'atrasado', 'programado'];

/** inicio: el próximo viaje con el bus y las salidas de hoy */
export function Viajar({
  alAbrirAjustes,
  alAbrirAvisos,
  alAbrirViaje,
  alElegirAsiento,
}: PropiedadesViajar) {
  const { colores } = useTema();
  const { perfil } = usePerfil();
  const [origenId, establecerOrigenId] = useState('ter_may');
  const { ahora, datos, salidas } = useSalidas(origenId);
  const { noLeidos } = useAvisos();
  const preferenciaUbicacion = usePreferenciaUbicacion();
  const ubicacionResuelta = useRef(false);
  const primerNombre = perfil.nombre.trim().split(/\s+/)[0] ?? '';
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

      {terminalOrigen ? (
        <View style={estilos.terminal}>
          <EnlaceTerminal terminal={terminalOrigen} />
        </View>
      ) : null}
    </MarcoPestana>
  );
}

const estilos = StyleSheet.create({
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
