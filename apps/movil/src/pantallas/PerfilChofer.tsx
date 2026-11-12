import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { OpinionesChofer } from '@/componentes/OpinionesChofer';
import { notaConOpiniones, type Opinion } from '@/datos/opiniones';
import { usePerfilChofer } from '@/datos/useDetalleViaje';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesPerfilChofer {
  alVolver: () => void;
  choferId: string;
}

function Cifra({
  etiqueta,
  icono,
  valor,
}: {
  etiqueta: string;
  icono?: boolean;
  valor: string;
}) {
  const { colores } = useTema();
  return (
    <Bloque estilo={estilos.cifra} estiloContenido={estilos.contenidoCifra}>
      <View style={estilos.valor}>
        {icono && <Icono nombre="estrella" tamano="mediano" />}
        <Text style={[tipografia.datoGrande, { color: colores.tinta }]}>
          {valor}
        </Text>
      </View>
      <Text
        style={[
          tipografia.pequeno,
          estilos.etiquetaCifra,
          { color: colores.tintaSuave },
        ]}
      >
        {etiqueta}
      </Text>
    </Bloque>
  );
}

/** quién maneja: años, viajes, licencia, calificación y lo que más dicen de su servicio */
export function PerfilChofer({ alVolver, choferId }: PropiedadesPerfilChofer) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const perfil = usePerfilChofer(choferId);
  const [propias, establecerPropias] = useState<Opinion[]>([]);

  if (!perfil) {
    return (
      <View
        style={[
          estilos.sinDatos,
          {
            backgroundColor: colores.fondo,
            paddingTop: margenes.top + espacios.ocho,
          },
        ]}
      >
        <CabeceraPantalla alVolver={alVolver} titulo={t('chofer.titulo')} />
        <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
          {t('chofer.noExiste')}
        </Text>
      </View>
    );
  }

  const nota = notaConOpiniones(
    { promedio: perfil.promedio, total: perfil.totalCalificaciones },
    propias,
  );

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: espacios.cuarentaYOcho,
          paddingTop: margenes.top + espacios.ocho,
        },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <CabeceraPantalla alVolver={alVolver} titulo={t('chofer.titulo')} />

      <Bloque estiloContenido={estilos.hero}>
        <Loseta tamano={96} variante="negra">
          <Text style={[tipografia.iniciales, { color: colores.sobreNegro }]}>
            {perfil.iniciales}
          </Text>
        </Loseta>
        <Text
          accessibilityRole="header"
          style={[
            tipografia.nombrePerfil,
            estilos.nombre,
            { color: colores.tinta },
          ]}
        >
          {perfil.nombre}
        </Text>
        <View style={estilos.licencia}>
          <Icono
            nombre="confirmar"
            color={
              perfil.licenciaVerificada ? colores.aTiempo : colores.tintaSuave
            }
            tamano="mediano"
          />
          <Text
            style={[
              tipografia.pequeno,
              {
                color: perfil.licenciaVerificada
                  ? colores.aTiempo
                  : colores.tintaSuave,
              },
            ]}
          >
            {perfil.licenciaVerificada
              ? t('detalle.licenciaVerificada')
              : t('detalle.licenciaSinVerificar')}
          </Text>
        </View>
      </Bloque>

      <View style={estilos.cifras}>
        <Cifra
          etiqueta={t('chofer.anios')}
          valor={String(perfil.aniosManejando)}
        />
        <Cifra
          etiqueta={t('chofer.viajes')}
          valor={String(perfil.viajesRealizados)}
        />
        <Cifra
          etiqueta={t('chofer.calificacion')}
          icono={nota.promedio !== null}
          valor={nota.promedio === null ? '—' : String(nota.promedio)}
        />
      </View>

      <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
        {t('chofer.loQueDicen')}
      </Text>
      {perfil.promedio === null ? (
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('chofer.sinOpiniones')}
        </Text>
      ) : (
        perfil.etiquetas.map(({ cantidad, etiqueta }) => (
          <Bloque
            estiloContenido={estilos.etiqueta}
            hundido
            key={etiqueta}
            radio="loseta"
          >
            <Text style={[tipografia.nombreLinea, { color: colores.tinta }]}>
              {t(`chofer.etiquetas.${etiqueta}`)}
            </Text>
            <Text style={[tipografia.dato, { color: colores.ambarTexto }]}>
              {`${cantidad} de ${perfil.totalCalificaciones}`}
            </Text>
          </Bloque>
        ))
      )}
      <OpinionesChofer alActualizar={establecerPropias} choferId={choferId} />
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {t('chofer.nota')}
      </Text>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  sinDatos: {
    flex: 1,
    gap: espacios.dieciseis,
    paddingHorizontal: espacios.lateral,
  },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  contenidoCifra: { alignItems: 'center', gap: 4, padding: espacios.doce },
  cifra: { flex: 1 },
  cifras: { flexDirection: 'row', gap: espacios.doce },
  etiqueta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: espacios.dieciseis,
  },
  etiquetaCifra: { textAlign: 'center' },
  hero: {
    alignItems: 'center',
    gap: espacios.doce,
    padding: espacios.veinticuatro,
  },
  licencia: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  nombre: { textAlign: 'center' },
  valor: { alignItems: 'center', flexDirection: 'row', gap: 6 },
});
