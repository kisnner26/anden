import { useCallback, useEffect, useState } from 'react';

import { Ingreso } from './Ingreso';
import { Alertas } from './paneles/Alertas';
import { Conductores } from './paneles/Conductores';
import { Encomiendas } from './paneles/Encomiendas';
import { Portada } from './paneles/Portada';
import { Solicitudes } from './paneles/Solicitudes';
import { Viajes } from './paneles/Viajes';
import { supabase } from './supabase';

const SECCIONES = [
  { clave: 'portada', titulo: 'Resumen' },
  { clave: 'solicitudes', titulo: 'Solicitudes' },
  { clave: 'conductores', titulo: 'Conductores' },
  { clave: 'viajes', titulo: 'Viajes' },
  { clave: 'encomiendas', titulo: 'Encomiendas' },
  { clave: 'alertas', titulo: 'Alertas' },
] as const;
type Seccion = (typeof SECCIONES)[number]['clave'];

type Estado = 'cargando' | 'sin-sesion' | 'sin-permiso' | 'listo';

export function App() {
  const [estado, establecerEstado] = useState<Estado>('cargando');
  const [seccion, establecerSeccion] = useState<Seccion>('portada');

  const revisar = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getUser();
    if (!data.user) return establecerEstado('sin-sesion');
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', data.user.id)
      .maybeSingle();
    establecerEstado(perfil?.rol === 'cooperativa' ? 'listo' : 'sin-permiso');
  }, []);

  useEffect(() => {
    void revisar();
  }, [revisar]);

  if (!supabase) {
    return (
      <main className="ingreso">
        <div className="tarjeta ingreso-form">
          <h1>Falta conectar el servidor</h1>
          <p className="suave">
            Copiá <code>.env.example</code> a <code>.env.local</code> y poné la
            dirección y la clave pública de tu proyecto de Supabase.
          </p>
        </div>
      </main>
    );
  }
  if (estado === 'cargando')
    return (
      <main className="ingreso">
        <p className="suave">Cargando…</p>
      </main>
    );
  if (estado === 'sin-sesion')
    return <Ingreso alEntrar={() => void revisar()} />;
  if (estado === 'sin-permiso') {
    return (
      <main className="ingreso">
        <div className="tarjeta ingreso-form">
          <h1>Esta cuenta no es de la cooperativa</h1>
          <p className="suave">
            Pedí que le den el rol con{' '}
            <code>select public.hacer_cooperativa('tu.usuario');</code> en el
            editor de SQL de Supabase.
          </p>
          <button
            className="primario"
            onClick={() =>
              void supabase?.auth
                .signOut()
                .then(() => establecerEstado('sin-sesion'))
            }
            type="button"
          >
            Salir
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="marco">
      <aside className="lateral">
        <p className="etiqueta">ANDÉN</p>
        <h2>Cooperativa</h2>
        <nav>
          {SECCIONES.map((s) => (
            <button
              aria-current={seccion === s.clave ? 'page' : undefined}
              key={s.clave}
              onClick={() => establecerSeccion(s.clave)}
              type="button"
            >
              {s.titulo}
            </button>
          ))}
        </nav>
        <button
          className="salir"
          onClick={() =>
            void supabase?.auth
              .signOut()
              .then(() => establecerEstado('sin-sesion'))
          }
          type="button"
        >
          Cerrar sesión
        </button>
      </aside>
      <main className="contenido">
        {seccion === 'portada' && <Portada />}
        {seccion === 'solicitudes' && <Solicitudes />}
        {seccion === 'conductores' && <Conductores />}
        {seccion === 'viajes' && <Viajes />}
        {seccion === 'encomiendas' && <Encomiendas />}
        {seccion === 'alertas' && <Alertas />}
      </main>
    </div>
  );
}
