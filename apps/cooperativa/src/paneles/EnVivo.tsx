import { Andenes } from '../componentes/Andenes';
import { Etiqueta } from '../componentes/Etiqueta';
import { LineaDeRed } from '../componentes/LineaDeRed';
import { Tabla, type Columna } from '../componentes/Tabla';
import { useDatos } from '../DatosContexto';
import { corredorDe, fraccionEnCorredor, nombreRuta } from '../lib/ruta';
import type { Transmision, Viaje } from '../tipos';

interface EnCamino {
  avance: number;
  transmision: Transmision;
  viaje: Viaje;
}

export function EnVivo() {
  const d = useDatos();
  const enCamino: EnCamino[] = d.transmisiones.flatMap((transmision) => {
    const viaje = d.viajes.find((v) => v.id === transmision.viaje_id);
    const ciudad = viaje ? corredorDe(viaje.ruta_id) : null;
    if (
      !viaje ||
      !ciudad ||
      transmision.lat === null ||
      transmision.lng === null
    )
      return [];
    return [
      {
        avance: Math.round(
          fraccionEnCorredor(transmision.lat, transmision.lng, ciudad) * 100,
        ),
        transmision,
        viaje,
      },
    ];
  });
  const columnas: Columna<EnCamino>[] = [
    {
      celda: (f) => nombreRuta(f.viaje.ruta_id),
      clave: 'ruta',
      titulo: 'Ruta',
      valor: (f) => nombreRuta(f.viaje.ruta_id),
    },
    {
      celda: (f) => f.viaje.placa,
      clave: 'placa',
      titulo: 'Placa',
      valor: (f) => f.viaje.placa,
    },
    {
      celda: (f) => f.viaje.chofer_id,
      clave: 'chofer',
      titulo: 'Chofer',
      valor: (f) => f.viaje.chofer_id,
    },
    {
      celda: (f) => (
        <span className="medidor-fila">
          <span className="medidor">
            <i style={{ width: `${f.avance}%` }} />
          </span>
          <span className="num">{f.avance} %</span>
        </span>
      ),
      clave: 'avance',
      titulo: 'Avance del camino',
      valor: (f) => f.avance,
    },
    {
      celda: () => <Etiqueta tono="ok">Transmitiendo</Etiqueta>,
      clave: 'estado',
      titulo: 'Señal',
    },
  ];
  return (
    <>
      <section className="panel">
        <header className="panel-cabeza">
          <h2>Plano de la red</h2>
        </header>
        <LineaDeRed transmisiones={d.transmisiones} viajes={d.viajes} />
      </section>
      <section className="panel">
        <header className="panel-cabeza">
          <h2>Buses en camino</h2>
          <span className="micro">{enCamino.length} transmitiendo</span>
        </header>
        <Tabla
          columnas={columnas}
          filas={enCamino}
          idDe={(f) => f.viaje.id}
          nombreArchivo="buses-en-camino"
          textoDe={(f) =>
            `${f.viaje.placa} ${f.viaje.chofer_id} ${nombreRuta(f.viaje.ruta_id)}`
          }
          vacio={{
            detalle:
              'Cuando un conductor salga y comparta su ubicación, aparece acá moviéndose.',
            titulo: 'Ningún bus en camino',
          }}
        />
      </section>
      <section className="panel">
        <header className="panel-cabeza">
          <h2>Andenes</h2>
        </header>
        <Andenes boletos={d.boletos} viajes={d.viajes} />
      </section>
    </>
  );
}
