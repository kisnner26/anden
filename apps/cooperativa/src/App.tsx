import { useCallback, useEffect, useMemo, useState } from 'react';

import { Paleta, type Comando } from './componentes/Paleta';
import { Reloj } from './componentes/Reloj';
import { IconoNav } from './componentes/IconoNav';
import { ProveedorDatos, useDatos } from './DatosContexto';
import { Ingreso } from './Ingreso';
import { guardarAjustes, leerAjustes, type AjustesPanel } from './lib/ajustes';
import { Actividad } from './paneles/Actividad';
import { Alertas } from './paneles/Alertas';
import { Conductores } from './paneles/Conductores';
import { Encomiendas } from './paneles/Encomiendas';
import { EnVivo } from './paneles/EnVivo';
import { Finanzas } from './paneles/Finanzas';
import { Pasajeros } from './paneles/Pasajeros';
import { Solicitudes } from './paneles/Solicitudes';
import { Tablero } from './paneles/Tablero';
import { Viajes } from './paneles/Viajes';
import { supabase } from './supabase';
import { Bus } from './svg/Bus';

const SECCIONES = [
  {
    clave: 'tablero',
    descripcion: 'Cómo va el día, de un vistazo.',
    grupo: 'Operación',
    titulo: 'Tablero',
  },
  {
    clave: 'envivo',
    descripcion: 'Los buses en camino y los andenes, ahora mismo.',
    grupo: 'Operación',
    titulo: 'En vivo',
  },
  {
    clave: 'viajes',
    descripcion: 'Todos los viajes que publican los conductores.',
    grupo: 'Operación',
    titulo: 'Viajes',
  },
  {
    clave: 'encomiendas',
    descripcion: 'Los paquetes que viajan en los buses.',
    grupo: 'Operación',
    titulo: 'Encomiendas',
  },
  {
    clave: 'conductores',
    descripcion: 'Quiénes manejan, con lo que cobraron y llevaron.',
    grupo: 'Personas',
    titulo: 'Conductores',
  },
  {
    clave: 'solicitudes',
    descripcion: 'Quién pide ser conductor: revisá la cédula y decidí.',
    grupo: 'Personas',
    titulo: 'Solicitudes',
  },
  {
    clave: 'pasajeros',
    descripcion: 'Las reservas de los pasajeros y su pago.',
    grupo: 'Personas',
    titulo: 'Pasajeros',
  },
  {
    clave: 'finanzas',
    descripcion: 'Lo cobrado, por día, por conductor y por cierre.',
    grupo: 'Análisis',
    titulo: 'Finanzas',
  },
  {
    clave: 'actividad',
    descripcion: 'Una línea de tiempo con todo lo que pasó en la red.',
    grupo: 'Análisis',
    titulo: 'Actividad',
  },
  {
    clave: 'alertas',
    descripcion: 'Posibles choques detectados por los teléfonos.',
    grupo: 'Seguridad',
    titulo: 'Alertas',
  },
] as const;
type Seccion = (typeof SECCIONES)[number]['clave'];

type Estado = 'cargando' | 'sin-sesion' | 'sin-permiso' | 'listo';

