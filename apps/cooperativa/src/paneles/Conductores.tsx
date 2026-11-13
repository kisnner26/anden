import { useState } from 'react';

import { Cajon } from '../componentes/Cajon';
import { Tabla, type Columna } from '../componentes/Tabla';
import { useDatos } from '../DatosContexto';
import { dinero, fechaCorta, fechaHora } from '../lib/formato';
import { nombreRuta } from '../lib/ruta';
import type { Perfil } from '../tipos';

export function Conductores() {
  const d = useDatos();
  const [abierto, establecerAbierto] = useState<Perfil | null>(null);
  const conductores = d.perfiles.filter((p) => p.rol === 'conductor');
  const stats = (codigo: string | null) => {
    const cierres = d.cierres.filter((c) => c.chofer_id === codigo);
    return {
      cobrado: cierres.reduce((s, c) => s + c.cobrado, 0),
      pasajeros: cierres.reduce((s, c) => s + c.pasajeros, 0),
      viajes: d.viajes.filter((v) => v.chofer_id === codigo).length,
    };
  };
  const publico = (codigo: string | null) =>
    d.choferes.find((c) => c.chofer_id === codigo);

  const columnas: Columna<Perfil>[] = [
    {
      celda: (p) => (
        <span className="persona">
          <span className="avatar">
            {publico(p.chofer_id)?.foto_url ? (
              <img alt="" src={publico(p.chofer_id)?.foto_url ?? ''} />
            ) : (
              p.nombre.slice(0, 1)
            )}
          </span>
          <strong>{publico(p.chofer_id)?.nombre ?? p.nombre}</strong>
        </span>
      ),
      clave: 'nombre',
      titulo: 'Conductor',
      valor: (p) => publico(p.chofer_id)?.nombre ?? p.nombre,
    },
    {
      celda: (p) => <code>{p.chofer_id ?? '—'}</code>,
      clave: 'codigo',
      titulo: 'Código',
      valor: (p) => p.chofer_id,
    },
    {
      celda: (p) => (p.usuario ? `@${p.usuario}` : '—'),
      clave: 'usuario',
      titulo: 'Usuario',
      valor: (p) => p.usuario,
    },
    {
      celda: (p) => stats(p.chofer_id).viajes,
      clave: 'viajes',
      titulo: 'Viajes',
      valor: (p) => stats(p.chofer_id).viajes,
    },
    {
      celda: (p) => stats(p.chofer_id).pasajeros,
      clave: 'pasajeros',
      titulo: 'Pasajeros',
      valor: (p) => stats(p.chofer_id).pasajeros,
    },
    {
      celda: (p) => dinero(stats(p.chofer_id).cobrado),
      clave: 'cobrado',
      titulo: 'Cobrado',
      valor: (p) => stats(p.chofer_id).cobrado,
    },
    {
      celda: (p) => fechaCorta(p.creado_en),
      clave: 'alta',
      oculta: true,
      titulo: 'Alta',
      valor: (p) => p.creado_en,
    },
  ];
  const viajes = abierto
    ? d.viajes
        .filter((v) => v.chofer_id === abierto.chofer_id)
        .sort((a, b) => b.salida.localeCompare(a.salida))
        .slice(0, 8)
    : [];
  return (
    <>
      <Tabla
        alAbrir={establecerAbierto}
        columnas={columnas}
        filas={conductores}
        idDe={(p) => p.id}
        nombreArchivo="conductores"
        textoDe={(p) => `${p.nombre} ${p.usuario ?? ''} ${p.chofer_id ?? ''}`}
        vacio={{
          detalle: 'Cuando apruebes una solicitud, el conductor aparece acá.',
          titulo: 'Sin conductores aprobados',
        }}
      />
      <Cajon
        abierto={abierto !== null}
        alCerrar={() => establecerAbierto(null)}
        titulo={
          abierto ? (publico(abierto.chofer_id)?.nombre ?? abierto.nombre) : ''
        }
      >
        {abierto && (
          <>
            <div className="licencia">
              <div className="licencia-cabeza">
                <span>LICENCIA ANDÉN</span>
                <i className="chip-ic" />
              </div>
              <p className="licencia-nombre">
                {publico(abierto.chofer_id)?.nombre ?? abierto.nombre}
              </p>
              <p className="micro">
                {abierto.chofer_id} · @{abierto.usuario}
              </p>
              <i className="holograma" />
            </div>
            <dl className="ficha-datos">
              <div>
                <dt>Cobrado</dt>
                <dd>{dinero(stats(abierto.chofer_id).cobrado)}</dd>
              </div>
              <div>
                <dt>Pasajeros</dt>
                <dd>{stats(abierto.chofer_id).pasajeros}</dd>
              </div>
              <div>
                <dt>Viajes publicados</dt>
                <dd>{stats(abierto.chofer_id).viajes}</dd>
              </div>
              <div>
                <dt>Alta</dt>
                <dd>{fechaHora(abierto.creado_en)}</dd>
              </div>
            </dl>
            <h3 className="sub">Viajes recientes</h3>
            {viajes.length === 0 ? (
              <p className="micro">Todavía no publicó viajes.</p>
            ) : (
              <ul className="lista-simple">
                {viajes.map((v) => (
                  <li key={v.id}>
                    <span>{nombreRuta(v.ruta_id)}</span>
                    <span>{fechaHora(v.salida)}</span>
                    <span>{v.placa}</span>
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
