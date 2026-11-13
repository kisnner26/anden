import { useState } from 'react';

import type { ViajeFila } from '../resumen';
import { supabase } from '../supabase';
import { useLista } from '../useDatos';

const formato = new Intl.DateTimeFormat('es-NI', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function Viajes() {
  const { cargando, filas, recargar } = useLista<ViajeFila>(
    'viajes',
    'id, chofer_id, ruta_id, servicio, placa, anden, salida, estado, salio_en',
    { columna: 'salida' },
  );
  const [mensaje, establecerMensaje] = useState<string | null>(null);

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
    <section>
      <h1>Viajes</h1>
      <p className="suave">
        El interlocal no tiene hora fija: «Se pone en andén» es cuando empieza a
        esperar y «Salió» cuando de verdad arrancó.
      </p>
      {mensaje && (
        <p className="aviso" role="status">
          {mensaje}
        </p>
      )}
      {cargando && <p className="suave">Cargando…</p>}
      <table>
        <thead>
          <tr>
            <th>Ruta</th>
            <th>Chofer</th>
            <th>Placa</th>
            <th>Andén</th>
            <th>Se pone en andén</th>
            <th>Salió</th>
            <th>Estado</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {filas.map((v) => (
            <tr key={v.id}>
              <td>{v.ruta_id}</td>
              <td>{v.chofer_id}</td>
              <td>{v.placa}</td>
              <td>{v.anden}</td>
              <td>{formato.format(new Date(v.salida))}</td>
              <td>{v.salio_en ? formato.format(new Date(v.salio_en)) : '—'}</td>
              <td>{v.estado}</td>
              <td>
                {v.estado !== 'cancelado' && !v.salio_en && (
                  <button
                    className="peligro"
                    onClick={() => void cancelar(v)}
                    type="button"
                  >
                    Cancelar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
