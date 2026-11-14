import { Esperando } from '../componentes/Esperando';
import { Contador } from '../componentes/Contador';
import { LineaDeRed } from '../componentes/LineaDeRed';
import { Sparkline } from '../componentes/Sparkline';
import { useDatos } from '../DatosContexto';
import {
  cobradoPorDia,
  esperaPromedio,
  lineaDeTiempo,
  resumir,
} from '../lib/analitica';
import { hace } from '../lib/formato';

export function Tablero({ irA }: { irA: (seccion: string) => void }) {
  const d = useDatos();
  const r = resumir(d);
  const espera = esperaPromedio(d.viajes);
  const semana = cobradoPorDia(d.cierres, 7).map((x) => x.total);
  const eventos = lineaDeTiempo(d, 8);

  const tiles = [
    { etiqueta: 'Cobrado', prefijo: 'C$ ', serie: semana, valor: r.cobrado },
    { etiqueta: 'Por cobrar', prefijo: 'C$ ', valor: r.porCobrar },
    { etiqueta: 'Pasajeros llevados', valor: r.pasajeros },
    { etiqueta: 'Viajes cerrados', valor: r.viajesCerrados },
    { etiqueta: 'Buses en andén', valor: r.viajesActivos },
    {
      etiqueta: 'Ocupación media',
      sufijo: ' %',
      valor: Math.round(r.ocupacionMedia * 100),
    },
    { etiqueta: 'Encomiendas abiertas', valor: r.encomiendasAbiertas },
  ];

  return (
    <>
      {r.alertasPendientes > 0 && (
        <button
          className="cinta-alerta"
          onClick={() => irA('alertas')}
          type="button"
        >
          <span className="punto-rojo" /> {r.alertasPendientes}{' '}
          {r.alertasPendientes === 1
            ? 'alerta de seguridad sin atender'
            : 'alertas de seguridad sin atender'}{' '}
          · abrir
        </button>
      )}
      <div className="tiles">
        {tiles.map((t, i) => (
          <article
            className="tile"
            key={t.etiqueta}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <p className="tile-etiqueta">{t.etiqueta}</p>
            <p className="tile-valor">
              <Contador prefijo={t.prefijo} sufijo={t.sufijo} valor={t.valor} />
            </p>
            {t.serie ? (
              <Sparkline
                etiqueta="Cobrado en los últimos 7 días"
                valores={t.serie}
              />
            ) : (
              <span className="tile-vacio" />
            )}
          </article>
        ))}
        <article className="tile" style={{ animationDelay: '350ms' }}>
          <p className="tile-etiqueta">Espera media en andén</p>
          <p className="tile-valor">
            {espera === null ? '—' : `${espera} min`}
          </p>
          <span className="tile-vacio" />
        </article>
      </div>

      <div className="rejilla2">
        <section className="panel">
          <header className="panel-cabeza">
            <h2>Red en vivo</h2>
            <button
              className="enlace"
              onClick={() => irA('envivo')}
              type="button"
            >
              Abrir ↗
            </button>
          </header>
          <LineaDeRed
            alto={250}
            transmisiones={d.transmisiones}
            viajes={d.viajes}
          />
        </section>
        <section className="panel">
          <header className="panel-cabeza">
            <h2>Lo último</h2>
            <button
              className="enlace"
              onClick={() => irA('actividad')}
              type="button"
            >
              Ver todo ↗
            </button>
          </header>
          {eventos.length === 0 ? (
            <p className="micro">Todavía no pasó nada.</p>
          ) : (
            <ol className="eventos">
              {eventos.map((e, i) => (
                <li key={`${e.hora}-${i}`}>
                  <i className={`ev ev-${e.tipo}`} />
                  <div>
                    <p>{e.titulo}</p>
                    <p className="micro">{e.detalle}</p>
                  </div>
                  <span className="micro">{hace(e.hora)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <section className="panel">
        <header className="panel-cabeza">
          <h2>Esperando pasajeros</h2>
          <span className="micro">El bus sale cuando se llena</span>
        </header>
        <Esperando boletos={d.boletos} compacto viajes={d.viajes} />
      </section>
    </>
  );
}
