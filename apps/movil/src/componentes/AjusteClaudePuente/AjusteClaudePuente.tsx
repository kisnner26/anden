import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import {
  borrarPuente,
  codigoDelPuente,
  guardarPuente,
  leerPuente,
  probarPuente,
  urlDelPuente,
} from '@/servicios/puenteClaude';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

type Estado =
  'conectado' | 'desconectado' | 'datos-mal' | 'no-responde' | 'probando';

/** conecta la app con Claude Code de tu Mac: la dirección y el código que muestra el puente, guardados en el llavero */
export function AjusteClaudePuente() {
  const { colores } = useTema();
  const [url, establecerUrl] = useState('');
  const [codigo, establecerCodigo] = useState('');
  const [estado, establecerEstado] = useState<Estado>('desconectado');

  useEffect(() => {
    let vigente = true;
    void leerPuente().then((puente) => {
      if (!vigente || !puente) return;
      establecerUrl(puente.url);
      establecerEstado('conectado');
    });
    return () => {
      vigente = false;
    };
  }, []);

  async function conectar() {
    const direccion = urlDelPuente(url);
    const clave = codigoDelPuente(codigo);
    if (!direccion || !clave) {
      establecerEstado('datos-mal');
      return;
    }
    establecerEstado('probando');
    const puente = { codigo: clave, url: direccion };
    if (!(await probarPuente(puente))) {
      establecerEstado('no-responde');
      return;
    }
    await guardarPuente(puente);
    establecerUrl(direccion);
    establecerCodigo('');
    establecerEstado('conectado');
  }

  async function desconectar() {
    await borrarPuente();
    establecerUrl('');
    establecerCodigo('');
    establecerEstado('desconectado');
  }

  const conectado = estado === 'conectado';
  const campo = [
    estilos.campo,
    {
      backgroundColor: colores.superficie,
      borderColor: colores.linea,
      color: colores.tinta,
    },
  ];
  return (
    <Bloque estiloContenido={estilos.contenido}>
      <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
        {t('claudePuente.titulo')}
      </Text>
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {t('claudePuente.detalle')}
      </Text>
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {t('claudePuente.pasos')}
      </Text>
      {conectado ? (
        <View style={estilos.fila}>
          <Text style={[tipografia.cuerpo, { color: colores.aTiempo }]}>
            {t('claudePuente.conectado')}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void desconectar()}
          >
            <Text style={[tipografia.subtitulo, { color: colores.cancelado }]}>
              {t('claudePuente.desconectar')}
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <TextInput
            accessibilityLabel={t('claudePuente.direccion')}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            onChangeText={establecerUrl}
            placeholder={t('claudePuente.ejemploDireccion')}
            placeholderTextColor={colores.tintaSuave}
            style={campo}
            value={url}
          />
          <TextInput
            accessibilityLabel={t('claudePuente.codigo')}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={establecerCodigo}
            placeholder={t('claudePuente.codigo')}
            placeholderTextColor={colores.tintaSuave}
            secureTextEntry
            style={campo}
            value={codigo}
          />
          <Pressable
            accessibilityRole="button"
            disabled={estado === 'probando'}
            onPress={() => void conectar()}
            style={[estilos.boton, { backgroundColor: colores.ambar }]}
          >
            <Text style={[tipografia.subtitulo, { color: colores.sobreAmbar }]}>
              {t('claudePuente.conectar')}
            </Text>
          </Pressable>
          {estado === 'datos-mal' ? (
            <Text style={[tipografia.pequeno, { color: colores.cancelado }]}>
              {t('claudePuente.datosMal')}
            </Text>
          ) : null}
          {estado === 'no-responde' ? (
            <Text style={[tipografia.pequeno, { color: colores.cancelado }]}>
              {t('claudePuente.noResponde')}
            </Text>
          ) : null}
        </>
      )}
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  boton: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: espacios.veinticuatro,
  },
  campo: {
    borderRadius: radios.loseta,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: espacios.dieciseis,
  },
  contenido: { gap: espacios.doce, padding: espacios.dieciseis },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
