import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Chip } from '@/componentes/Chip';
import { CORREDORES_INICIALES } from '@/datos/corredores';
import {
  erroresDeEncomienda,
  guardarEncomienda,
  leerEncomiendas,
  nuevaEncomienda,
  TAMANOS,
  type Encomienda,
  type ErrorEncomienda,
  type TamanoEncomienda,
} from '@/datos/encomiendas';
import { nombrePropio } from '@/datos/perfil';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesEncomiendas {
  alVolver: () => void;
}

const MENSAJES: Record<ErrorEncomienda, () => string> = {
  descripcion: () => t('encomiendas.errorDescripcion'),
  destinatario: () => t('encomiendas.errorDestinatario'),
  remitente: () => t('encomiendas.errorRemitente'),
  telefono: () => t('encomiendas.errorTelefono'),
};

/** pedir que un paquete viaje en el bus; por ahora queda como solicitud guardada en el teléfono */
export function Encomiendas({ alVolver }: PropiedadesEncomiendas) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const [corredorId, establecerCorredorId] = useState<string>(
    CORREDORES_INICIALES[0]?.id ?? '',
  );
  const [remitente, establecerRemitente] = useState('');
  const [destinatario, establecerDestinatario] = useState('');
  const [telefono, establecerTelefono] = useState('');
  const [descripcion, establecerDescripcion] = useState('');
  const [tamano, establecerTamano] = useState<TamanoEncomienda>('pequeno');
  const [errores, establecerErrores] = useState<ErrorEncomienda[]>([]);
  const [solicitudes, establecerSolicitudes] = useState<Encomienda[]>([]);
  const corredor = CORREDORES_INICIALES.find((c) => c.id === corredorId);

  useEffect(() => {
    void leerEncomiendas().then(establecerSolicitudes);
  }, []);

  async function solicitar() {
    if (!corredor) return;
    const datos = {
      descripcion,
      destinatario,
      destino: corredor.destino,
      origen: corredor.origen,
      remitente,
      tamano,
      telefonoDestinatario: telefono,
    };
    const fallos = erroresDeEncomienda(datos);
    establecerErrores(fallos);
    if (fallos.length > 0) return;
    establecerSolicitudes(await guardarEncomienda(nuevaEncomienda(datos)));
    establecerRemitente('');
    establecerDestinatario('');
    establecerTelefono('');
    establecerDescripcion('');
  }

  const error = (campo: ErrorEncomienda) =>
    errores.includes(campo) ? MENSAJES[campo]() : undefined;

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
      <CabeceraPantalla alVolver={alVolver} titulo={t('encomiendas.titulo')} />
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('encomiendas.detalle')}
      </Text>

      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('encomiendas.trayecto')}
      </Text>
      <View style={estilos.chips}>
        {CORREDORES_INICIALES.map((candidato) => (
          <Chip
            alCambiar={() => establecerCorredorId(candidato.id)}
            etiqueta={`${candidato.origen} → ${candidato.destino}`}
            key={candidato.id}
            seleccionado={candidato.id === corredorId}
          />
        ))}
      </View>

      <Bloque estiloContenido={estilos.formulario}>
        <CampoTexto
          alCambiar={establecerRemitente}
          error={error('remitente')}
          etiqueta={t('encomiendas.remitente')}
          valor={remitente}
        />
        <CampoTexto
          alCambiar={establecerDestinatario}
          error={error('destinatario')}
          etiqueta={t('encomiendas.destinatario')}
          valor={destinatario}
        />
        <CampoTexto
          alCambiar={establecerTelefono}
          error={error('telefono')}
          etiqueta={t('encomiendas.telefono')}
          teclado="phone-pad"
          valor={telefono}
        />
        <CampoTexto
          alCambiar={establecerDescripcion}
          error={error('descripcion')}
          etiqueta={t('encomiendas.descripcion')}
          marcador={t('encomiendas.marcadorDescripcion')}
          valor={descripcion}
        />
        <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
          {t('encomiendas.tamano')}
        </Text>
        <View style={estilos.chips}>
          {TAMANOS.map((opcion) => (
            <Chip
              alCambiar={() => establecerTamano(opcion)}
              etiqueta={t(`encomiendas.${opcion}`)}
              key={opcion}
              seleccionado={opcion === tamano}
            />
          ))}
        </View>
        <BotonAccion
          alPresionar={() => void solicitar()}
          etiqueta={t('encomiendas.solicitar')}
          icono="boleto"
        />
      </Bloque>
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {t('encomiendas.nota')}
      </Text>

      {solicitudes.length > 0 && (
        <View style={estilos.lista}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {t('encomiendas.solicitadas')}
          </Text>
          {solicitudes.map((solicitud) => (
            <Bloque
              estiloContenido={estilos.solicitud}
              hundido
              key={solicitud.id}
              radio="loseta"
            >
              <Text style={[tipografia.dato, { color: colores.tinta }]}>
                {solicitud.codigo}
              </Text>
              <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
                {`${solicitud.origen} → ${solicitud.destino} · ${t(`encomiendas.${solicitud.tamano}`)}`}
              </Text>
              <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
                {`${solicitud.descripcion} · ${nombrePropio(solicitud.destinatario)}`}
              </Text>
              <Text
                style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
              >
                {t('encomiendas.estadoSolicitada')}
              </Text>
            </Bloque>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  formulario: { gap: espacios.dieciseis, padding: espacios.veinticuatro },
  lista: { gap: espacios.doce },
  solicitud: { gap: espacios.cuatro, padding: espacios.dieciseis },
});
