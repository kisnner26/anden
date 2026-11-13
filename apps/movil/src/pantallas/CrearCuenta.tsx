import {
  claveValida,
  formatearTelefonoNi,
  nombrePersonaValido,
  telefonoNiValido,
  usuarioValido,
} from '@anden/dominio';
import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Autobus } from '@/componentes/Autobus';
import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CampoTexto } from '@/componentes/CampoTexto';
import { CuentaCreada } from '@/componentes/CuentaCreada';
import { Interruptor } from '@/componentes/Interruptor';
import { useBloqueo } from '@/datos/useBloqueo';
import { leerEdad } from '@/datos/perfil';
import { usePerfil } from '@/datos/usePerfil';
import { useSesion } from '@/datos/useSesion';
import type { ErrorRegistro } from '@/servicios/sesion';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesCrearCuenta {
  alTerminar: () => void;
  /** abre el registro de conductor, que pide cédula y confirmación biométrica */
  alRegistrarConductor?: () => void;
}

const ANCHO_BUS = 180;

/** crear la cuenta local: nombre, teléfono y, si el teléfono puede, el bloqueo con Face ID */
export function CrearCuenta({
  alRegistrarConductor,
  alTerminar,
}: PropiedadesCrearCuenta) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { guardar } = usePerfil();
  const { activar, biometria } = useBloqueo();
  const { registrar } = useSesion();
  const [nombre, establecerNombre] = useState('');
  const [apellido, establecerApellido] = useState('');
  const [telefono, establecerTelefono] = useState('');
  const [edad, establecerEdad] = useState('');
  const [proteger, establecerProteger] = useState(false);
  const [usuario, establecerUsuario] = useState('');
  const [clave, establecerClave] = useState('');
  const [repetida, establecerRepetida] = useState('');
  const [validar, establecerValidar] = useState(false);
  const [creando, establecerCreando] = useState(false);
  const [falla, establecerFalla] = useState<ErrorRegistro | null>(null);
  const [bienvenida, establecerBienvenida] = useState(false);
  const terminar = useCallback(() => alTerminar(), [alTerminar]);

  const nombreOk = nombrePersonaValido(nombre);
  const apellidoOk = nombrePersonaValido(apellido);
  const telefonoOk = telefonoNiValido(telefono);
  const usuarioOk = usuarioValido(usuario);
  const claveOk = claveValida(clave);
  const repetidaOk = clave === repetida;
  const edadLeida = leerEdad(edad);

  async function crear() {
    establecerValidar(true);
    establecerFalla(null);
    if (
      !nombreOk ||
      !apellidoOk ||
      !telefonoOk ||
      !edadLeida.valida ||
      !usuarioOk ||
      !claveOk ||
      !repetidaOk
    ) {
      return;
    }
    establecerCreando(true);
    const cuenta = await registrar({
      apellido,
      clave,
      nombre,
      telefono,
      usuario,
    });
    establecerCreando(false);
    if (!cuenta.ok) {
      establecerFalla(cuenta.error);
      return;
    }
    await guardar(
      {
        apellido: apellido.trim(),
        edad: edadLeida.valor,
        nombre: nombre.trim(),
        telefono: formatearTelefonoNi(telefono) ?? telefono.trim(),
      },
      cuenta.valor,
    );
    if (proteger) await activar();
    establecerBienvenida(true);
  }

  if (bienvenida) {
    return <CuentaCreada alTerminar={terminar} nombre={nombre.trim()} />;
  }

  return (
    <KeyboardAvoidingView
      style={[estilos.pantalla, { backgroundColor: colores.fondo }]}
    >
      <ScrollView
        contentContainerStyle={[
          estilos.contenido,
          {
            paddingBottom: margenes.bottom + espacios.cuarentaYOcho,
            paddingTop: margenes.top + espacios.veinticuatro,
          },
        ]}
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
        <View style={estilos.bus}>
          <Autobus ancho={ANCHO_BUS} letrero="ANDÉN" />
        </View>
        <Text style={[tipografia.display, { color: colores.tinta }]}>
          {t('cuenta.titulo')}.
        </Text>
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('cuenta.detalle')}
        </Text>

        <Bloque estiloContenido={estilos.formulario}>
          <CampoTexto
            alCambiar={establecerNombre}
            error={
              validar && !nombreOk ? t('cuenta.nombreInvalido') : undefined
            }
            etiqueta={t('cuenta.nombre')}
            marcador={t('cuenta.marcadorNombre')}
            valor={nombre}
          />
          <CampoTexto
            alCambiar={establecerApellido}
            error={
              validar && !apellidoOk ? t('cuenta.apellidoInvalido') : undefined
            }
            etiqueta={t('cuenta.apellido')}
            marcador={t('cuenta.marcadorApellido')}
            valor={apellido}
          />
          <CampoTexto
            alCambiar={(valor) => {
              establecerUsuario(valor);
              establecerFalla(null);
            }}
            error={
              validar && !usuarioOk
                ? t('cuenta.usuarioInvalido')
                : falla === 'usuario-tomado'
                  ? t('cuenta.usuarioTomado')
                  : undefined
            }
            etiqueta={t('cuenta.usuario')}
            marcador={t('cuenta.marcadorUsuario')}
            valor={usuario}
          />
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('cuenta.usuarioAyuda')}
          </Text>
          <CampoTexto
            alCambiar={(valor) => {
              establecerTelefono(valor);
              establecerFalla(null);
            }}
            error={
              validar && !telefonoOk
                ? t('cuenta.telefonoInvalido')
                : falla === 'telefono-tomado'
                  ? t('cuenta.telefonoTomado')
                  : undefined
            }
            etiqueta={t('cuenta.telefono')}
            marcador={t('cuenta.marcadorTelefono')}
            teclado="phone-pad"
            valor={telefono}
          />
          <CampoTexto
            alCambiar={establecerEdad}
            error={
              validar && !edadLeida.valida
                ? t('cuenta.edadInvalida')
                : undefined
            }
            etiqueta={t('cuenta.edad')}
            marcador={t('cuenta.marcadorEdad')}
            teclado="number-pad"
            valor={edad}
          />
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('cuenta.edadAyuda')}
          </Text>
          <CampoTexto
            alCambiar={establecerClave}
            error={validar && !claveOk ? t('cuenta.claveInvalida') : undefined}
            etiqueta={t('cuenta.clave')}
            oculto
            valor={clave}
          />
          <CampoTexto
            alCambiar={establecerRepetida}
            error={
              validar && claveOk && !repetidaOk
                ? t('cuenta.clavesDistintas')
                : undefined
            }
            etiqueta={t('cuenta.confirmarClave')}
            oculto
            valor={repetida}
          />
        </Bloque>

        {biometria.disponible && (
          <Bloque estiloContenido={estilos.fila}>
            <Text
              style={[
                tipografia.subtitulo,
                estilos.texto,
                { color: colores.tinta },
              ]}
            >
              {t('cuenta.bloqueo')}
            </Text>
            <Interruptor
              activo={proteger}
              alCambiar={establecerProteger}
              etiqueta={t('cuenta.bloqueo')}
            />
          </Bloque>
        )}

        {(falla === 'conexion' || falla === 'confirmacion-pendiente') && (
          <Text
            accessibilityLiveRegion="polite"
            style={[tipografia.cuerpo, { color: colores.cancelado }]}
          >
            {falla === 'conexion'
              ? t('cuenta.sinConexion')
              : t('cuenta.confirmacionPendiente')}
          </Text>
        )}
        <View style={estilos.boton}>
          <BotonAccion
            alPresionar={() => void crear()}
            cargando={creando}
            etiqueta={t('cuenta.crear')}
          />
        </View>
        {alRegistrarConductor && (
          <Pressable
            accessibilityRole="button"
            onPress={alRegistrarConductor}
            style={estilos.omitir}
          >
            <Text style={[tipografia.subtitulo, { color: colores.ambarTexto }]}>
              {t('registroConductor.entrada')}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  boton: { alignItems: 'flex-end' },
  bus: { alignItems: 'center' },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
    padding: espacios.dieciseis,
  },
  formulario: { gap: espacios.dieciseis, padding: espacios.veinticuatro },
  omitir: { alignItems: 'center', paddingVertical: espacios.doce },
  pantalla: { flex: 1 },
  texto: { flex: 1 },
});
