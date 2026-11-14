import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Autobus } from '@/componentes/Autobus';
import { Bloque } from '@/componentes/Bloque';
import { BotonRecordatorio } from '@/componentes/BotonRecordatorio';
import { FotoDestino } from '@/componentes/FotoDestino';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { fotoDeDestino } from '@/datos/fotosDestino';
import { nivelDisponibilidad } from '@/datos/disponibilidad';
import { formatoHora, formatoHoraCompleta, sufijoHora } from '@/datos/formato';
import type { Salida } from '@/datos/salidas';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';
import { etiquetaPunto } from '@/datos/puntoEncuentro';

export interface PropiedadesFilaSalida {
  alPresionar?: (viajeId: string) => void;
  /** si ya tenés boleto en esta salida se muestra el círculo negro con el check; sin boleto no hay control extra */
  conBoleto?: boolean;
  /** agrega cuántos asientos quedan, con aviso si son pocos o ninguno */
  mostrarDisponibilidad?: boolean;
  /** una marca breve bajo el destino, por ejemplo "Para vos" cuando la sugiere la IA */
  sugerida?: string;
  /** campana para pedir el aviso de esta salida */
  recordatorio?: { activo: boolean; alPresionar: () => void; etiqueta: string };
  salida: Salida;
}

function IconoServicio({ servicio }: { servicio: Salida['servicio'] }) {
  if (servicio === 'expreso')
    return <Icono nombre="rayo" tamano="ilustracion" />;
  return <Autobus ancho={tamanosControl.toqueMinimo} usarMiUnidad />;
}

/** una salida de la terminal: ícono del servicio, destino, andén, hora y el estado del boleto */
export function FilaSalida({
  alPresionar,
  conBoleto = false,
  mostrarDisponibilidad = false,
  recordatorio,
  salida,
  sugerida,
}: PropiedadesFilaSalida) {
  const { colores } = useTema();
  const servicio = t(`servicios.${salida.servicio}`);
  const puntoEncuentro = etiquetaPunto(salida.puntoEncuentro);
  const nivel = nivelDisponibilidad(salida.asientosLibres);
  const textoDisponibilidad =
    nivel === 'agotado'
      ? t('horarios.agotado')
      : nivel === 'pocos'
        ? `${t('horarios.pocosAsientos')} · ${salida.asientosLibres}`
        : `${salida.asientosLibres} ${t('horarios.libres')}`;

  return (
    <Bloque estilo={estilos.fila} estiloContenido={estilos.contenido}>
      <Pressable
        accessibilityLabel={`${salida.destino}, ${formatoHoraCompleta(salida.salida)}, ${servicio}, ${puntoEncuentro}`}
        accessibilityRole="button"
        onPress={() => alPresionar?.(salida.viajeId)}
        style={estilos.principal}
      >
        {fotoDeDestino(salida.destino) ? (
          <FotoDestino
            destino={salida.destino}
            estilo={estilos.miniatura}
            radio="loseta"
          />
        ) : (
          <Loseta>
            <IconoServicio servicio={salida.servicio} />
          </Loseta>
        )}
        <View style={estilos.texto}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {salida.destino}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {`${servicio} · ${puntoEncuentro}`}
          </Text>
          {sugerida ? (
            <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
              {sugerida}
            </Text>
          ) : null}
          {mostrarDisponibilidad ? (
            <Text
              style={[
                tipografia.etiqueta,
                {
                  color:
                    nivel === 'hay' ? colores.tintaSuave : colores.ambarTexto,
                },
              ]}
            >
              {textoDisponibilidad}
            </Text>
          ) : null}
        </View>
        <View style={estilos.hora}>
          <Text style={[tipografia.dato, { color: colores.ambarTexto }]}>
            {formatoHora(salida.salida)}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {sufijoHora(salida.salida)}
          </Text>
        </View>
        {conBoleto ? (
          <Loseta tamano={44} variante="negra">
            <Icono
              color={colores.sobreNegro}
              nombre="confirmar"
              tamano="grande"
            />
          </Loseta>
        ) : null}
      </Pressable>
      {recordatorio ? (
        <BotonRecordatorio
          activo={recordatorio.activo}
          alPresionar={recordatorio.alPresionar}
          etiqueta={recordatorio.etiqueta}
        />
      ) : null}
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.doce,
  },
  fila: { marginTop: espacios.doce },
  hora: { alignItems: 'flex-end' },
  miniatura: { height: 64, width: 64 },
  principal: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: espacios.doce,
  },
  texto: { flex: 1 },
});
