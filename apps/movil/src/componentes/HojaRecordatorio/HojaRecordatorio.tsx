import { StyleSheet, Text, View } from 'react-native';

import { BotonAccion } from '@/componentes/BotonAccion';
import { abrirAjustesDelSistema } from '@/datos/notificaciones';
import { Chip } from '@/componentes/Chip';
import { Hoja } from '@/componentes/Hoja';
import {
  OPCIONES_MINUTOS,
  opcionDisponible,
  type MinutosAntes,
  type RecordatorioSalida,
} from '@/datos/recordatorios';
import type { Salida } from '@/datos/salidas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesHojaRecordatorio {
  actual?: RecordatorioSalida;
  ahora: Date;
  alCerrar: () => void;
  alElegir: (minutos: MinutosAntes) => void;
  alQuitar: () => void;
  /** lo que salió mal la última vez, si algo salió mal */
  error?: 'fallo' | 'permiso-negado' | 'ya-paso' | null;
  salida: Salida | null;
}

/** hoja para elegir cuánto antes de la salida suena el aviso, o quitarlo */
export function HojaRecordatorio({
  actual,
  ahora,
  alCerrar,
  alElegir,
  alQuitar,
  error = null,
  salida,
}: PropiedadesHojaRecordatorio) {
  const { colores } = useTema();

  return (
    <Hoja
      abierta={salida !== null}
      alCerrar={alCerrar}
      etiquetaCerrar={t('recordatorios.cerrar')}
    >
      {salida && (
        <View style={estilos.contenido}>
          <Text
            accessibilityRole="header"
            style={[tipografia.titulo, { color: colores.tinta }]}
          >
            {t('recordatorios.hojaTitulo')}
          </Text>
          <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
            {salida.destino}
          </Text>
          <View style={estilos.opciones}>
            {OPCIONES_MINUTOS.map((minutos) => (
              <Chip
                alCambiar={() => alElegir(minutos)}
                deshabilitado={
                  !opcionDisponible(
                    salida.salida,
                    salida.minutosAtraso,
                    minutos,
                    ahora,
                  )
                }
                etiqueta={rellenar(t('recordatorios.minutosAntes'), {
                  minutos,
                })}
                key={minutos}
                seleccionado={actual?.minutosAntes === minutos}
              />
            ))}
          </View>
          {error !== null && (
            <Text
              accessibilityLiveRegion="polite"
              style={[tipografia.pequeno, { color: colores.cancelado }]}
            >
              {error === 'permiso-negado'
                ? t('recordatorios.permisoNegado')
                : error === 'fallo'
                  ? t('recordatorios.fallo')
                  : t('recordatorios.yaPaso')}
            </Text>
          )}
          {error === 'permiso-negado' && (
            <BotonAccion
              alPresionar={() => void abrirAjustesDelSistema()}
              etiqueta={t('recordatorios.abrirAjustes')}
            />
          )}
          {actual && (
            <BotonAccion
              alPresionar={alQuitar}
              etiqueta={t('recordatorios.quitar')}
              icono="campana"
            />
          )}
        </View>
      )}
    </Hoja>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    gap: espacios.dieciseis,
    paddingBottom: espacios.cuarentaYOcho,
    paddingHorizontal: espacios.lateral,
  },
  opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
});
