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
  { clave: 'portada', titulo: 'Tablero' },
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
        <div className="ingreso-form">
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
        <div className="ingreso-form">
          <h1>Esta cuenta no es de la cooperativa</h1>
          <p className="suave">
            Pedí que le den el rol con{' '}
            <code>select public.hacer_cooperativa('tu.usuario');</code> en el
            editor de SQL de Supabase.
          </p>
          <button
            className="boton-ed"
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

  const salir = () =>
    void supabase?.auth.signOut().then(() => establecerEstado('sin-sesion'));
  const indice = SECCIONES.findIndex((s) => s.clave === seccion) + 1;

  return (
    <div className="marco">
      <header className="barra">
        <div className="marca">
          <span className="display marca-a">ANDÉN</span>
          <span className="micro">COOPERATIVA · TORRE DE CONTROL</span>
        </div>
        <nav aria-label="Secciones" className="pestanas">
          {SECCIONES.map((s, i) => (
            <button
              aria-current={seccion === s.clave ? 'page' : undefined}
              key={s.clave}
              onClick={() => establecerSeccion(s.clave)}
              type="button"
            >
              <span className="micro">{String(i + 1).padStart(2, '0')}</span>
              {s.titulo}
            </button>
          ))}
        </nav>
        <div className="estado">
          <span className="micro">
            <span className="punto-vivo" /> EN VIVO
          </span>
          <button className="salir" onClick={salir} type="button">
            SALIR
          </button>
        </div>
      </header>
      <main className="contenido" key={seccion}>
        {seccion === 'portada' && (
          <Portada irA={(s) => establecerSeccion(s as Seccion)} />
        )}
        {seccion === 'solicitudes' && <Solicitudes />}
        {seccion === 'conductores' && <Conductores />}
        {seccion === 'viajes' && <Viajes />}
        {seccion === 'encomiendas' && <Encomiendas />}
        {seccion === 'alertas' && <Alertas />}
      </main>
      <footer className="pie">
        <span className="micro">
          {String(indice).padStart(2, '0')} /{' '}
          {String(SECCIONES.length).padStart(2, '0')}
        </span>
        <span className="micro">LA RUTA, AL DÍA.</span>
      </footer>
    </div>
  );
}
