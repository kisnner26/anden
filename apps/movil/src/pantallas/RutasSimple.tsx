import { BotonGigante } from '@/componentes/BotonGigante';
import { PantallaSimple } from '@/componentes/PantallaSimple';
import { formatoDuracion } from '@/datos/formato';
import { CIUDADES_RED } from '@/datos/redRutas';
import { trazoEntre } from '@/datos/trazoCorredor';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesRutasSimple {
  /** lleva a buscar viajes hacia una ciudad */
  alBuscar: (destino: string) => void;
  alSalir: () => void;
}

/** los viajes que existen, uno por botón: de Managua a cada ciudad y de vuelta */
export function RutasSimple({ alBuscar, alSalir }: PropiedadesRutasSimple) {
  const viajes = CIUDADES_RED.flatMap((ciudad) => [
    { destino: ciudad, origen: 'Managua' },
    { destino: 'Managua', origen: ciudad },
  ]);
  return (
    <PantallaSimple
      alSalir={alSalir}
      indicacion={t('pantallasSimples.rutasIndicacion')}
      testID="rutas-simple"
      titulo={t('pantallasSimples.rutasTitulo')}
    >
      {viajes.map(({ destino, origen }) => {
        const trazo = trazoEntre(origen, destino);
        return (
          <BotonGigante
            alPresionar={() => alBuscar(destino)}
            detalle={
              trazo
                ? rellenar(t('pantallasSimples.rutasDetalle'), {
                    duracion: formatoDuracion(trazo.duracionMin),
                    km: Math.round(trazo.distanciaKm),
                  })
                : undefined
            }
            etiqueta={rellenar(t('pantallasSimples.rutasViaje'), {
              destino,
              origen,
            })}
            key={`${origen}-${destino}`}
          />
        );
      })}
    </PantallaSimple>
  );
}
