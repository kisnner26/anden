import { useState } from 'react';

import { Cajon } from '../componentes/Cajon';
import { Etiqueta } from '../componentes/Etiqueta';
import { Tabla, type Columna, type Filtro } from '../componentes/Tabla';
import { useDatos } from '../DatosContexto';
import { fechaHora, hace } from '../lib/formato';
import { supabase } from '../supabase';
import type { Solicitud } from '../tipos';

const ESTADOS: Record<
  string,
  { texto: string; tono: 'aviso' | 'error' | 'ok' }
> = {
  aprobada: { texto: 'Aprobada', tono: 'ok' },
  en_revision: { texto: 'En revisión', tono: 'aviso' },
  rechazada: { texto: 'Rechazada', tono: 'error' },
};

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
      <span className="micro">{titulo}</span>
      <span>{fallo ? 'No se pudo abrir' : 'Revelar ↗'}</span>
    </button>
  );
}

export function Solicitudes() {
  const d = useDatos();
  const [abierta, establecerAbierta] = useState<Solicitud | null>(null);
  const [sello, establecerSello] = useState<string | null>(null);
  const [mensaje, establecerMensaje] = useState<string | null>(null);

  async function resolver(
    lista: Solicitud[],
    aprobar: boolean,
    limpiar?: () => void,
  ) {
    let fallos = 0;
    for (const s of lista.filter((x) => x.estado === 'en_revision')) {
      const { error } = await supabase!.rpc('resolver_solicitud', {
        p_aprobar: aprobar,
        p_usuario_id: s.usuario_id,
      });
      if (error) fallos += 1;
    }
    establecerMensaje(
      fallos > 0
        ? `${fallos} no se pudieron guardar.`
        : aprobar
          ? 'Aprobadas. Ya son conductores y les llega a su app.'
          : 'Rechazadas.',
    );
    limpiar?.();
    if (abierta) {
      establecerSello(aprobar ? 'APROBADA' : 'RECHAZADA');
      window.setTimeout(() => {
        establecerSello(null);
        establecerAbierta(null);
      }, 1300);
    }
    await d.recargar();
  }

  const columnas: Columna<Solicitud>[] = [
    {
      celda: (s) => (
        <strong>
          {s.nombre} {s.apellido}
        </strong>
      ),
      clave: 'nombre',
      titulo: 'Persona',
      valor: (s) => `${s.nombre} ${s.apellido}`,
    },
    {
      celda: (s) => s.cedula,
      clave: 'cedula',
      titulo: 'Cédula',
      valor: (s) => s.cedula,
    },
    {
      celda: (s) => s.telefono,
      clave: 'telefono',
      titulo: 'Teléfono',
      valor: (s) => s.telefono,
    },
    {
      celda: (s) => (
        <span title={fechaHora(s.creada_en)}>{hace(s.creada_en)}</span>
      ),
      clave: 'fecha',
      titulo: 'Enviada',
      valor: (s) => s.creada_en,
    },
    {
      celda: (s) => (
        <Etiqueta tono={ESTADOS[s.estado]?.tono ?? 'neutro'}>
          {ESTADOS[s.estado]?.texto ?? s.estado}
        </Etiqueta>
      ),
      clave: 'estado',
      titulo: 'Estado',
      valor: (s) => s.estado,
    },
  ];
  const filtros: Filtro<Solicitud>[] = [
    {
      clave: 'rev',
      prueba: (s) => s.estado === 'en_revision',
      titulo: 'En revisión',
    },
    {
      clave: 'apr',
      prueba: (s) => s.estado === 'aprobada',
      titulo: 'Aprobadas',
    },
    {
      clave: 'rec',
      prueba: (s) => s.estado === 'rechazada',
      titulo: 'Rechazadas',
    },
  ];
  return (
    <>
      {mensaje && (
        <p className="aviso" role="status">
          {mensaje}
        </p>
      )}
      <Tabla
        accionesEnLote={(sel, limpiar) => (
          <>
            <button
              className="boton-t primario"
              onClick={() => void resolver(sel, true, limpiar)}
              type="button"
            >
              Aprobar
            </button>
            <button
              className="boton-t peligro"
              onClick={() => void resolver(sel, false, limpiar)}
              type="button"
            >
              Rechazar
            </button>
          </>
        )}
        alAbrir={establecerAbierta}
        columnas={columnas}
        filas={d.solicitudes}
        filtros={filtros}
        idDe={(s) => s.usuario_id}
        nombreArchivo="solicitudes-de-conductor"
        textoDe={(s) => `${s.nombre} ${s.apellido} ${s.cedula} ${s.telefono}`}
        vacio={{
          detalle:
            'Cuando alguien se registre como conductor desde la app, su solicitud aparece acá.',
          titulo: 'Sin solicitudes',
        }}
      />
      <Cajon
        abierto={abierta !== null}
        alCerrar={() => establecerAbierta(null)}
        titulo={abierta ? `${abierta.nombre} ${abierta.apellido}` : ''}
      >
        {abierta && (
          <div className="con-sello">
            {sello && (
              <div className={`sello ${sello === 'APROBADA' ? 'ok' : 'no'}`}>
                {sello}
              </div>
            )}
            <dl className="ficha-datos">
              <div>
                <dt>Cédula</dt>
                <dd>{abierta.cedula}</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>{abierta.telefono}</dd>
              </div>
              <div>
                <dt>Enviada</dt>
                <dd>{fechaHora(abierta.creada_en)}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>{ESTADOS[abierta.estado]?.texto}</dd>
              </div>
            </dl>
            <h3 className="sub">Cédula</h3>
            <div className="fotos">
              <Foto ruta={abierta.foto_frente} titulo="Frente" />
              <Foto ruta={abierta.foto_dorso} titulo="Dorso" />
            </div>
            {abierta.estado === 'en_revision' && (
              <div className="acciones">
                <button
                  className="boton-t primario grande"
                  onClick={() => void resolver([abierta], true)}
                  type="button"
                >
                  Aprobar
                </button>
                <button
                  className="boton-t peligro grande"
                  onClick={() => void resolver([abierta], false)}
                  type="button"
                >
                  Rechazar
                </button>
              </div>
            )}
          </div>
        )}
      </Cajon>
    </>
  );
}
