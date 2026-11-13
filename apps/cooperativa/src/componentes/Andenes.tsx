import { nombreRuta, ocupacion } from '../lib/ruta';
import type { Boleto, Viaje } from '../tipos';
import { vendidosDe } from '../lib/analitica';
import { Bus } from '../svg/Bus';
import { PlacaAnden } from '../svg/Iconos';

const MINIMO = 6;

/** la terminal vista desde arriba: un carril por andén, con su bus estacionado y los asientos que se van llenando */
export function Andenes({
  boletos,
  compacto = false,
  viajes,
}: {
  boletos: readonly Boleto[];
  compacto?: boolean;
  viajes: readonly Viaje[];
}) {
  const esperando = viajes.filter(
    (v) => v.estado !== 'cancelado' && !v.salio_en,
  );
  const total = Math.max(MINIMO, ...esperando.map((v) => v.anden));
  return (
    <div className={`andenes${compacto ? ' compacto' : ''}`}>
      {Array.from({ length: total }, (_, i) => i + 1).map((numero, i) => {
        const viaje = esperando.find((v) => v.anden === numero);
        const vendidos = viaje ? vendidosDe(boletos, viaje.id) : 0;
        const o = viaje ? ocupacion(vendidos, viaje.servicio) : null;
        return (
          <div
            className={`anden${viaje ? ' ocupado' : ''}`}
            key={numero}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <PlacaAnden numero={numero} />
            {viaje && o ? (
              <>
                <div className="anden-info">
                  <p className="anden-ruta">{nombreRuta(viaje.ruta_id)}</p>
                  <p className="micro">
                    {viaje.placa} · {o.texto}
                  </p>
                </div>
                <div className="anden-bus">
                  <Bus ruedas={false} />
                </div>
                <div
                  aria-label={`${o.texto} asientos vendidos`}
                  className="asientos"
                  role="img"
                >
                  {Array.from({ length: o.capacidad }, (_, s) => (
                    <i
                      className={`asiento${s < vendidos ? ' vendido' : ''}`}
                      key={s}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="anden-libre">Libre</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
