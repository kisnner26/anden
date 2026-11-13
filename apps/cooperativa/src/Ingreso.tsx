import { useState } from 'react';

import { Bus } from './svg/Bus';
import { supabase } from './supabase';

export function Ingreso({ alEntrar }: { alEntrar: () => void }) {
  const [usuario, establecerUsuario] = useState('');
  const [clave, establecerClave] = useState('');
  const [error, establecerError] = useState<string | null>(null);
  const [cargando, establecerCargando] = useState(false);

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!supabase) return;
    establecerCargando(true);
    establecerError(null);
    // el correo se arma igual que en la app: el servidor lo resuelve a partir del usuario
    const { data: correo } = await supabase.rpc('correo_de_acceso', {
      p_identificador: usuario,
    });
    const { error: falla } = await supabase.auth.signInWithPassword({
      email: String(correo ?? ''),
      password: clave,
    });
    establecerCargando(false);
    if (falla) establecerError('Usuario o contraseña incorrectos.');
    else alEntrar();
  }

  return (
    <main className="ingreso">
      <div className="ingreso-fondo" aria-hidden="true" />
      <div aria-hidden="true" className="ingreso-bus">
        <Bus />
      </div>
      <section className="ingreso-texto">
        <p className="micro">Andén · cooperativa</p>
        <h1 className="titular">Torre de control.</h1>
        <p className="lead">
          Pasajeros, conductores y encomiendas en un solo tablero, al instante.
        </p>
      </section>
      <form className="ingreso-form" onSubmit={(e) => void entrar(e)}>
        <label>
          <span className="micro">Usuario</span>
          <input
            autoComplete="username"
            onChange={(e) => establecerUsuario(e.target.value)}
            value={usuario}
          />
        </label>
        <label>
          <span className="micro">Contraseña</span>
          <input
            autoComplete="current-password"
            onChange={(e) => establecerClave(e.target.value)}
            type="password"
            value={clave}
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button
          className="boton-ed"
          disabled={cargando || usuario === '' || clave === ''}
          type="submit"
        >
          {cargando ? 'Entrando…' : 'Entrar ↗'}
        </button>
      </form>
    </main>
  );
}
