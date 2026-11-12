import { useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Autobus } from '@/componentes/Autobus';
import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CampoTexto } from '@/componentes/CampoTexto';
import { useSesion } from '@/datos/useSesion';
import type { Rol } from '@/servicios/sesion';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesIngresar {
  /** crea una cuenta nueva de pasajero */
  alCrearCuenta?: () => void;
  /** la sesión quedó iniciada; el rol lo decidió la cuenta, no quien entró */
  alIngresar: (rol: Rol) => void;
  /** seguir sin cuenta */
  alInvitado?: () => void;
}

/**
 * el ingreso de todas las personas: no pregunta quién es ni con qué rol entra. Con el correo, el
 * teléfono o el código y la contraseña, la cuenta dice si es pasajero o conductor.
 */
export function Ingresar({
  alCrearCuenta,
  alIngresar,
  alInvitado,
}: PropiedadesIngresar) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { iniciar } = useSesion();
  const [identificador, establecerIdentificador] = useState('');
  const [clave, establecerClave] = useState('');
  const [error, establecerError] = useState(false);
  const [ingresando, establecerIngresando] = useState(false);

  async function entrar() {
    establecerIngresando(true);
    establecerError(false);
    const resultado = await iniciar(identificador, clave);
    establecerIngresando(false);
    if (resultado.ok) alIngresar(resultado.valor.rol);
    else establecerError(true);
  }

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: espacios.cuarentaYOcho,
          paddingTop: margenes.top + espacios.veinticuatro,
        },
      ]}
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colores.fondo }}
    >
      {/* tocar fuera de los campos cierra el teclado, que a veces no tiene tecla para cerrarse */}
      <Pressable
        accessible={false}
        onPress={Keyboard.dismiss}
        style={estilos.envoltura}
        testID="ingresar-envoltura"
      >
        <Autobus ancho={tamanosControl.toqueMinimo * 3} />
        <Text
          accessibilityRole="header"
          style={[tipografia.titularPantalla, { color: colores.tinta }]}
        >
          {t('ingresar.titulo')}.
        </Text>
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('ingresar.detalle')}
        </Text>

        <Bloque estiloContenido={estilos.formulario}>
          <CampoTexto
            alCambiar={(valor) => {
              establecerIdentificador(valor);
              establecerError(false);
            }}
            etiqueta={t('ingresar.identificador')}
            valor={identificador}
          />
          <CampoTexto
            alCambiar={(valor) => {
              establecerClave(valor);
              establecerError(false);
            }}
            error={error ? t('ingresar.error') : undefined}
            etiqueta={t('ingresar.clave')}
            oculto
            valor={clave}
          />
          <BotonAccion
            alPresionar={() => void entrar()}
            cargando={ingresando}
            deshabilitado={identificador.trim() === '' || clave === ''}
            etiqueta={t('ingresar.entrar')}
          />
        </Bloque>

        {alCrearCuenta && (
          <Pressable
            accessibilityRole="button"
            onPress={alCrearCuenta}
            style={estilos.enlace}
          >
            <Text style={[tipografia.subtitulo, { color: colores.ambarTexto }]}>
              {t('ingresar.crear')}
            </Text>
          </Pressable>
        )}
        {alInvitado && (
          <Pressable
            accessibilityRole="button"
            onPress={alInvitado}
            style={estilos.enlace}
          >
            <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
              {t('ingresar.invitado')}
            </Text>
          </Pressable>
        )}

        <Bloque estiloContenido={estilos.prueba} hundido radio="loseta">
          <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
            {t('ingresar.pruebaTitulo')}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('ingresar.pruebaDetalle')}
          </Text>
        </Bloque>
      </Pressable>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { paddingHorizontal: espacios.lateral },
  enlace: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
  },
  envoltura: { gap: espacios.dieciseis },
  formulario: { gap: espacios.dieciseis, padding: espacios.veinticuatro },
  prueba: { gap: espacios.cuatro, padding: espacios.dieciseis },
});
