import {
  cedulaOpcionalValida,
  correoOpcionalValido,
  digitosTelefonoNi,
  formatearTelefonoNi,
  nombrePersonaValido,
} from '@anden/dominio';
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

import { Avatar } from '@/componentes/Avatar';
import { Bloque } from '@/componentes/Bloque';
import { Boton } from '@/componentes/Boton';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { CampoTexto } from '@/componentes/CampoTexto';
import { elegirFotoDeGaleria } from '@/datos/fotos';
import { iniciales, nombreCompleto } from '@/datos/perfil';
import { usePerfil } from '@/datos/usePerfil';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesPerfilUsuario {
  alVolver: () => void;
}

/** foto, datos de contacto y pasajeros guardados; todo queda en el teléfono */
export function PerfilUsuario({ alVolver }: PropiedadesPerfilUsuario) {
  const { colores } = useTema();
  const { cargando } = usePerfil();
  // el formulario toma sus valores iniciales del perfil, así que espera a que termine de cargar
  if (cargando) {
    return (
      <View
        accessibilityRole="progressbar"
        style={[estilos.carga, { backgroundColor: colores.fondo }]}
      >
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('perfil.cargando')}
        </Text>
      </View>
    );
  }
  return <FormularioPerfil alVolver={alVolver} />;
}

