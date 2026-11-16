import { BotonGigante } from '@/componentes/BotonGigante';
import { PantallaSimple } from '@/componentes/PantallaSimple';
import { boletosVigentes } from '@/datos/boletosVigentes';
import { formatoFechaCorta, formatoHoraCompleta } from '@/datos/formato';
import { useBoletos } from '@/datos/useBoletos';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesBoletosSimple {
  alAbrirBoleto: (boletoId: string) => void;
  alBuscar: () => void;
  alSalir: () => void;
}

/** los boletos vigentes como botones gigantes; sin ninguno, un solo botón para buscar un viaje */
export function BoletosSimple({
  alAbrirBoleto,
  alBuscar,
  alSalir,
}: PropiedadesBoletosSimple) {
  const { boletos } = useBoletos();
  const vigentes = boletosVigentes(boletos);
  return (
    <PantallaSimple
      alSalir={alSalir}
      indicacion={
        vigentes.length > 0
          ? t('pantallasSimples.boletosIndicacion')
          : t('pantallasSimples.boletosSin')
      }
      testID="boletos-simple"
      titulo={t('pantallasSimples.boletosTitulo')}
    >
      {vigentes.map(({ boleto, resumen }, indice) => {
        const salida = new Date(resumen.salida);
        return (
          <BotonGigante
            alPresionar={() => alAbrirBoleto(boleto.id)}
            destacado={indice === 0}
            detalle={rellenar(t('pantallasSimples.boletosDetalle'), {
              asiento: boleto.asiento,
              dia: formatoFechaCorta(salida),
              hora: formatoHoraCompleta(salida),
            })}
            etiqueta={resumen.destino}
            key={boleto.id}
          />
        );
      })}
      {vigentes.length === 0 ? (
        <BotonGigante
          alPresionar={alBuscar}
          destacado
          etiqueta={t('pantallasSimples.boletosBuscar')}
        />
      ) : null}
    </PantallaSimple>
  );
}
