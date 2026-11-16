import { BotonGigante } from '@/componentes/BotonGigante';
import { PantallaSimple } from '@/componentes/PantallaSimple';
import { formatoHoraCompleta } from '@/datos/formato';
import { useSalidas } from '@/datos/useSalidas';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

/** cuántas salidas se muestran: pocas y grandes, no una tabla */
const MAXIMO = 6;

export interface PropiedadesHorariosSimple {
  alAbrirViaje: (viajeId: string) => void;
  alSalir: () => void;
}

/** las próximas salidas de hoy como botones gigantes: destino grande y debajo la hora, el precio y cuántos asientos quedan */
export function HorariosSimple({
  alAbrirViaje,
  alSalir,
}: PropiedadesHorariosSimple) {
  const { ahora, salidas } = useSalidas();
  const proximas = salidas
    .filter(
      (salida) =>
        salida.ventaAbierta &&
        salida.asientosLibres > 0 &&
        salida.salida.getTime() >= ahora.getTime(),
    )
    .sort((a, b) => a.salida.getTime() - b.salida.getTime())
    .slice(0, MAXIMO);
  return (
    <PantallaSimple
      alSalir={alSalir}
      indicacion={
        proximas.length > 0
          ? t('pantallasSimples.horariosIndicacion')
          : t('pantallasSimples.horariosSin')
      }
      testID="horarios-simple"
      titulo={t('pantallasSimples.horariosTitulo')}
    >
      {proximas.map((salida, indice) => (
        <BotonGigante
          alPresionar={() => alAbrirViaje(salida.viajeId)}
          destacado={indice === 0}
          detalle={rellenar(t('pantallasSimples.horariosDetalle'), {
            hora: formatoHoraCompleta(salida.salida),
            libres: salida.asientosLibres,
            tarifa: salida.tarifa ?? '—',
          })}
          etiqueta={salida.destino}
          key={salida.viajeId}
          sobretitulo={
            indice === 0 ? t('pantallasSimples.horariosProxima') : undefined
          }
        />
      ))}
    </PantallaSimple>
  );
}
