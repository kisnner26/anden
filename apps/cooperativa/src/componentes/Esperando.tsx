import { enlaceDeMapa } from '@anden/dominio';

import { vendidosDe } from '../lib/analitica';
import { horaCorta } from '../lib/formato';
import { nombreRuta, ocupacion } from '../lib/ruta';
import type { Boleto, Viaje } from '../tipos';
import { Bus } from '../svg/Bus';
import { Vacio } from './Vacio';

/** los viajes que todavía esperan pasajeros, el más próximo primero, con su punto de encuentro y los asientos que se llenan */
export function Esperando({
  boletos,
  compacto = false,
  viajes,
}: {
  boletos: readonly Boleto[];
  compacto?: boolean;
  viajes: readonly Viaje[];
}) {
  const esperando = viajes
    .filter((v) => v.estado !== 'cancelado' && !v.salio_en)
    .sort((a, b) => a.salida.localeCompare(b.salida));
  if (esperando.length === 0) {
    return (
      <Vacio
        detalle="Los viajes aparecen acá apenas un conductor los publica."
        titulo="Ningún bus está esperando pasajeros"
      />
    );
  }
  return (
    <div className={`andenes${compacto ? ' compacto' : ''}`}>
      {esperando.map((viaje, i) => {
        const vendidos = vendidosDe(boletos, viaje.id);
        const o = ocupacion(vendidos, viaje.servicio);
        const mapa = viaje.punto_encuentro
          ? enlaceDeMapa(viaje.punto_encuentro)
          : null;
        return (
          <div
            className="anden ocupado"
            key={viaje.id}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="hora-espera">{horaCorta(viaje.salida)}</span>
            <div className="anden-info">
              <p className="anden-ruta">{nombreRuta(viaje.ruta_id)}</p>
              <p className="micro">
                {viaje.placa} · {o.texto}
              </p>
              <p className="micro">
                {mapa ? (
                  <a
                    className="enlace"
                    href={mapa}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {viaje.punto_encuentro}
                  </a>
                ) : (
                  'Punto por confirmar'
                )}
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
          </div>
        );
      })}
    </div>
  );
}
