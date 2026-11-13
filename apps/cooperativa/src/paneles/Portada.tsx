import {
  esperaPromedio,
  resumir,
  type AlertaFila,
  type Cierre,
  type EncomiendaFila,
  type ViajeFila,
} from '../resumen';
import { useLista } from '../useDatos';

export function Portada() {
  const cierres = useLista<Cierre>(
    'cierres',
    'viaje_id, cobrado, pasajeros, pendiente',
  );
  const viajes = useLista<ViajeFila>(
    'viajes',
    'id, chofer_id, ruta_id, servicio, placa, anden, salida, estado, salio_en',
    { columna: 'salida' },
  );
  const encomiendas = useLista<EncomiendaFila>(
    'encomiendas',
    'id, chofer_id, estado, motivo, contenido',
  );
  const alertas = useLista<AlertaFila>(
    'alertas',
    'id, viaje_id, tipo, lat, lng, nombre, atendida, creada_en',
    { columna: 'creada_en' },
  );
  const r = resumir(
    cierres.filas,
    viajes.filas,
    encomiendas.filas,
    alertas.filas,
  );
  const espera = esperaPromedio(viajes.filas);

  const tarjetas = [
    { etiqueta: 'Cobrado', valor: `C$ ${r.cobrado}` },
    { etiqueta: 'Por cobrar', valor: `C$ ${r.porCobrar}` },
    { etiqueta: 'Pasajeros llevados', valor: String(r.pasajeros) },
    { etiqueta: 'Viajes cerrados', valor: String(r.viajesCerrados) },
    { etiqueta: 'Viajes esperando', valor: String(r.viajesActivos) },
    { etiqueta: 'Encomiendas abiertas', valor: String(r.encomiendasAbiertas) },
    {
      etiqueta: 'Espera media en andén',
      valor: espera === null ? 'Sin datos' : `${espera} min`,
    },
    {
      alerta: r.alertasPendientes > 0,
      etiqueta: 'Alertas sin atender',
      valor: String(r.alertasPendientes),
    },
  ];

  return (
    <section>
      <h1>Resumen</h1>
      <p className="suave">
        Todo lo que pasa entre pasajeros y conductores, al día. Se actualiza
        solo cada 10 segundos.
      </p>
      <div className="rejilla">
        {tarjetas.map((t) => (
          <article
            className={`tarjeta dato${t.alerta ? ' alerta' : ''}`}
            key={t.etiqueta}
          >
            <p className="etiqueta">{t.etiqueta.toUpperCase()}</p>
            <p className="valor">{t.valor}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
