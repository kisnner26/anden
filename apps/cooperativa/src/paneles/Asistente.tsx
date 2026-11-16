import { useState } from 'react';

import { useDatos } from '../DatosContexto';
import {
  codigoDelPuente,
  contextoDeCooperativa,
  DIRECCION_POR_DEFECTO,
  direccionDelPuente,
  instruccionesDeCooperativa,
  preguntarAClaude,
  type ConexionClaude,
} from '../lib/claude';

const CLAVE = 'anden.puenteClaude';

const SUGERENCIAS = [
  '¿Cómo va el día?',
  '¿Qué conductor cobró más?',
  '¿Hay algo que deba atender ahora?',
];

interface Intercambio {
  id: number;
  pregunta: string;
  respuesta?: string;
  error?: string;
}

/** la conexión se guarda solo mientras la pestaña está abierta: el código da acceso a Claude de esa Mac */
function leerConexion(): ConexionClaude | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    if (!crudo) return null;
    const { codigo, direccion } = JSON.parse(crudo) as Partial<ConexionClaude>;
    const d = direccionDelPuente(direccion ?? '');
    const c = codigoDelPuente(codigo ?? '');
    return d && c ? { codigo: c, direccion: d } : null;
  } catch {
    return null;
  }
}

/** pregunta a Claude Code, con la suscripción de quien corre el puente, sobre los datos de la operación */
export function Asistente() {
  const d = useDatos();
  const [conexion, establecerConexion] = useState(leerConexion);
  const [direccion, establecerDireccion] = useState(
    conexion?.direccion ?? DIRECCION_POR_DEFECTO,
  );
  const [codigo, establecerCodigo] = useState('');
  const [problema, establecerProblema] = useState('');
  const [probando, establecerProbando] = useState(false);
  const [pregunta, establecerPregunta] = useState('');
  const [pensando, establecerPensando] = useState(false);
  const [historial, establecerHistorial] = useState<Intercambio[]>([]);

  async function conectar() {
    const dir = direccionDelPuente(direccion);
    const cod = codigoDelPuente(codigo);
    if (!dir || !cod) {
      establecerProblema(
        'Revisá la dirección (con el puerto, por ejemplo http://127.0.0.1:4780) y el código de 48 caracteres.',
      );
      return;
    }
    establecerProbando(true);
    establecerProblema('');
    try {
      const respuesta = await fetch(`${dir}/estado`, {
        headers: { Authorization: `Bearer ${cod}` },
      });
      if (respuesta.status === 401)
        throw new Error('El código de emparejamiento no es el correcto.');
      if (!respuesta.ok) throw new Error('El puente no respondió bien.');
      const nueva = { codigo: cod, direccion: dir };
      sessionStorage.setItem(CLAVE, JSON.stringify(nueva));
      establecerConexion(nueva);
      establecerCodigo('');
    } catch (e) {
      establecerProblema(
        e instanceof Error && e.message !== 'Failed to fetch'
          ? e.message
          : 'No se pudo hablar con el puente. Revisá que esté encendido.',
      );
    } finally {
      establecerProbando(false);
    }
  }

  function desconectar() {
    sessionStorage.removeItem(CLAVE);
    establecerConexion(null);
    establecerHistorial([]);
  }

  async function preguntar(texto: string) {
    const limpia = texto.trim();
    if (!conexion || limpia === '' || pensando) return;
    const id = Date.now();
    establecerPensando(true);
    establecerPregunta('');
    try {
      const respuesta = await preguntarAClaude(
        conexion,
        instruccionesDeCooperativa(contextoDeCooperativa(d)),
        limpia,
      );
      establecerHistorial((h) => [...h, { id, pregunta: limpia, respuesta }]);
    } catch (e) {
      establecerHistorial((h) => [
        ...h,
        {
          error: e instanceof Error ? e.message : 'No se pudo preguntar.',
          id,
          pregunta: limpia,
        },
      ]);
    } finally {
      establecerPensando(false);
    }
  }

  if (!conexion) {
    return (
      <section className="panel claude-panel">
        <div className="panel-cabeza">
          <h2>Conectar con Claude Code</h2>
        </div>
        <p className="claude-nota">
          En la Mac donde tenés Claude Code con tu suscripción, corré{' '}
          <code>pnpm --filter @anden/puente-claude iniciar</code>. Te muestra la
          dirección y un código de emparejamiento: pegalos acá.
        </p>
        <form
          className="claude-form"
          onSubmit={(e) => {
            e.preventDefault();
            void conectar();
          }}
        >
          <label>
            <span className="micro">Dirección</span>
            <input
              onChange={(e) => establecerDireccion(e.target.value)}
              placeholder={DIRECCION_POR_DEFECTO}
              value={direccion}
            />
          </label>
          <label>
            <span className="micro">Código de emparejamiento</span>
            <input
              autoComplete="off"
              onChange={(e) => establecerCodigo(e.target.value)}
              type="password"
              value={codigo}
            />
          </label>
          <button
            className="boton-t primario"
            disabled={probando}
            type="submit"
          >
            {probando ? 'Conectando…' : 'Conectar'}
          </button>
        </form>
        {problema !== '' && (
          <p className="claude-problema" role="alert">
            {problema}
          </p>
        )}
        <p className="claude-nota">
          Claude responde sin herramientas ni archivos, solo con un resumen
          numérico de la operación: sin nombres de pasajeros, cédulas ni
          teléfonos. El código se guarda solo mientras esta pestaña esté
          abierta.
        </p>
      </section>
    );
  }

  return (
    <section className="panel claude-panel">
      <div className="panel-cabeza">
        <h2>Claude Code</h2>
        <button className="boton-t" onClick={desconectar} type="button">
          Desconectar
        </button>
      </div>
      <p className="claude-nota">
        Conectado a <code>{conexion.direccion}</code>. Claude contesta con los
        números de hoy de la cooperativa.
      </p>
      <div className="claude-sugerencias">
        {SUGERENCIAS.map((s) => (
          <button
            className="boton-t"
            disabled={pensando}
            key={s}
            onClick={() => void preguntar(s)}
            type="button"
          >
            {s}
          </button>
        ))}
      </div>
      <ol aria-live="polite" className="claude-historial">
        {historial.map((x) => (
          <li key={x.id}>
            <p className="claude-pregunta">{x.pregunta}</p>
            {x.respuesta !== undefined ? (
              <p className="claude-respuesta">{x.respuesta}</p>
            ) : (
              <p className="claude-problema">{x.error}</p>
            )}
          </li>
        ))}
        {pensando && <li className="claude-nota">Claude está pensando…</li>}
      </ol>
      <form
        className="claude-pedir"
        onSubmit={(e) => {
          e.preventDefault();
          void preguntar(pregunta);
        }}
      >
        <input
          aria-label="Tu pregunta para Claude"
          maxLength={600}
          onChange={(e) => establecerPregunta(e.target.value)}
          placeholder="Preguntá sobre la operación"
          value={pregunta}
        />
        <button
          className="boton-t primario"
          disabled={pensando || pregunta.trim() === ''}
          type="submit"
        >
          Preguntar
        </button>
      </form>
    </section>
  );
}
