import { Contador } from '../componentes/Contador';
import type { Cierre, ViajeFila } from '../resumen';
import { useLista } from '../useDatos';

interface Perfil {
  chofer_id: string | null;
  creado_en: string;
  nombre: string;
  rol: string;
  usuario: string | null;
}
interface Publico {
  chofer_id: string;
  foto_url: string | null;
  nombre: string;
}
interface CierreChofer extends Cierre {
  chofer_id: string;
}

export function Conductores() {
  const perfiles = useLista<Perfil>(
    'perfiles',
    'nombre, usuario, chofer_id, rol, creado_en',
    { columna: 'creado_en' },
  );
  const publicos = useLista<Publico>(
    'perfiles_chofer',
    'chofer_id, nombre, foto_url',
  );
  const cierres = useLista<CierreChofer>(
    'cierres',
    'viaje_id, chofer_id, cobrado, pasajeros, pendiente',
  );
  const viajes = useLista<ViajeFila>(
    'viajes',
    'id, chofer_id, ruta_id, servicio, placa, anden, salida, estado, salio_en',
  );
  const conductores = perfiles.filas.filter((p) => p.rol === 'conductor');

  return (
    <div className="pagina">
      <header className="encabezado">
        <p className="micro">03 / CONDUCTORES · {conductores.length} ACTIVOS</p>
        <h1 className="display">
          <span>QUIENES</span>
          <em>LLEVAN.</em>
        </h1>
        <p className="lead">
          Cada conductor con lo que ha cobrado, los pasajeros que llevó y sus
          viajes publicados.
        </p>
      </header>
      {conductores.length === 0 && (
        <p className="vacio">Todavía no hay conductores aprobados.</p>
      )}
      <div className="cartas">
        {conductores.map((c, i) => {
          const publico = publicos.filas.find(
            (p) => p.chofer_id === c.chofer_id,
          );
          const suyos = cierres.filas.filter(
            (x) => x.chofer_id === c.chofer_id,
          );
          const publicados = viajes.filas.filter(
            (v) => v.chofer_id === c.chofer_id,
          ).length;
          return (
            <article
              className="carta conductor"
              key={c.chofer_id ?? c.usuario}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="retrato">
                {publico?.foto_url ? (
                  <img alt={c.nombre} src={publico.foto_url} />
                ) : (
                  <span>{c.nombre.slice(0, 1)}</span>
                )}
              </div>
              <p className="micro">
                {(c.chofer_id ?? 'SIN CÓDIGO').toUpperCase()} · @
                {c.usuario ?? '—'}
              </p>
              <h3 className="nombre">{publico?.nombre ?? c.nombre}</h3>
              <dl className="datos tres">
                <div>
                  <dt className="micro">COBRADO</dt>
                  <dd>
                    <Contador
                      prefijo="C$ "
                      valor={suyos.reduce((s, x) => s + x.cobrado, 0)}
                    />
                  </dd>
                </div>
                <div>
                  <dt className="micro">PASAJEROS</dt>
                  <dd>
                    <Contador
                      valor={suyos.reduce((s, x) => s + x.pasajeros, 0)}
                    />
                  </dd>
                </div>
                <div>
                  <dt className="micro">VIAJES</dt>
                  <dd>
                    <Contador valor={publicados} />
                  </dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </div>
  );
}
