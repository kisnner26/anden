import { useState } from 'react';

import { Etiqueta, type Tono } from '../componentes/Etiqueta';
import { Tabla, type Columna, type Filtro } from '../componentes/Tabla';
import { useDatos } from '../DatosContexto';
import { hace } from '../lib/formato';
import { Paquete } from '../svg/Iconos';
import type { Encomienda } from '../tipos';

const ETAPAS = ['solicitada', 'aceptada', 'recibida', 'entregada'] as const;
const NOMBRES: Record<string, { texto: string; tono: Tono }> = {
  aceptada: { texto: 'Aceptada', tono: 'azul' },
  cancelada: { texto: 'Cancelada', tono: 'neutro' },
  entregada: { texto: 'Entregada', tono: 'ok' },
  recibida: { texto: 'En el bus', tono: 'aviso' },
  rechazada: { texto: 'Rechazada', tono: 'error' },
  solicitada: { texto: 'Solicitada', tono: 'neutro' },
};

function Recorrido({ estado }: { estado: string }) {
  const paso = Math.max(0, ETAPAS.indexOf(estado as (typeof ETAPAS)[number]));
  return (
    <div aria-label={NOMBRES[estado]?.texto} className="recorrido" role="img">
      <div className="recorrido-pista">
        <i style={{ width: `${(paso / 3) * 100}%` }} />
      </div>
      {ETAPAS.map((e, i) => (
        <span
          className={`parada${i <= paso ? ' hecha' : ''}`}
          key={e}
          style={{ left: `${(i / 3) * 100}%` }}
        />
      ))}
      <span
        className="recorrido-punto"
        style={{ left: `${(paso / 3) * 100}%` }}
      />
    </div>
  );
}

export function Encomiendas() {
  const d = useDatos();
  const [vista, establecerVista] = useState<'tabla' | 'tablero'>('tabla');
  const columnas: Columna<Encomienda>[] = [
    {
      celda: (e) => <code>{e.contenido.codigo}</code>,
      clave: 'codigo',
      titulo: 'Código',
      valor: (e) => e.contenido.codigo,
    },
    {
      celda: (e) => (
        <span className="persona">
          <span className="mini">
            <Paquete tamano={e.contenido.tamano} />
          </span>
          {e.contenido.origen} → {e.contenido.destino}
        </span>
      ),
      clave: 'trayecto',
      titulo: 'Trayecto',
      valor: (e) => `${e.contenido.origen} ${e.contenido.destino}`,
    },
    {
      celda: (e) => e.contenido.descripcion,
      clave: 'detalle',
      titulo: 'Qué lleva',
      valor: (e) => e.contenido.descripcion,
    },
    {
      celda: (e) => e.contenido.tamano,
      clave: 'tamano',
      oculta: true,
      titulo: 'Tamaño',
      valor: (e) => e.contenido.tamano,
    },
    {
      celda: (e) => e.chofer_id ?? '—',
      clave: 'chofer',
      titulo: 'Chofer',
      valor: (e) => e.chofer_id,
    },
    {
      celda: (e) => <Recorrido estado={e.estado} />,
      clave: 'recorrido',
      titulo: 'Recorrido',
      ancho: '180px',
    },
    {
      celda: (e) => (
        <Etiqueta tono={NOMBRES[e.estado]?.tono}>
          {NOMBRES[e.estado]?.texto ?? e.estado}
        </Etiqueta>
      ),
      clave: 'estado',
      titulo: 'Estado',
      valor: (e) => e.estado,
    },
    {
      celda: (e) => e.motivo ?? '—',
      clave: 'motivo',
      oculta: true,
      titulo: 'Motivo',
      valor: (e) => e.motivo,
    },
    {
      celda: (e) => hace(e.actualizada_en),
      clave: 'cuando',
      titulo: 'Actualizada',
      valor: (e) => e.actualizada_en,
    },
  ];
  const filtros: Filtro<Encomienda>[] = [
    ...ETAPAS.map((x) => ({
      clave: x,
      prueba: (e: Encomienda) => e.estado === x,
      titulo: NOMBRES[x]?.texto ?? x,
    })),
    {
      clave: 'rechazada',
      prueba: (e) => e.estado === 'rechazada' || e.estado === 'cancelada',
      titulo: 'Rechazadas o canceladas',
    },
  ];
  return (
    <>
      <div className="conmutador" role="tablist">
        <button
          aria-selected={vista === 'tabla'}
          onClick={() => establecerVista('tabla')}
          role="tab"
          type="button"
        >
          Tabla
        </button>
        <button
          aria-selected={vista === 'tablero'}
          onClick={() => establecerVista('tablero')}
          role="tab"
          type="button"
        >
          Tablero
        </button>
      </div>
      {vista === 'tabla' ? (
        <Tabla
          columnas={columnas}
          filas={d.encomiendas}
          filtros={filtros}
          idDe={(e) => e.id}
          nombreArchivo="encomiendas"
          textoDe={(e) =>
            `${e.contenido.codigo} ${e.contenido.origen} ${e.contenido.destino} ${e.contenido.descripcion} ${e.chofer_id ?? ''}`
          }
          vacio={{
            detalle:
              'Cuando un pasajero envíe una encomienda, aparece acá y avanza cuando el chofer la responde.',
            titulo: 'Sin encomiendas',
          }}
        />
      ) : (
        <div className="kanban">
          {ETAPAS.map((etapa) => {
            const lista = d.encomiendas.filter((e) => e.estado === etapa);
            return (
              <section className="kanban-col" key={etapa}>
                <h2>
                  {NOMBRES[etapa]?.texto} <span>{lista.length}</span>
                </h2>
                {lista.map((e, i) => (
                  <article
                    className="ficha"
                    key={e.id}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <span className="mini grande">
                      <Paquete tamano={e.contenido.tamano} />
                    </span>
                    <div>
                      <p className="micro">
                        {e.contenido.codigo} · {e.chofer_id ?? 'sin chofer'}
                      </p>
                      <p>
                        {e.contenido.origen} → {e.contenido.destino}
                      </p>
                      <p className="micro">{e.contenido.descripcion}</p>
                    </div>
                  </article>
                ))}
                {lista.length === 0 && <p className="micro">Vacío</p>}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
