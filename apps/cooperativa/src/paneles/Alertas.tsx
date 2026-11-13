import { Etiqueta } from '../componentes/Etiqueta';
import { Tabla, type Columna, type Filtro } from '../componentes/Tabla';
import { useDatos } from '../DatosContexto';
import { fechaHora, hace } from '../lib/formato';
import { supabase } from '../supabase';
import { Sirena } from '../svg/Iconos';
import type { Alerta } from '../tipos';

export function Alertas() {
  const d = useDatos();
  const pendientes = d.alertas.filter((a) => !a.atendida);
  async function atender(lista: Alerta[], limpiar?: () => void) {
    await supabase!
      .from('alertas')
      .update({ atendida: true })
      .in(
        'id',
        lista.map((a) => a.id),
      );
    limpiar?.();
    await d.recargar();
  }
  const columnas: Columna<Alerta>[] = [
    {
      celda: (a) => (
        <span className="persona">
          <span className="mini">
            <Sirena activa={!a.atendida} />
          </span>
          <strong>{a.nombre ?? 'Una persona'}</strong>
        </span>
      ),
      clave: 'nombre',
      titulo: 'Persona',
      valor: (a) => a.nombre,
    },
    { celda: () => 'Posible choque', clave: 'tipo', titulo: 'Tipo' },
    {
      celda: (a) => (
        <span title={fechaHora(a.creada_en)}>{hace(a.creada_en)}</span>
      ),
      clave: 'cuando',
      titulo: 'Cuándo',
      valor: (a) => a.creada_en,
    },
    {
      celda: (a) => a.viaje_id ?? '—',
      clave: 'viaje',
      titulo: 'Viaje',
      valor: (a) => a.viaje_id,
    },
    {
      celda: (a) =>
        a.lat !== null && a.lng !== null ? (
          <a
            className="enlace"
            href={`https://maps.apple.com/?ll=${a.lat},${a.lng}`}
            onClick={(e) => e.stopPropagation()}
            rel="noreferrer"
            target="_blank"
          >
            Ver ubicación ↗
          </a>
        ) : (
          '—'
        ),
      clave: 'mapa',
      titulo: 'Ubicación',
    },
    {
      celda: (a) => (
        <Etiqueta tono={a.atendida ? 'ok' : 'error'}>
          {a.atendida ? 'Atendida' : 'Sin atender'}
        </Etiqueta>
      ),
      clave: 'estado',
      titulo: 'Estado',
      valor: (a) => a.atendida,
    },
  ];
  const filtros: Filtro<Alerta>[] = [
    { clave: 'sin', prueba: (a) => !a.atendida, titulo: 'Sin atender' },
    { clave: 'ok', prueba: (a) => a.atendida, titulo: 'Atendidas' },
  ];
  return (
    <>
      {pendientes.length > 0 && (
        <p className="cinta-alerta">
          <span className="punto-rojo" /> {pendientes.length}{' '}
          {pendientes.length === 1 ? 'persona necesita' : 'personas necesitan'}{' '}
          atención ahora
        </p>
      )}
      <Tabla
        accionesEnLote={(sel, limpiar) => (
          <button
            className="boton-t primario"
            onClick={() =>
              void atender(
                sel.filter((a) => !a.atendida),
                limpiar,
              )
            }
            type="button"
          >
            Marcar atendidas
          </button>
        )}
        columnas={columnas}
        filas={d.alertas}
        filtros={filtros}
        idDe={(a) => a.id}
        nombreArchivo="alertas"
        textoDe={(a) => `${a.nombre ?? ''} ${a.viaje_id ?? ''}`}
        vacio={{
          detalle:
            'Si un teléfono detecta un choque y la persona no responde, la alerta aparece acá al instante.',
          titulo: 'Sin alertas. Qué bueno.',
        }}
      />
    </>
  );
}
