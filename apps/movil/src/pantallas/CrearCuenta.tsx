import {
  formatearTelefonoNi,
  nombrePersonaValido,
  telefonoNiValido,
} from '@anden/dominio';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
import { Interruptor } from '@/componentes/Interruptor';
import { useBloqueo } from '@/datos/useBloqueo';
import { leerEdad } from '@/datos/perfil';
import { usePerfil } from '@/datos/usePerfil';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesCrearCuenta {
  alTerminar: () => void;
}

const ANCHO_BUS = 180;

/** crear la cuenta local: nombre, teléfono y, si el teléfono puede, el bloqueo con Face ID */
export function CrearCuenta({ alTerminar }: PropiedadesCrearCuenta) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { guardar } = usePerfil();
  const { activar, biometria } = useBloqueo();
  const [nombre, establecerNombre] = useState('');
  const [apellido, establecerApellido] = useState('');
  const [telefono, establecerTelefono] = useState('');
  const [edad, establecerEdad] = useState('');
  const [proteger, establecerProteger] = useState(false);
  const [validar, establecerValidar] = useState(false);

  const nombreOk = nombrePersonaValido(nombre);
  const apellidoOk = nombrePersonaValido(apellido);
  const telefonoOk = telefonoNiValido(telefono);
  const edadLeida = leerEdad(edad);

  async function crear() {
    establecerValidar(true);
    if (!nombreOk || !apellidoOk || !telefonoOk || !edadLeida.valida) return;
    await guardar({
      apellido: apellido.trim(),
      edad: edadLeida.valor,
      nombre: nombre.trim(),
      telefono: formatearTelefonoNi(telefono) ?? telefono.trim(),
    });
    if (proteger) await activar();
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => undefined);
    alTerminar();
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
            alCambiar={establecerTelefono}
            error={
              validar && !telefonoOk ? t('cuenta.telefonoInvalido') : undefined
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

        <View style={estilos.boton}>
          <BotonAccion
            alPresionar={() => void crear()}
            etiqueta={t('cuenta.crear')}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={alTerminar}
          style={estilos.omitir}
        >
          <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
            {t('cuenta.omitir')}
          </Text>
        </Pressable>
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