function Armazon({ alSalir }: { alSalir: () => void }) {
  const d = useDatos();
  const [seccion, establecerSeccion] = useState<Seccion>('tablero');
  const [ajustes, establecerAjustes] = useState<AjustesPanel>(leerAjustes);
  const [paleta, establecerPaleta] = useState(false);
  const [menuAjustes, establecerMenuAjustes] = useState(false);

  const cambiarAjustes = useCallback((cambios: Partial<AjustesPanel>) => {
    establecerAjustes((previos) => {
      const nuevos = { ...previos, ...cambios };
      guardarAjustes(nuevos);
      return nuevos;
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.tema = ajustes.tema;
    document.documentElement.dataset.densidad = ajustes.densidad;
  }, [ajustes.densidad, ajustes.tema]);

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        establecerPaleta((a) => !a);
      }
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, []);

  const conteos: Partial<Record<Seccion, number>> = {
    alertas: d.alertas.filter((a) => !a.atendida).length,
    encomiendas: d.encomiendas.filter((e) =>
      ['solicitada', 'aceptada', 'recibida'].includes(e.estado),
    ).length,
    solicitudes: d.solicitudes.filter((s) => s.estado === 'en_revision').length,
    viajes: d.viajes.filter((v) => v.estado !== 'cancelado' && !v.salio_en)
      .length,
  };

  const comandos = useMemo<Comando[]>(
    () => [
      ...SECCIONES.map((s) => ({
        clave: `ir-${s.clave}`,
        ejecutar: () => establecerSeccion(s.clave),
        grupo: 'Ir a',
        titulo: s.titulo,
      })),
      {
        clave: 'tema',
        ejecutar: () =>
          cambiarAjustes({
            tema: ajustes.tema === 'oscuro' ? 'claro' : 'oscuro',
          }),
        grupo: 'Ajuste',
        titulo:
          ajustes.tema === 'oscuro'
            ? 'Cambiar a tema claro'
            : 'Cambiar a tema oscuro',
      },
      {
        clave: 'densidad',
        ejecutar: () =>
          cambiarAjustes({
            densidad: ajustes.densidad === 'compacta' ? 'comoda' : 'compacta',
          }),
        grupo: 'Ajuste',
        titulo:
          ajustes.densidad === 'compacta'
            ? 'Usar densidad cómoda'
            : 'Usar densidad compacta',
      },
      {
        clave: 'salir',
        ejecutar: alSalir,
        grupo: 'Cuenta',
        titulo: 'Cerrar sesión',
      },
      ...d.perfiles
        .filter((p) => p.rol === 'conductor')
        .map((p) => ({
          clave: `c-${p.id}`,
          ejecutar: () => establecerSeccion('conductores'),
          grupo: 'Conductor',
          titulo: `${p.nombre} (${p.chofer_id ?? ''})`,
        })),
      ...d.viajes.map((v) => ({
        clave: `v-${v.id}`,
        ejecutar: () => establecerSeccion('viajes'),
        grupo: 'Viaje',
        titulo: `${v.placa} · ${v.ruta_id.replace('rut_', '').replace('_', ' → ')}`,
      })),
    ],
    [
      ajustes.densidad,
      ajustes.tema,
      alSalir,
      cambiarAjustes,
      d.perfiles,
      d.viajes,
    ],
  );

  const actual = SECCIONES.find((s) => s.clave === seccion) ?? SECCIONES[0];
  const grupos = [...new Set(SECCIONES.map((s) => s.grupo))];
  const alertasPendientes = conteos.alertas ?? 0;

  return (
    <div className={`shell${ajustes.menuAbierto ? '' : ' menu-cerrado'}`}>
      <header className="cabecera">
        <button
          aria-label={ajustes.menuAbierto ? 'Cerrar el menú' : 'Abrir el menú'}
          className="icono-boton"
          onClick={() => cambiarAjustes({ menuAbierto: !ajustes.menuAbierto })}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
            viewBox="0 0 20 20"
          >
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
        <div className="marca">
          <div className="marca-bus">
            <Bus ruedas={false} />
          </div>
          <strong>Andén</strong>
          <span>Cooperativa</span>
        </div>
        <button
          className="buscador"
          onClick={() => establecerPaleta(true)}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16">
            <circle
              cx="7"
              cy="7"
              fill="none"
              r="5"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M11 11l4 4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.6"
            />
          </svg>
          <span>Buscar o ir a…</span>
          <kbd>⌘K</kbd>
        </button>
        <div className="cabecera-derecha">
          <span className="en-vivo">
            <i className="punto-vivo" /> En vivo · <Reloj />
          </span>
          <button
            aria-label={`${alertasPendientes} alertas sin atender`}
            className="icono-boton campana"
            onClick={() => establecerSeccion('alertas')}
            type="button"
          >
            <svg
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
            >
              <path d="M6 17V11a6 6 0 1112 0v6l2 2H4zM10 21a2 2 0 004 0" />
            </svg>
            {alertasPendientes > 0 && <b>{alertasPendientes}</b>}
          </button>
          <div className="menu-relativo">
            <button
              aria-expanded={menuAjustes}
              aria-label="Ajustes del panel"
              className="icono-boton"
              onClick={() => establecerMenuAjustes((v) => !v)}
              type="button"
            >
              <svg
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.6"
                viewBox="0 0 24 24"
              >
                <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
                <circle cx="16" cy="7" r="2" />
                <circle cx="8" cy="17" r="2" />
              </svg>
            </button>
            {menuAjustes && (
              <div className="menu derecha" role="menu">
                <p className="micro">Tema</p>
                <div className="conmutador chico">
                  {(['oscuro', 'claro'] as const).map((t) => (
                    <button
                      aria-selected={ajustes.tema === t}
                      key={t}
                      onClick={() => cambiarAjustes({ tema: t })}
                      type="button"
                    >
                      {t === 'oscuro' ? 'Oscuro' : 'Claro'}
                    </button>
                  ))}
                </div>
                <p className="micro">Densidad</p>
                <div className="conmutador chico">
                  {(['compacta', 'comoda'] as const).map((t) => (
                    <button
                      aria-selected={ajustes.densidad === t}
                      key={t}
                      onClick={() => cambiarAjustes({ densidad: t })}
                      type="button"
                    >
                      {t === 'compacta' ? 'Compacta' : 'Cómoda'}
                    </button>
                  ))}
                </div>
                <button
                  className="boton-t peligro"
                  onClick={alSalir}
                  type="button"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav aria-label="Secciones" className="lateral">
        {grupos.map((g) => (
          <div className="lateral-grupo" key={g}>
            <p className="micro lateral-titulo">{g}</p>
            {SECCIONES.filter((s) => s.grupo === g).map((s) => (
              <button
                aria-current={seccion === s.clave ? 'page' : undefined}
                className="lateral-item"
                key={s.clave}
                onClick={() => establecerSeccion(s.clave)}
                title={s.titulo}
                type="button"
              >
                <IconoNav nombre={s.clave} />
                <span className="lateral-texto">{s.titulo}</span>
                {(conteos[s.clave] ?? 0) > 0 && (
                  <b
                    className={`cuenta${s.clave === 'alertas' ? ' roja' : ''}`}
                  >
                    {conteos[s.clave]}
                  </b>
                )}
              </button>
            ))}
          </div>
        ))}
        <p className="lateral-pie micro">La ruta, al día.</p>
      </nav>

      <main className="principal" key={seccion}>
        <header className="principal-cabeza">
          <div>
            <p className="micro">{actual.grupo}</p>
            <h1>{actual.titulo}</h1>
          </div>
          <p className="principal-desc">{actual.descripcion}</p>
        </header>
        {seccion === 'tablero' && (
          <Tablero irA={(s) => establecerSeccion(s as Seccion)} />
        )}
        {seccion === 'envivo' && <EnVivo />}
        {seccion === 'viajes' && <Viajes />}
        {seccion === 'encomiendas' && <Encomiendas />}
        {seccion === 'conductores' && <Conductores />}
        {seccion === 'solicitudes' && <Solicitudes />}
        {seccion === 'pasajeros' && <Pasajeros />}
        {seccion === 'finanzas' && <Finanzas />}
        {seccion === 'actividad' && <Actividad />}
        {seccion === 'alertas' && <Alertas />}
      </main>
      <Paleta
        abierta={paleta}
        alCerrar={() => establecerPaleta(false)}
        comandos={comandos}
      />
    </div>
  );
}

export function App() {
  const [estado, establecerEstado] = useState<Estado>('cargando');

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
    document.documentElement.dataset.tema = leerAjustes().tema;
    void revisar();
  }, [revisar]);

  const salir = useCallback(
    () =>
      void supabase?.auth.signOut().then(() => establecerEstado('sin-sesion')),
    [],
  );

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
        <p className="micro" style={{ padding: 40 }}>
          Cargando…
        </p>
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
            Creala o dale el rol con{' '}
            <code>supabase/crear-administrador.sql</code> en el editor de SQL de
            Supabase.
          </p>
          <button className="boton-ed" onClick={salir} type="button">
            Salir
          </button>
        </div>
      </main>
    );
  }
  return (
    <ProveedorDatos>
      <Armazon alSalir={salir} />
    </ProveedorDatos>
  );
}
