import { Etiqueta } from '../componentes/Etiqueta';
import { Tabla, type Columna, type Filtro } from '../componentes/Tabla';
import { useDatos } from '../DatosContexto';
import { dinero, fechaHora } from '../lib/formato';
import { nombreRuta } from '../lib/ruta';
import type { Boleto } from '../tipos';

export function Pasajeros() {
  const d = useDatos();
  const pagado = (b: Boleto) =>
    d.pagos.find((p) => p.boleto_id === b.boleto_id)?.estado ===
    'pagado_efectivo';
  const ruta = (b: Boleto) => {
    const v = d.viajes.find((x) => x.id === b.viaje_id);
    return v ? nombreRuta(v.ruta_id) : (b.contenido?.resumen?.destino ?? '—');
  };
  const columnas: Columna<Boleto>[] = [
    {
      celda: (b) => (
        <strong>{b.contenido?.boleto?.pasajero?.nombre ?? 'Pasajero'}</strong>
      ),
      clave: 'nombre',
      titulo: 'Pasajero',
      valor: (b) => b.contenido?.boleto?.pasajero?.nombre,
    },
    {
      celda: (b) => <code>{b.contenido?.boleto?.codigo ?? '—'}</code>,
      clave: 'codigo',
      titulo: 'Código',
      valor: (b) => b.contenido?.boleto?.codigo,
    },
    { celda: ruta, clave: 'ruta', titulo: 'Ruta', valor: ruta },
    {
      celda: (b) => b.asiento,
      clave: 'asiento',
      titulo: 'Asiento',
      valor: (b) => b.asiento,
    },
    {
      celda: (b) => dinero(b.contenido?.boleto?.precio ?? 0),
      clave: 'precio',
      titulo: 'Precio',
      valor: (b) => b.contenido?.boleto?.precio ?? 0,
    },
    {
      celda: (b) =>
        b.contenido?.resumen?.plus ? (
          <Etiqueta tono="aviso">Plus</Etiqueta>
        ) : (
          '—'
        ),
      clave: 'plus',
      titulo: 'Plus',
      valor: (b) => Boolean(b.contenido?.resumen?.plus),
    },
    {
      celda: (b) =>
        b.estado === 'cancelado' ? (
          '—'
        ) : pagado(b) ? (
          <Etiqueta tono="ok">Pagó</Etiqueta>
        ) : (
          <Etiqueta tono="aviso">Por cobrar</Etiqueta>
        ),
      clave: 'pago',
      titulo: 'Pago',
      valor: (b) => (pagado(b) ? 'Pagó' : 'Por cobrar'),
    },
    {
      celda: (b) => (
        <Etiqueta
          tono={
            b.estado === 'cancelado'
              ? 'error'
              : b.estado === 'usado'
                ? 'azul'
                : 'ok'
          }
        >
          {b.estado === 'cancelado'
            ? 'Cancelado'
            : b.estado === 'usado'
              ? 'Usado'
              : 'Vigente'}
        </Etiqueta>
      ),
      clave: 'estado',
      titulo: 'Estado',
      valor: (b) => b.estado,
    },
    {
      celda: (b) => fechaHora(b.actualizado_en),
      clave: 'fecha',
      titulo: 'Última actividad',
      valor: (b) => b.actualizado_en,
    },
  ];
  const filtros: Filtro<Boleto>[] = [
    { clave: 'vig', prueba: (b) => b.estado === 'vigente', titulo: 'Vigentes' },
    {
      clave: 'plus',
      prueba: (b) => Boolean(b.contenido?.resumen?.plus),
      titulo: 'Con Plus',
    },
    {
      clave: 'sin',
      prueba: (b) => b.estado !== 'cancelado' && !pagado(b),
      titulo: 'Por cobrar',
    },
    {
      clave: 'can',
      prueba: (b) => b.estado === 'cancelado',
      titulo: 'Cancelados',
    },
  ];
  return (
    <Tabla
      columnas={columnas}
      filas={d.boletos}
      filtros={filtros}
      idDe={(b) => b.boleto_id}
      nombreArchivo="pasajeros"
      textoDe={(b) =>
        `${b.contenido?.boleto?.pasajero?.nombre ?? ''} ${b.contenido?.boleto?.codigo ?? ''} ${ruta(b)}`
      }
      vacio={{
        detalle:
          'Cuando un pasajero reserve un asiento, aparece acá con su pago y su estado.',
        titulo: 'Sin reservas todavía',
      }}
    />
  );
}