function FormularioPerfil({ alVolver }: PropiedadesPerfilUsuario) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { agregarPasajero, guardar, perfil, quitarPasajero } = usePerfil();
  const [nombre, establecerNombre] = useState(perfil.nombre);
  const [apellido, establecerApellido] = useState(perfil.apellido);
  const [telefono, establecerTelefono] = useState(perfil.telefono);
  const [correo, establecerCorreo] = useState(perfil.correo);
  const [cedula, establecerCedula] = useState(perfil.cedula);
  const [nuevoPasajero, establecerNuevoPasajero] = useState('');
  const [sinPermiso, establecerSinPermiso] = useState(false);
  const [guardado, establecerGuardado] = useState(false);
  const [mostrarErrores, establecerMostrarErrores] = useState(false);

  const nombreMalo = nombre.trim() !== '' && !nombrePersonaValido(nombre);
  const apellidoMalo = apellido.trim() !== '' && !nombrePersonaValido(apellido);
  const telefonoMalo = telefono.trim() !== '' && !digitosTelefonoNi(telefono);
  const correoMalo = !correoOpcionalValido(correo);
  const cedulaMala = !cedulaOpcionalValida(cedula);
  const formularioMalo =
    nombreMalo || apellidoMalo || telefonoMalo || correoMalo || cedulaMala;

  function editar(cambiar: (valor: string) => void) {
    return (valor: string) => {
      establecerGuardado(false);
      cambiar(valor);
    };
  }

  async function elegirFoto() {
    const resultado = await elegirFotoDeGaleria();
    establecerSinPermiso(resultado.tipo === 'sin-permiso');
    if (resultado.tipo === 'elegida') {
      await guardar({ fotoUri: resultado.uri });
    }
  }

  async function guardarCambios() {
    establecerMostrarErrores(true);
    if (formularioMalo) return;
    await guardar({
      apellido: apellido.trim(),
      cedula: cedula.trim(),
      correo: correo.trim(),
      nombre: nombre.trim(),
      telefono: formatearTelefonoNi(telefono) ?? '',
    });
    establecerGuardado(true);
  }

  async function sumarPasajero() {
    establecerMostrarErrores(true);
    if (!nombrePersonaValido(nuevoPasajero)) return;
    await agregarPasajero({ nombre: nuevoPasajero.trim() });
    establecerNuevoPasajero('');
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[estilos.pantalla, { backgroundColor: colores.fondo }]}
    >
      <ScrollView
        contentContainerStyle={[
          estilos.contenido,
          { paddingBottom: 48, paddingTop: margenes.top + 8 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <CabeceraPantalla alVolver={alVolver} titulo={t('perfil.titulo')} />
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('perfil.detalle')}
        </Text>

        <View style={estilos.foto}>
          <Avatar
            descripcion={t('perfil.fotoDescripcion')}
            iniciales={iniciales({ apellido, nombre })}
            tamano={96}
            uri={perfil.fotoUri}
          />
          <View style={estilos.accionesFoto}>
            <Boton
              alPresionar={() => void elegirFoto()}
              etiqueta={t('perfil.cambiarFoto')}
            />
            {perfil.fotoUri !== null && (
              <Boton
                alPresionar={() => void guardar({ fotoUri: null })}
                etiqueta={t('perfil.quitarFoto')}
                variante="secundario"
              />
            )}
          </View>
        </View>
        {sinPermiso && (
          <Text
            accessibilityLiveRegion="polite"
            style={[tipografia.pequeno, { color: colores.cancelado }]}
          >
            {t('perfil.sinPermisoFoto')}
          </Text>
        )}

        <Bloque estiloContenido={estilos.bloque}>
          <CampoTexto
            alCambiar={editar(establecerNombre)}
            error={nombreMalo ? t('perfil.nombreInvalido') : undefined}
            etiqueta={t('perfil.nombre')}
            valor={nombre}
          />
          <CampoTexto
            alCambiar={editar(establecerApellido)}
            error={apellidoMalo ? t('perfil.apellidoInvalido') : undefined}
            etiqueta={t('perfil.apellido')}
            valor={apellido}
          />
          <CampoTexto
            alCambiar={editar(establecerTelefono)}
            error={telefonoMalo ? t('perfil.telefonoInvalido') : undefined}
            etiqueta={t('perfil.telefono')}
            marcador={t('perfil.marcadorTelefono')}
            teclado="phone-pad"
            valor={telefono}
          />
          <CampoTexto
            alCambiar={editar(establecerCorreo)}
            error={correoMalo ? t('perfil.correoInvalido') : undefined}
            etiqueta={t('perfil.correo')}
            marcador={t('perfil.marcadorCorreo')}
            teclado="email-address"
            valor={correo}
          />
          <CampoTexto
            alCambiar={editar(establecerCedula)}
            error={cedulaMala ? t('perfil.cedulaInvalida') : undefined}
            etiqueta={t('perfil.cedula')}
            marcador={t('pasajeros.marcadorCedula')}
            valor={cedula}
          />
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('perfil.avisoCedula')}
          </Text>
        </Bloque>

        <Bloque estiloContenido={estilos.bloque}>
          <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
            {t('perfil.pasajeros')}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('perfil.pasajerosDetalle')}
          </Text>
          {perfil.pasajeros.length === 0 && (
            <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
              {t('perfil.pasajerosVacio')}
            </Text>
          )}
          {perfil.pasajeros.map((pasajero) => (
            <View key={pasajero.id} style={estilos.filaPasajero}>
              <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
                {pasajero.nombre}
              </Text>
              <Pressable
                accessibilityLabel={`${t('perfil.quitarPasajero')} ${pasajero.nombre}`}
                accessibilityRole="button"
                onPress={() => void quitarPasajero(pasajero.id)}
                style={estilos.toque}
              >
                <Text
                  style={[tipografia.etiqueta, { color: colores.cancelado }]}
                >
                  {t('perfil.quitarPasajero')}
                </Text>
              </Pressable>
            </View>
          ))}
          <CampoTexto
            alCambiar={establecerNuevoPasajero}
            error={
              mostrarErrores &&
              nuevoPasajero !== '' &&
              !nombrePersonaValido(nuevoPasajero)
                ? t('perfil.nombrePasajeroInvalido')
                : undefined
            }
            etiqueta={t('perfil.nombrePasajero')}
            valor={nuevoPasajero}
          />
          <Boton
            alPresionar={() => void sumarPasajero()}
            etiqueta={t('perfil.agregarPasajero')}
            variante="secundario"
          />
        </Bloque>

        {guardado && (
          <Text
            accessibilityLiveRegion="polite"
            style={[tipografia.cuerpo, { color: colores.aTiempo }]}
          >
            {`${t('perfil.guardado')} · ${nombreCompleto({ apellido, nombre })}`}
          </Text>
        )}
        <View style={estilos.guardar}>
          <BotonAccion
            alPresionar={() => void guardarCambios()}
            deshabilitado={formularioMalo}
            etiqueta={t('perfil.guardar')}
            icono="confirmar"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  accionesFoto: { flex: 1, gap: espacios.ocho },
  bloque: { gap: espacios.dieciseis, padding: espacios.veinticuatro },
  carga: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: espacios.lateral,
  },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  filaPasajero: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  foto: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.veinticuatro,
  },
  guardar: { alignItems: 'flex-end' },
  pantalla: { flex: 1 },
  toque: { justifyContent: 'center', minHeight: 44, paddingHorizontal: 8 },
});
