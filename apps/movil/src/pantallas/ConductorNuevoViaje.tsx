import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { CampoTexto } from '@/componentes/CampoTexto';
import { ControlSegmentado } from '@/componentes/ControlSegmentado';
import { OpcionSeleccion } from '@/componentes/OpcionSeleccion';
import { SelectorDia } from '@/componentes/SelectorDia';
import { diasDeReserva, inicioDelDia } from '@/datos/dias';
import {
  armarFilaViaje,
  validarViaje,
  type BorradorViaje,
  type ErrorViaje,
} from '@/datos/nuevoViaje';
import { sincronizarViajes } from '@/datos/sincronizarViajes';
import { useSalidas } from '@/datos/useSalidas';
import { useSesion } from '@/datos/useSesion';
import { publicarViaje } from '@/servicios/supabase/viajesSupabase';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t, type RutaTexto } from '@/textos/t';

export interface PropiedadesConductorNuevoViaje {
  /** vuelve a la lista de viajes con el viaje ya publicado */
  alPublicar: () => void;
  alVolver: () => void;
}

const MENSAJES = {
  anden: 'nuevoViaje.errorAnden',
  hora: 'nuevoViaje.errorHora',
  pasado: 'nuevoViaje.errorPasado',
  placa: 'nuevoViaje.errorPlaca',
  ruta: 'nuevoViaje.errorRuta',
} as const satisfies Record<ErrorViaje, RutaTexto>;

/** el conductor publica un viaje: ruta, servicio, día, hora, placa y andén; los pasajeros lo ven al instante */
export function ConductorNuevoViaje({
  alPublicar,
  alVolver,
}: PropiedadesConductorNuevoViaje) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { sesion } = useSesion();
  const { ahora, datos } = useSalidas();
  const dias = useMemo(() => diasDeReserva(inicioDelDia(ahora)), [ahora]);
  const [borrador, establecerBorrador] = useState<BorradorViaje>({
    anden: '',
    dia: dias[0] ?? ahora,
    hora: '',
    placa: '',
    rutaId: null,
    servicio: 'ordinario',
  });
  const [intento, establecerIntento] = useState(false);
  const [publicando, establecerPublicando] = useState(false);
  const [errorServidor, establecerErrorServidor] = useState(false);

  const errores = validarViaje(borrador, ahora);
  const nombreTerminal = (id: string) =>
    datos.terminales.find((terminal) => terminal.id === id)?.ciudad ?? id;

  function cambiar(cambios: Partial<BorradorViaje>) {
    establecerBorrador((previo) => ({ ...previo, ...cambios }));
  }

  async function publicar() {
    establecerIntento(true);
    establecerErrorServidor(false);
    if (errores.length > 0 || !sesion?.choferId) return;
    const fila = armarFilaViaje(borrador, sesion.choferId, new Date());
    if (!fila) return;
    establecerPublicando(true);
    const resultado = await publicarViaje(fila);
    establecerPublicando(false);
    if (resultado !== 'ok') {
      establecerErrorServidor(true);
      return;
    }
    await sincronizarViajes();
    alPublicar();
  }

  const mensaje = (error: ErrorViaje) =>
    intento && errores.includes(error) ? t(MENSAJES[error]) : undefined;

  return (
    <KeyboardAvoidingView
      style={[estilos.pantalla, { backgroundColor: colores.fondo }]}
    >
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={[
          estilos.contenido,
          {
            paddingBottom: espacios.cuarentaYOcho,
            paddingTop: margenes.top + espacios.ocho,
          },
        ]}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
        <CabeceraPantalla alVolver={alVolver} titulo={t('nuevoViaje.titulo')} />
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('nuevoViaje.detalle')}
        </Text>

        <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
          {t('nuevoViaje.rutaSeccion')}
        </Text>
        {datos.rutas.map((ruta) => (
          <OpcionSeleccion
            alElegir={() => cambiar({ rutaId: ruta.id })}
            detalle={`${ruta.distanciaKm} km · ${ruta.duracionMin} min`}
            elegida={borrador.rutaId === ruta.id}
            key={ruta.id}
            nombre={`${nombreTerminal(ruta.origenId)} → ${nombreTerminal(ruta.destinoId)}`}
          />
        ))}
        {mensaje('ruta') && (
          <Text style={[tipografia.pequeno, { color: colores.cancelado }]}>
            {mensaje('ruta')}
          </Text>
        )}

        <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
          {t('nuevoViaje.servicioSeccion')}
        </Text>
        <ControlSegmentado
          alCambiar={(clave) =>
            cambiar({ servicio: clave as BorradorViaje['servicio'] })
          }
          opciones={[
            { clave: 'ordinario', etiqueta: t('servicios.ordinario') },
            { clave: 'expreso', etiqueta: t('servicios.expreso') },
          ]}
          valor={borrador.servicio}
        />

        <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
          {t('nuevoViaje.diaSeccion')}
        </Text>
        <SelectorDia
          ahora={ahora}
          alElegir={(dia) => cambiar({ dia })}
          dias={dias}
          seleccionado={borrador.dia}
        />

        <View style={estilos.campos}>
          <CampoTexto
            alCambiar={(hora) => cambiar({ hora })}
            error={mensaje('hora') ?? mensaje('pasado')}
            etiqueta={t('nuevoViaje.hora')}
            marcador={t('nuevoViaje.horaMarcador')}
            teclado="numbers-and-punctuation"
            valor={borrador.hora}
          />
          <CampoTexto
            alCambiar={(placa) => cambiar({ placa })}
            error={mensaje('placa')}
            etiqueta={t('nuevoViaje.placa')}
            marcador={t('nuevoViaje.placaMarcador')}
            valor={borrador.placa}
          />
          <CampoTexto
            alCambiar={(anden) => cambiar({ anden })}
            error={mensaje('anden')}
            etiqueta={t('nuevoViaje.anden')}
            marcador={t('nuevoViaje.andenMarcador')}
            teclado="number-pad"
            valor={borrador.anden}
          />
        </View>

        {errorServidor && (
          <Text
            accessibilityLiveRegion="polite"
            style={[tipografia.cuerpo, { color: colores.cancelado }]}
          >
            {t('nuevoViaje.errorServidor')}
          </Text>
        )}
        <BotonAccion
          alPresionar={() => void publicar()}
          cargando={publicando}
          etiqueta={
            publicando ? t('nuevoViaje.publicando') : t('nuevoViaje.publicar')
          }
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  campos: { gap: espacios.dieciseis },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  pantalla: { flex: 1 },
});
