import { useState } from 'react';

import { supabase } from '../supabase';
import { useLista } from '../useDatos';

interface Solicitud {
  apellido: string;
  cedula: string;
  creada_en: string;
  estado: string;
  foto_dorso: string;
  foto_frente: string;
  nombre: string;
  telefono: string;
  usuario_id: string;
}

function Foto({ ruta, titulo }: { ruta: string; titulo: string }) {
  const [url, establecerUrl] = useState<string | null>(null);
  const [fallo, establecerFallo] = useState(false);
  async function ver() {
    const { data, error } = await supabase!.storage
      .from('cedulas')
      .createSignedUrl(ruta, 180);
    if (error || !data) establecerFallo(true);
    else establecerUrl(data.signedUrl);
  }
  if (url) return <img alt={titulo} className="cedula" src={url} />;
  return (
    <button className="ranura" onClick={() => void ver()} type="button">
      <span className="micro">{titulo.toUpperCase()}</span>
      <span>{fallo ? 'No se pudo abrir' : 'Revelar ↗'}</span>
    </button>
  );
}

export function Solicitudes() {
  const { cargando, filas, recargar } = useLista<Solicitud>(
    'solicitudes_conductor',
    'usuario_id, nombre, apellido, telefono, cedula, foto_frente, foto_dorso, estado, creada_en',
    { columna: 'creada_en' },
  );
  const [sello, establecerSello] = useState<Record<string, string>>({});
  const [mensaje, establecerMensaje] = useState<string | null>(null);

  async function resolver(s: Solicitud, aprobar: boolean) {
    const { data, error } = await supabase!.rpc('resolver_solicitud', {
      p_aprobar: aprobar,
      p_usuario_id: s.usuario_id,
    });
    if (error) return establecerMensaje(`No se pudo guardar: ${error.message}`);
    establecerSello((previo) => ({
      ...previo,
      [s.usuario_id]: aprobar ? 'APROBADA' : 'RECHAZADA',
    }));
    establecerMensaje(
      aprobar
        ? `${s.nombre} ya es conductor con el código ${String(data)}.`
        : `Rechazaste la solicitud de ${s.nombre}.`,
    );
    window.setTimeout(() => void recargar(), 1400);
  }

  const pendientes = filas.filter(
    (s) => s.estado === 'en_revision' || sello[s.usuario_id],
  );
  const resueltas = filas.filter(
    (s) => s.estado !== 'en_revision' && !sello[s.usuario_id],
  );

  return (
    <div className="pagina">
      <header className="encabezado">
        <p className="micro">02 / SOLICITUDES DE CONDUCTOR</p>
        <h1 className="display">
          <span>QUIÉN</span>
          <em>MANEJA.</em>
        </h1>
        <p className="lead">
          Revisá la cédula de cada persona y decidí. Al aprobar, su app se
          convierte en la de un conductor.
        </p>
      </header>
      {mensaje && (
        <p className="aviso" role="status">
          {mensaje}
        </p>
      )}
      {cargando && <p className="vacio">Cargando…</p>}
      {!cargando && pendientes.length === 0 && (
        <p className="vacio">No hay solicitudes por revisar.</p>
      )}
      <div className="cartas">
        {pendientes.map((s, i) => (
          <article
            className="carta"
            key={s.usuario_id}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {sello[s.usuario_id] && (
              <div
                className={`sello ${sello[s.usuario_id] === 'APROBADA' ? 'ok' : 'no'}`}
              >
                {sello[s.usuario_id]}
              </div>
            )}
            <p className="micro">
              {String(i + 1).padStart(2, '0')} ·{' '}
              {new Date(s.creada_en).toLocaleString('es-NI')}
            </p>
            <h3 className="nombre">
              {s.nombre} {s.apellido}
            </h3>
            <p className="suave">
              Cédula {s.cedula} · Tel. {s.telefono}
            </p>
            <div className="fotos">
              <Foto ruta={s.foto_frente} titulo="Frente" />
              <Foto ruta={s.foto_dorso} titulo="Dorso" />
            </div>
            <div className="acciones">
              <button
                className="boton-ed"
                disabled={Boolean(sello[s.usuario_id])}
                onClick={() => void resolver(s, true)}
                type="button"
              >
                APROBAR ↗
              </button>
              <button
                className="boton-linea"
                disabled={Boolean(sello[s.usuario_id])}
                onClick={() => void resolver(s, false)}
                type="button"
              >
                RECHAZAR
              </button>
            </div>
          </article>
        ))}
      </div>
      {resueltas.length > 0 && (
        <section className="bloque">
          <h2 className="titulo-bloque">YA RESUELTAS</h2>
          <ul className="lista">
            {resueltas.map((s) => (
              <li key={s.usuario_id}>
                <span>
                  {s.nombre} {s.apellido}
                </span>
                <span className="micro">{s.cedula}</span>
                <span
                  className={`chip ${s.estado === 'aprobada' ? 'ok' : 'no'}`}
                >
                  {s.estado === 'aprobada' ? 'APROBADA' : 'RECHAZADA'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
