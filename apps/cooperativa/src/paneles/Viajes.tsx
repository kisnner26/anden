import { useState } from 'react';

import { nombreRuta, ocupacion } from '../lib/ruta';
import type { ViajeFila } from '../resumen';
import { supabase } from '../supabase';
import { useLista } from '../useDatos';

const hora = (iso: string) =>
  new Date(iso).toLocaleString('es-NI', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  });
const FILTROS = [
  { clave: 'esperando', titulo: 'ESPERANDO' },
  { clave: 'salieron', titulo: 'SALIERON' },
  { clave: 'cancelados', titulo: 'CANCELADOS' },
] as const;

export function Viajes() {
  const { cargando, filas, recargar } = useLista<ViajeFila>(
    'viajes',
    'id, chofer_id, ruta_id, servicio, placa, anden, salida, estado, salio_en',
    { columna: 'salida' },
  );
  const boletos = useLista<{ estado: string; viaje_id: string }>(
    'boletos',
    'viaje_id, estado',
  );
  const [filtro, establecerFiltro] =
    useState<(typeof FILTROS)[number]['clave']>('esperando');
  const [mensaje, establecerMensaje] = useState<string | null>(null);

  const grupo = {
    cancelados: filas.filter((v) => v.estado === 'cancelado'),
    esperando: filas.filter((v) => v.estado !== 'cancelado' && !v.salio_en),
    salieron: filas.filter((v) => v.estado !== 'cancelado' && v.salio_en),
  };
  const visibles = grupo[filtro];

  async function cancelar(v: ViajeFila) {
    const { error } = await supabase!
      .from('viajes')
      .update({ estado: 'cancelado' })
      .eq('id', v.id);
    establecerMensaje(
      error
        ? `No se pudo cancelar: ${error.message}`
        : 'Viaje cancelado. Los pasajeros lo ven al instante.',
    );
    await recargar();
  }

  return (
    <div className="pagina">
      <header className="encabezado">
        <p className="micro">04 / VIAJES</p>
        <h1 className="display">
          <span>CUÁNDO</span>
          <em>SALE.</em>
        </h1>
        <p className="lead">
          El interlocal no tiene hora fija: la hora que ves es cuando se pone en
          andén. Sale cuando se llena.
        </p>
      </header>
      <div className="filtros" role="tablist">
        {FILTROS.map((f) => (
          <button
            aria-selected={filtro === f.clave}
            key={f.clave}
            onClick={() => establecerFiltro(f.clave)}
            role="tab"
            type="button"
          >
            {f.titulo} <span>{grupo[f.clave].length}</span>
          </button>
        ))}
      </div>
      {mensaje && (
        <p className="aviso" role="status">
          {mensaje}
        </p>
      )}
      {cargando && <p className="vacio">Cargando…</p>}
      {!cargando && visibles.length === 0 && (
        <p className="vacio">No hay viajes en esta lista.</p>
      )}
      <ol className="tablero grande">
        {visibles.map((v, i) => {
          const o = ocupacion(
            boletos.filas.filter(
              (b) => b.viaje_id === v.id && b.estado !== 'cancelado',
            ).length,
            v.servicio,
          );
          return (
            <li key={v.id} style={{ animationDelay: `${i * 40}ms` }}>
              <span className="destino">
                {nombreRuta(v.ruta_id).toUpperCase()}
              </span>
              <span className="micro">
                PUESTA {hora(v.salida)}
                {v.salio_en ? ` · SALIÓ ${hora(v.salio_en)}` : ''}
              </span>
              <span className="micro">
                {v.placa} · ANDÉN {v.anden} · {v.chofer_id.toUpperCase()}
              </span>
              <span className="medidor">
                <i style={{ width: `${o.fraccion * 100}%` }} />
              </span>
              <span className="micro">{o.texto}</span>
              {filtro === 'esperando' && (
                <button
                  className="boton-linea"
                  onClick={() => void cancelar(v)}
                  type="button"
                >
                  CANCELAR
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
