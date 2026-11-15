import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CampoTexto } from '@/componentes/CampoTexto';
import { Hoja } from '@/componentes/Hoja';
import { tomarFotoDeObjeto } from '@/datos/fotos';
import { reportarObjeto } from '@/servicios/supabase/objetosPerdidosSupabase';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesReportarObjeto {
  abierta: boolean;
  alCerrar: () => void;
  viajeId: string;
}

/** el chofer reporta algo que quedó en el bus: una foto con la cámara y unas palabras; quien viajó lo ve en su boleto */
export function ReportarObjeto({
  abierta,
  alCerrar,
  viajeId,
}: PropiedadesReportarObjeto) {
  const { colores } = useTema();
  const [descripcion, establecerDescripcion] = useState('');
  const [foto, establecerFoto] = useState<string | null>(null);
  const [estado, establecerEstado] = useState<
    'enviando' | 'fallo' | 'listo' | 'sin-permiso' | null
  >(null);

  async function sacarFoto() {
    establecerEstado(null);
    const resultado = await tomarFotoDeObjeto();
    if (resultado.tipo === 'elegida') establecerFoto(resultado.uri);
    else if (resultado.tipo === 'sin-permiso') establecerEstado('sin-permiso');
  }

  async function enviar() {
    const texto = descripcion.trim();
    if (texto === '' || estado === 'enviando') return;
    establecerEstado('enviando');
    const bien = await reportarObjeto(viajeId, texto.slice(0, 120), foto);
    if (bien) {
      establecerEstado('listo');
      establecerDescripcion('');
      establecerFoto(null);
    } else {
      establecerEstado('fallo');
    }
  }

  function cerrar() {
    establecerEstado(null);
    alCerrar();
  }

  return (
    <Hoja
      abierta={abierta}
      alCerrar={cerrar}
      etiquetaCerrar={t('objetosEncontrados.cerrar')}
    >
      <View style={estilos.contenido} testID="reportar-objeto">
        <Text style={[tipografia.titulo, { color: colores.tinta }]}>
          {t('objetosEncontrados.titulo')}
        </Text>
        {foto ? (
          <Image
            accessibilityLabel={t('objetosEncontrados.fotoTomada')}
            contentFit="cover"
            source={{ uri: foto }}
            style={estilos.foto}
          />
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => void sacarFoto()}
          style={[estilos.boton, { borderColor: conAlfa(colores.tinta, 0.2) }]}
        >
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {foto
              ? t('objetosEncontrados.otraFoto')
              : t('objetosEncontrados.tomarFoto')}
          </Text>
        </Pressable>
        <CampoTexto
          alCambiar={establecerDescripcion}
          etiqueta={t('objetosEncontrados.queEs')}
          marcador={t('objetosEncontrados.ejemplo')}
          valor={descripcion}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: descripcion.trim() === '' }}
          disabled={descripcion.trim() === ''}
          onPress={() => void enviar()}
          style={[
            estilos.boton,
            {
              backgroundColor: colores.ambar,
              opacity: descripcion.trim() === '' ? 0.5 : 1,
            },
          ]}
        >
          <Text style={[tipografia.subtitulo, { color: colores.bloqueNegro }]}>
            {estado === 'enviando'
              ? t('objetosEncontrados.enviando')
              : t('objetosEncontrados.avisar')}
          </Text>
        </Pressable>
        {estado === 'listo' ? (
          <Text style={[tipografia.pequeno, { color: colores.aTiempo }]}>
            {t('objetosEncontrados.listo')}
          </Text>
        ) : null}
        {estado === 'fallo' ? (
          <Text style={[tipografia.pequeno, { color: colores.cancelado }]}>
            {t('objetosEncontrados.fallo')}
          </Text>
        ) : null}
        {estado === 'sin-permiso' ? (
          <Text style={[tipografia.pequeno, { color: colores.cancelado }]}>
            {t('objetosEncontrados.sinPermiso')}
          </Text>
        ) : null}
      </View>
    </Hoja>
  );
}

const estilos = StyleSheet.create({
  boton: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: espacios.dieciseis,
  },
  contenido: { gap: espacios.doce, paddingBottom: espacios.dieciseis },
  foto: { borderRadius: radios.tarjeta, height: 180, width: '100%' },
});
