import { Contador } from '../componentes/Contador';
import { GraficoCobros, type Cobro } from '../componentes/GraficoCobros';
import { LineaDeRed, type Transmision } from '../componentes/LineaDeRed';
import { Reloj } from '../componentes/Reloj';
import { Rodante } from '../componentes/Rodante';
import { nombreRuta, ocupacion } from '../lib/ruta';
import {
  esperaPromedio,
  resumir,
  type AlertaFila,
  type Cierre,
  type EncomiendaFila,
  type ViajeFila,
} from '../resumen';
import { useLista } from '../useDatos';

const COLUMNAS_VIAJE =
  'id, chofer_id, ruta_id, servicio, placa, anden, salida, estado, salio_en';

export function Portada({ irA }: { irA: (seccion: string) => void }) {
  const cierres = useLista<Cierre & Cobro>(
    'cierres',
    'viaje_id, cobrado, pasajeros, pendiente, cerrado_en',
  );
  const viajes = useLista<ViajeFila>('viajes', COLUMNAS_VIAJE, {
    columna: 'salida',
    ascendente: true,
  });
  const boletos = useLista<{ estado: string; viaje_id: string }>(
    'boletos',
    'viaje_id, estado',
  );
  const encomiendas = useLista<EncomiendaFila>(
    'encomiendas',
    'id, chofer_id, estado, motivo, contenido',
  );
  const alertas = useLista<AlertaFila>(
    'alertas',
    'id, viaje_id, tipo, lat, lng, nombre, atendida, creada_en',
    { columna: 'creada_en' },
    5000,
  );
  const transmisiones = useLista<Transmision>(
    'transmisiones',
    'viaje_id, lat, lng',
    undefined,
    4000,
  );

  const r = resumir(
    cierres.filas,
    viajes.filas,
    encomiendas.filas,
    alertas.filas,
  );
  const espera = esperaPromedio(viajes.filas);
  const esperando = viajes.filas
    .filter((v) => v.estado !== 'cancelado' && !v.salio_en)
    .slice(0, 7);
  const vendidos = (id: string) =>
    boletos.filas.filter((b) => b.viaje_id === id && b.estado !== 'cancelado')
      .length;

  const cifras = [
    { etiqueta: 'COBRADO', prefijo: 'C$ ', valor: r.cobrado },
    { etiqueta: 'POR COBRAR', prefijo: 'C$ ', valor: r.porCobrar },
    { etiqueta: 'PASAJEROS LLEVADOS', valor: r.pasajeros },
    { etiqueta: 'VIAJES CERRADOS', valor: r.viajesCerrados },
  ];

  return (
    <div className="pagina">
      {r.alertasPendientes > 0 && (
        <button
          className="cinta-alerta"
          onClick={() => irA('alertas')}
          type="button"
        >
          <span className="punto-rojo" /> {r.alertasPendientes}{' '}
          {r.alertasPendientes === 1
            ? 'ALERTA DE SEGURIDAD SIN ATENDER'
            : 'ALERTAS DE SEGURIDAD SIN ATENDER'}{' '}
          · ABRIR ↗
        </button>
      )}

      <header className="portada">
        <p className="micro">
          TORRE DE CONTROL · <Reloj />
        </p>
        <h1 className="display">
          <span>LA RUTA,</span>
          <em>AL DÍA.</em>
        </h1>
        <p className="lead">
          Lo que publican los conductores y lo que reservan los pasajeros, en un
          solo lugar y en tiempo real.
        </p>
      </header>

      <LineaDeRed transmisiones={transmisiones.filas} viajes={viajes.filas} />

      <section className="cifras" aria-label="Cifras del día">
        {cifras.map((c) => (
          <div className="cifra" key={c.etiqueta}>
            <p className="micro">{c.etiqueta}</p>
            <p className="numero">
              <Contador prefijo={c.prefijo} valor={c.valor} />
            </p>
          </div>
        ))}
      </section>

      <div className="doble">
        <section className="bloque">
          <header className="bloque-cabecera">
            <h2 className="titulo-bloque">SALIDAS</h2>
            <p className="micro">{esperando.length} ESPERANDO PASAJEROS</p>
          </header>
          {esperando.length === 0 ? (
            <p className="vacio">
              Ningún bus espera pasajeros ahora. Cuando un conductor publique un
              viaje, aparece acá.
            </p>
          ) : (
            <ol className="tablero">
              {esperando.map((v, i) => {
                const o = ocupacion(vendidos(v.id), v.servicio);
                return (
                  <li key={v.id}>
                    <span className="hora">
                      <Rodante
                        demora={i * 90}
                        texto={new Date(v.salida).toLocaleTimeString('es-NI', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      />
                    </span>
                    <span className="destino">
                      <Rodante
                        demora={i * 90 + 120}
                        texto={nombreRuta(v.ruta_id).toUpperCase()}
                      />
                    </span>
                    <span className="micro">ANDÉN {v.anden}</span>
                    <span
                      className="medidor"
                      title={`${o.texto} asientos vendidos`}
                    >
                      <i style={{ width: `${o.fraccion * 100}%` }} />
                    </span>
                    <span className="micro">{o.texto}</span>
                  </li>
                );
              })}
            </ol>
          )}
          <p className="micro nota">
            HORA DE PUESTA EN ANDÉN. EL BUS SALE CUANDO SE LLENA.
          </p>
        </section>

        <section className="bloque">
          <header className="bloque-cabecera">
            <h2 className="titulo-bloque">COBROS</h2>
            <p className="micro">ÚLTIMOS 7 DÍAS</p>
          </header>
          <GraficoCobros cobros={cierres.filas} />
          <dl className="datos">
            <div>
              <dt className="micro">ESPERA MEDIA EN ANDÉN</dt>
              <dd>{espera === null ? 'Sin datos' : `${espera} min`}</dd>
            </div>
            <div>
              <dt className="micro">ENCOMIENDAS ABIERTAS</dt>
              <dd>{r.encomiendasAbiertas}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
