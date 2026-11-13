import { Bus } from '../svg/Bus';

/** el estado sin datos: un bus dormido con su "zzz" y un texto que explica qué falta */
export function Vacio({
  detalle,
  titulo,
}: {
  detalle: string;
  titulo: string;
}) {
  return (
    <div className="vacio">
      <div className="vacio-bus">
        <Bus ruedas={false} />
        <span className="zzz">
          z<i>z</i>
          <b>z</b>
        </span>
      </div>
      <p className="vacio-titulo">{titulo}</p>
      <p className="vacio-detalle">{detalle}</p>
    </div>
  );
}
