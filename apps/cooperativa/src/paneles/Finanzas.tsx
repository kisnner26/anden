import { Barras } from '../componentes/Barras';
import { Contador } from '../componentes/Contador';
import { Tabla, type Columna } from '../componentes/Tabla';
import { useDatos } from '../DatosContexto';
import {
  cobradoPorDia,
  rankingDeConductores,
  viajesPorCorredor,
} from '../lib/analitica';
import { dinero, fechaHora } from '../lib/formato';
import { nombreRuta } from '../lib/ruta';
import type { Cierre } from '../tipos';

export function Finanzas() {
  const d = useDatos();
  const dias = cobradoPorDia(d.cierres, 14);
  const ranking = rankingDeConductores(d.cierres);
  const total = d.cierres.reduce((s, c) => s + c.cobrado, 0);
  const pendiente = d.cierres.reduce((s, c) => s + c.pendiente, 0);
  const cobranza =
    total + pendiente === 0
      ? 0
      : Math.round((total / (total + pendiente)) * 100);
  const reparto = viajesPorCorredor(d.viajes);
  const maximo = Math.max(1, ...ranking.map((r) => r.cobrado));
  const columnas: Columna<Cierre>[] = [
    {
      celda: (c) => fechaHora(c.cerrado_en),
      clave: 'fecha',
      titulo: 'Cerrado',
      valor: (c) => c.cerrado_en,
    },
    {
      celda: (c) => {
        const v = d.viajes.find((x) => x.id === c.viaje_id);
        return v ? nombreRuta(v.ruta_id) : c.viaje_id;
      },
      clave: 'ruta',
      titulo: 'Ruta',
      valor: (c) => c.viaje_id,
    },
    {
      celda: (c) => c.chofer_id,
      clave: 'chofer',
      titulo: 'Chofer',
      valor: (c) => c.chofer_id,
    },
    {
      celda: (c) => c.pasajeros,
      clave: 'pasajeros',
      titulo: 'Pasajeros',
      valor: (c) => c.pasajeros,
    },
    {
      celda: (c) => dinero(c.cobrado),
      clave: 'cobrado',
      titulo: 'Cobrado',
      valor: (c) => c.cobrado,
    },
    {
      celda: (c) => dinero(c.pendiente),
      clave: 'pendiente',
      titulo: 'Por cobrar',
      valor: (c) => c.pendiente,
    },
  ];
  return (
    <>
      <div className="tiles">
        <article className="tile">
          <p className="tile-etiqueta">Cobrado</p>
          <p className="tile-valor">
            <Contador prefijo="C$ " valor={total} />
          </p>
        </article>
        <article className="tile">
          <p className="tile-etiqueta">Por cobrar</p>
          <p className="tile-valor">
            <Contador prefijo="C$ " valor={pendiente} />
          </p>
        </article>
        <article className="tile">
          <p className="tile-etiqueta">Cobranza</p>
          <p className="tile-valor">
            <Contador sufijo=" %" valor={cobranza} />
          </p>
        </article>
        <article className="tile">
          <p className="tile-etiqueta">Viajes a Boaco / Juigalpa</p>
          <p className="tile-valor">
            {reparto.boaco} / {reparto.juigalpa}
          </p>
        </article>
      </div>
      <div className="rejilla2">
        <section className="panel">
          <header className="panel-cabeza">
            <h2>Cobrado por día</h2>
            <span className="micro">Últimos 14 días</span>
          </header>
          <Barras
            datos={dias.map((x) => ({
              etiqueta: new Date(x.dia).getDate().toString(),
              valor: x.total,
            }))}
            formato={dinero}
            unidad="córdobas cobrados por día"
          />
        </section>
        <section className="panel">
          <header className="panel-cabeza">
            <h2>Conductores</h2>
            <span className="micro">Por lo cobrado</span>
          </header>
          {ranking.length === 0 ? (
            <p className="micro">Todavía no hay cierres.</p>
          ) : (
            <ol className="ranking">
              {ranking.map((r, i) => (
                <li key={r.chofer}>
                  <span className="num">{i + 1}</span>
                  <div>
                    <p>
                      {r.chofer} · {dinero(r.cobrado)}
                    </p>
                    <span className="medidor">
                      <i style={{ width: `${(r.cobrado / maximo) * 100}%` }} />
                    </span>
                    <p className="micro">
                      {r.viajes} viajes · {r.pasajeros} pasajeros
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
      <section className="panel">
        <header className="panel-cabeza">
          <h2>Cierres de viaje</h2>
        </header>
        <Tabla
          columnas={columnas}
          filas={d.cierres}
          idDe={(c) => c.viaje_id}
          nombreArchivo="cierres"
          textoDe={(c) => `${c.chofer_id} ${c.viaje_id}`}
          vacio={{
            detalle:
              'Cuando un conductor cierre un viaje, queda registrado acá con lo que cobró.',
            titulo: 'Sin cierres',
          }}
        />
      </section>
    </>
  );
}
