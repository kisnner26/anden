import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { CampoTexto } from '@/componentes/CampoTexto';
import { useSesion } from '@/datos/useSesion';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesIngresar {
  /** la sesión de conductor quedó iniciada */
  alIngresar: () => void;
  alVolver: () => void;
}

/** el login de los choferes; el pasajero no lo necesita y sigue usando la app sin cuenta */
export function Ingresar({ alIngresar, alVolver }: PropiedadesIngresar) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { iniciarComoConductor } = useSesion();
  const [codigo, establecerCodigo] = useState('');
  const [clave, establecerClave] = useState('');
  const [error, establecerError] = useState(false);
  const [ingresando, establecerIngresando] = useState(false);

  async function entrar() {
    establecerIngresando(true);
    establecerError(false);
    const resultado = await iniciarComoConductor(codigo, clave);
    establecerIngresando(false);
    if (resultado.ok) alIngresar();
    else establecerError(true);
  }

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: espacios.cuarentaYOcho,
          paddingTop: margenes.top + espacios.ocho,
        },
      ]}
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colores.fondo }}
    >
      <CabeceraPantalla alVolver={alVolver} titulo={t('ingresar.titulo')} />
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('ingresar.detalle')}
      </Text>

      <Bloque estiloContenido={estilos.formulario}>
        <CampoTexto
          alCambiar={(valor) => {
            establecerCodigo(valor);
            establecerError(false);
          }}
          etiqueta={t('ingresar.codigo')}
          teclado="number-pad"
          valor={codigo}
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
          deshabilitado={codigo.trim() === '' || clave === ''}
          etiqueta={t('ingresar.entrar')}
        />
      </Bloque>

      <Bloque estiloContenido={estilos.prueba} hundido radio="loseta">
        <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
          {t('ingresar.pruebaTitulo')}
        </Text>
        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {t('ingresar.pruebaDetalle')}
        </Text>
      </Bloque>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  formulario: { gap: espacios.dieciseis, padding: espacios.veinticuatro },
  prueba: { gap: espacios.cuatro, padding: espacios.dieciseis },
});
