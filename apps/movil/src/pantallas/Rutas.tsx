import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { EscenaViaje } from '@/componentes/EscenaViaje';
import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { MarcoPestana } from '@/componentes/MarcoPestana';
import { PanelCorredor } from '@/componentes/PanelCorredor';
import { RedRutas } from '@/componentes/RedRutas';
import type { CorredorInterlocal } from '@/datos/corredores';
import { useSonidos } from '@/datos/useSonidos';
import {
  corredorDe,
  invertirSentido,
  type SeleccionRed,
} from '@/datos/redRutas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesRutas {
  alAbrirRuta?: (id: string) => void;
  /** abre la solicitud de una encomienda */
  alAbrirEncomiendas?: () => void;
}

/**
 * la red de rutas: un mapa simbólico con Managua al centro y las dos ciudades a los lados, y debajo
 * el corredor elegido en un panel simétrico que se abre deslizando
 */
export function Rutas({ alAbrirEncomiendas, alAbrirRuta }: PropiedadesRutas) {
  const { colores } = useTema();
  const { width } = useWindowDimensions();
  const [seleccion, establecerSeleccion] = useState<SeleccionRed>({
    ciudad: 'Boaco',
    sentido: 'vuelta',
  });
  const [abriendo, establecerAbriendo] = useState<CorredorInterlocal | null>(
    null,
  );
  const sonar = useSonidos();
  const corredor = corredorDe(seleccion);
  // ancho útil dentro de la tarjeta: pantalla menos márgenes laterales y relleno de la tarjeta
  const anchoControl =
    Math.min(width, 520) - 2 * espacios.lateral - 2 * espacios.lateral;

  return (
    <View style={estilos.raiz}>
      <MarcoPestana estiloContenido={estilos.contenido}>
        <View style={estilos.titular}>
          <Text style={[tipografia.display, { color: colores.tinta }]}>
            {t('rutas.titulo')}.
          </Text>
          <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
            {t('rutas.detalle')}
          </Text>
        </View>

        <RedRutas
          alElegirCiudad={(ciudad) =>
            establecerSeleccion((actual) => ({ ...actual, ciudad }))
          }
          alInvertir={() => establecerSeleccion(invertirSentido)}
          seleccion={seleccion}
        />

        <PanelCorredor
          alAbrir={() => {
            sonar('bocina');
            establecerAbriendo(corredor);
          }}
          alInvertir={() => establecerSeleccion(invertirSentido)}
          anchoControl={anchoControl}
          corredor={corredor}
        />

        <Pressable accessibilityRole="button" onPress={alAbrirEncomiendas}>
          <Bloque estiloContenido={estilos.encomienda}>
            <View style={estilos.textoEncomienda}>
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {t('encomiendas.entrada')}
              </Text>
              <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
                {t('encomiendas.entradaDetalle')}
              </Text>
            </View>
            <Icono nombre="siguiente" tamano="mediano" />
          </Bloque>
        </Pressable>

        <Text
          style={[
            tipografia.pequeno,
            estilos.aviso,
            { color: colores.tintaSuave },
          ]}
        >
          {t('rutas.datosPendientesDetalle')}
        </Text>
      </MarcoPestana>
      {abriendo && (
        <EscenaViaje
          alTerminar={() => {
            const id = abriendo.id;
            establecerAbriendo(null);
            alAbrirRuta?.(id);
          }}
          destino={abriendo.destino}
          detalle={t('rutas.abriendo')}
          duracion={1700}
          tipo="salida"
          titulo={`${abriendo.origen} → ${abriendo.destino}`}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1 },
  aviso: { textAlign: 'center' },
  contenido: { gap: espacios.veinticuatro },
  encomienda: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
    padding: espacios.dieciseis,
  },
  textoEncomienda: { flex: 1, gap: espacios.cuatro },
  titular: { gap: espacios.ocho },
});
