import { enlaceDeMapa } from '@anden/dominio';
import { useState } from 'react';

import { Cajon } from '../componentes/Cajon';
import { Etiqueta } from '../componentes/Etiqueta';
import { Medidor } from '../componentes/Medidor';
import { Tabla, type Columna, type Filtro } from '../componentes/Tabla';
import { useDatos } from '../DatosContexto';
import { vendidosDe } from '../lib/analitica';
import { fechaHora, minutosEntre } from '../lib/formato';
import { nombreRuta, ocupacion } from '../lib/ruta';
import { supabase } from '../supabase';
import type { Viaje } from '../tipos';

const estadoDe = (v: Viaje) =>
  v.estado === 'cancelado' ? 'Cancelado' : v.salio_en ? 'Salió' : 'Esperando';

export function Viajes() {
  const d = useDatos();
  const [abierto, establecerAbierto] = useState<Viaje | null>(null);
  const [mensaje, establecerMensaje] = useState<string | null>(null);

  const columnas: Columna<Viaje>[] = [
    {
      celda: (v) => <strong>{nombreRuta(v.ruta_id)}</strong>,
      clave: 'ruta',
      titulo: 'Ruta',
      valor: (v) => nombreRuta(v.ruta_id),
    },
    {
      celda: (v) => fechaHora(v.salida),
      clave: 'puesta',
      titulo: 'Se puso en andén',
      valor: (v) => v.salida,
    },
    {
      celda: (v) => (v.salio_en ? fechaHora(v.salio_en) : '—'),
      clave: 'salio',
      titulo: 'Salió',
      valor: (v) => v.salio_en,
    },
    {
      celda: (v) =>
        v.salio_en ? `${minutosEntre(v.salida, v.salio_en)} min` : '—',
      clave: 'espera',
      oculta: true,
      titulo: 'Espera',
      valor: (v) => (v.salio_en ? minutosEntre(v.salida, v.salio_en) : null),
    },
    {
      celda: (v) =>
        v.punto_encuentro ? (
          <a
            className="enlace"
            href={enlaceDeMapa(v.punto_encuentro) ?? undefined}
            onClick={(e) => e.stopPropagation()}
            rel="noreferrer"
            target="_blank"
          >
            {v.punto_encuentro}
          </a>
        ) : (
          <span className="micro">Por confirmar</span>
        ),
      clave: 'punto',
      titulo: 'Punto de encuentro',
      valor: (v) => v.punto_encuentro ?? '',
    },
    {
      celda: (v) => v.placa,
      clave: 'placa',
      titulo: 'Placa',
      valor: (v) => v.placa,
    },
    {
      celda: (v) => v.chofer_id,
      clave: 'chofer',
      titulo: 'Chofer',
      valor: (v) => v.chofer_id,
    },
    {
      celda: (v) => v.servicio,
      clave: 'servicio',
      oculta: true,
      titulo: 'Servicio',
      valor: (v) => v.servicio,
    },
    {
      celda: (v) => {
        const o = ocupacion(vendidosDe(d.boletos, v.id), v.servicio);
        return <Medidor fraccion={o.fraccion} texto={o.texto} />;
      },
      clave: 'ocupacion',
      titulo: 'Asientos',
      valor: (v) => vendidosDe(d.boletos, v.id),
    },
    {
      celda: (v) => (
        <Etiqueta
          tono={v.estado === 'cancelado' ? 'error' : v.salio_en ? 'azul' : 'ok'}
        >
          {estadoDe(v)}
        </Etiqueta>
      ),
      clave: 'estado',
      titulo: 'Estado',
      valor: estadoDe,
    },
  ];
  const filtros: Filtro<Viaje>[] = [
    {
      clave: 'espera',
      prueba: (v) => estadoDe(v) === 'Esperando',
      titulo: 'Esperando',
    },
    {
      clave: 'salio',
      prueba: (v) => estadoDe(v) === 'Salió',
      titulo: 'Salieron',
    },
    {
      clave: 'cancelado',
      prueba: (v) => estadoDe(v) === 'Cancelado',
      titulo: 'Cancelados',
    },
  ];

  async function cancelar(lista: Viaje[], limpiar: () => void) {
    const { error } = await supabase!
      .from('viajes')
      .update({ estado: 'cancelado' })
      .in(
        'id',
        lista.map((v) => v.id),
      );
    establecerMensaje(
      error
        ? `No se pudo cancelar: ${error.message}`
        : `${lista.length} ${lista.length === 1 ? 'viaje cancelado' : 'viajes cancelados'}. Los pasajeros lo ven al instante.`,
    );
    limpiar();
    await d.recargar();
  }

  const boletos = abierto
    ? d.boletos.filter(
        (b) => b.viaje_id === abierto.id && b.estado !== 'cancelado',
      )
    : [];
  return (
    <>
      {mensaje && (
        <p className="aviso" role="status">
          {mensaje}
        </p>
      )}
      <Tabla
        accionesEnLote={(sel, limpiar) => (
          <button
            className="boton-t peligro"
            onClick={() =>
              void cancelar(
                sel.filter((v) => !v.salio_en && v.estado !== 'cancelado'),
                limpiar,
              )
            }
            type="button"
          >
            Cancelar viajes
          </button>
        )}
        alAbrir={establecerAbierto}
        columnas={columnas}
        filas={d.viajes}
        filtros={filtros}
        idDe={(v) => v.id}
        nombreArchivo="viajes"
        textoDe={(v) =>
          `${nombreRuta(v.ruta_id)} ${v.placa} ${v.chofer_id} ${estadoDe(v)}`
        }
        vacio={{
          detalle: 'Cuando un conductor publique un viaje aparece acá.',
          titulo: 'Sin viajes todavía',
        }}
      />
      <Cajon
        abierto={abierto !== null}
        alCerrar={() => establecerAbierto(null)}
        titulo={abierto ? nombreRuta(abierto.ruta_id) : ''}
      >
        {abierto && (
          <>
            <dl className="ficha-datos">
              <div>
                <dt>Se puso en andén</dt>
                <dd>{fechaHora(abierto.salida)}</dd>
              </div>
              <div>
                <dt>Salió</dt>
                <dd>
                  {abierto.salio_en
                    ? fechaHora(abierto.salio_en)
                    : 'Todavía no'}
                </dd>
              </div>
              <div>
                <dt>Placa</dt>
                <dd>{abierto.placa}</dd>
              </div>
              <div>
                <dt>Punto de encuentro</dt>
                <dd>
                  {abierto.punto_encuentro ? (
                    <a
                      className="enlace"
                      href={enlaceDeMapa(abierto.punto_encuentro) ?? undefined}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {abierto.punto_encuentro} · abrir en el mapa
                    </a>
                  ) : (
                    'Por confirmar'
                  )}
                </dd>
              </div>
              <div>
                <dt>Chofer</dt>
                <dd>{abierto.chofer_id}</dd>
              </div>
              <div>
                <dt>Servicio</dt>
                <dd>{abierto.servicio}</dd>
              </div>
            </dl>
            <h3 className="sub">Pasajeros ({boletos.length})</h3>
            {boletos.length === 0 ? (
              <p className="micro">Nadie reservó este viaje.</p>
            ) : (
              <ul className="lista-simple">
                {boletos
                  .sort((a, b) => a.asiento - b.asiento)
                  .map((b) => (
                    <li key={b.boleto_id}>
                      <span>Asiento {b.asiento}</span>
                      <span>
                        {b.contenido?.boleto?.pasajero?.nombre ?? 'Pasajero'}
                      </span>
                      {b.contenido?.resumen?.plus && (
                        <Etiqueta tono="aviso">Plus</Etiqueta>
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </>
        )}
      </Cajon>
    </>
  );
}
