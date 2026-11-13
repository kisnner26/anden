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
      .createSignedUrl(ruta, 120);
    if (error || !data) establecerFallo(true);
    else establecerUrl(data.signedUrl);
  }
  if (url) return <img alt={titulo} className="cedula" src={url} />;
  return (
    <button onClick={() => void ver()} type="button">
      {fallo ? 'No se pudo abrir' : `Ver ${titulo.toLowerCase()}`}
    </button>
  );
}

export function Solicitudes() {
  const { cargando, filas, recargar } = useLista<Solicitud>(
    'solicitudes_conductor',
    'usuario_id, nombre, apellido, telefono, cedula, foto_frente, foto_dorso, estado, creada_en',
    { columna: 'creada_en' },
  );
  const [mensaje, establecerMensaje] = useState<string | null>(null);

  async function resolver(s: Solicitud, aprobar: boolean) {
    const { data, error } = await supabase!.rpc('resolver_solicitud', {
      p_aprobar: aprobar,
      p_usuario_id: s.usuario_id,
    });
    establecerMensaje(
      error
        ? `No se pudo guardar: ${error.message}`
        : aprobar
          ? `${s.nombre} ya es conductor con el código ${String(data)}.`
          : `Rechazaste la solicitud de ${s.nombre}.`,
    );
    await recargar();
  }

  const pendientes = filas.filter((s) => s.estado === 'en_revision');
  const resueltas = filas.filter((s) => s.estado !== 'en_revision');

  return (
    <section>
      <h1>Solicitudes de conductor</h1>
      <p className="suave">
        Revisá la cédula y aprobá o rechazá. Al aprobar, la persona pasa a ser
        conductor y le llega a su app.
      </p>
      {mensaje && (
        <p className="aviso" role="status">
          {mensaje}
        </p>
      )}
      {cargando && <p className="suave">Cargando…</p>}
      {!cargando && pendientes.length === 0 && (
        <p className="suave">No hay solicitudes por revisar.</p>
      )}
      {pendientes.map((s) => (
        <article className="tarjeta" key={s.usuario_id}>
          <h3>
            {s.nombre} {s.apellido}
          </h3>
          <p className="suave">
            Cédula {s.cedula} · Tel. {s.telefono} ·{' '}
            {new Date(s.creada_en).toLocaleString('es-NI')}
          </p>
          <div className="fila">
            <Foto ruta={s.foto_frente} titulo="Frente de la cédula" />
            <Foto ruta={s.foto_dorso} titulo="Dorso de la cédula" />
          </div>
          <div className="fila">
            <button
              className="primario"
              onClick={() => void resolver(s, true)}
              type="button"
            >
              Aprobar
            </button>
            <button
              className="peligro"
              onClick={() => void resolver(s, false)}
              type="button"
            >
              Rechazar
            </button>
          </div>
        </article>
      ))}
      {resueltas.length > 0 && (
        <>
          <h2>Ya resueltas</h2>
          <table>
            <tbody>
              {resueltas.map((s) => (
                <tr key={s.usuario_id}>
                  <td>
                    {s.nombre} {s.apellido}
                  </td>
                  <td>{s.cedula}</td>
                  <td>{s.estado === 'aprobada' ? 'Aprobada' : 'Rechazada'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
