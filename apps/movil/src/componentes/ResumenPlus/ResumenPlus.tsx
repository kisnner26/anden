import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { resumenDeViajes } from '@/datos/resumenViajes';
import type { BoletoGuardado } from '@/datos/reserva';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { nombresMeses } from '@/textos/es';
import { t } from '@/textos/t';

export interface PropiedadesResumenPlus {
  alAbrirPlus?: () => void;
  boletos: readonly BoletoGuardado[];
  plus: boolean;
}

/** cuatro cifras de tus viajes en una cuadrícula simétrica; sin Plus se ven bloqueadas con el aviso de qué incluye */
export function ResumenPlus({
  alAbrirPlus,
  boletos,
  plus,
}: PropiedadesResumenPlus) {
  const { colores } = useTema();
  const r = resumenDeViajes(boletos);
  const celdas: [string, string][] = [
    [t('boletos.resumenKm'), plus ? `${r.kilometros} km` : '— km'],
    [t('boletos.resumenGastado'), plus ? `C$ ${r.gastado}` : 'C$ —'],
    [t('boletos.resumenFavorito'), plus ? (r.destinoFavorito ?? '—') : '—'],
    [
      t('boletos.resumenMes'),
      plus ? (r.mesTop !== null ? (nombresMeses[r.mesTop] ?? '—') : '—') : '—',
    ],
  ];

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <Text style={[tipografia.titulo, { color: colores.tinta }]}>
          {t('boletos.resumenTitulo')}
        </Text>
        <View style={[estilos.sello, { backgroundColor: colores.ambar }]}>
          <Text style={[tipografia.etiqueta, { color: colores.sobreAmbar }]}>
            {t('plus.marca')}
          </Text>
        </View>
      </View>

      <View style={estilos.rejilla}>
        {celdas.map(([etiqueta, valor]) => (
          <Bloque
            estilo={estilos.celda}
            estiloContenido={[
              estilos.celdaContenido,
              !plus && estilos.bloqueada,
            ]}
            key={etiqueta}
          >
            <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
              {etiqueta}
            </Text>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              numberOfLines={1}
              style={[tipografia.dato, { color: colores.tinta }]}
            >
              {valor}
            </Text>
          </Bloque>
        ))}
      </View>

      {!plus && (
        <Pressable
          accessibilityRole="button"
          onPress={alAbrirPlus}
          style={[
            estilos.invitacion,
            { backgroundColor: conAlfa(colores.ambar, 0.18) },
          ]}
        >
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {t('boletos.resumenInvitacion')}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.ambarTexto }]}>
            {t('boletos.resumenVer')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  bloqueada: { opacity: 0.45 },
  celda: { flexBasis: '47%', flexGrow: 1 },
  celdaContenido: {
    alignItems: 'center',
    gap: espacios.ocho,
    padding: espacios.dieciseis,
  },
  contenedor: { gap: espacios.dieciseis },
  encabezado: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'center',
  },
  invitacion: {
    alignItems: 'center',
    borderRadius: radios.bloque,
    gap: espacios.cuatro,
    padding: espacios.dieciseis,
  },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.dieciseis },
  sello: {
    borderRadius: radios.pildora,
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.cuatro,
  },
});
