"""genera src/datos/trazos.ts con el trazo de carretera de cada corredor.

consulta el servicio publico de rutas de OSRM (datos de OpenStreetMap, ODbL) una sola vez, con las
coordenadas de las terminales de la muestra, y guarda el trazo simplificado. la app no consulta
nada en linea. uso: python3 herramientas/generar-trazos.py
"""
import json
import math
import urllib.request
from pathlib import Path

DESTINO = Path(__file__).resolve().parent.parent / "src" / "datos" / "trazos.ts"
MANAGUA = (12.13413, -86.1933)
CIUDADES = {"boa": (12.46901, -85.65587), "jui": (12.09172, -85.36106)}
TOLERANCIA_GRADOS = 0.0004  # unos 45 m


def consultar(destino):
    url = (
        "https://router.project-osrm.org/route/v1/driving/"
        f"{MANAGUA[1]},{MANAGUA[0]};{destino[1]},{destino[0]}"
        "?overview=full&geometries=geojson"
    )
    with urllib.request.urlopen(url, timeout=60) as respuesta:
        datos = json.load(respuesta)
    ruta = datos["routes"][0]
    return [(lat, lng) for lng, lat in ruta["geometry"]["coordinates"]], ruta


def distancia_a_segmento(p, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    if dx == 0 and dy == 0:
        return math.hypot(p[0] - a[0], p[1] - a[1])
    t = max(0, min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)))
    return math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))


def simplificar(puntos, tolerancia):
    """douglas-peucker iterativo"""
    mantener = {0, len(puntos) - 1}
    pila = [(0, len(puntos) - 1)]
    while pila:
        i, j = pila.pop()
        maximo, indice = 0, None
        for k in range(i + 1, j):
            d = distancia_a_segmento(puntos[k], puntos[i], puntos[j])
            if d > maximo:
                maximo, indice = d, k
        if indice is not None and maximo > tolerancia:
            mantener.add(indice)
            pila.extend([(i, indice), (indice, j)])
    return [puntos[k] for k in sorted(mantener)]


def main():
    lineas = [
        "// generado por herramientas/generar-trazos.py; no se edita a mano",
        "// trazo de carretera: datos de OpenStreetMap (c) colaboradores, licencia ODbL, via OSRM",
        "",
        "export interface TrazoCorredor {",
        "  distanciaKm: number;",
        "  duracionMin: number;",
        "  /** de Managua hacia la otra ciudad, como [latitud, longitud] */",
        "  puntos: ReadonlyArray<readonly [number, number]>;",
        "}",
        "",
        "export const TRAZOS: Readonly<Record<'boa' | 'jui', TrazoCorredor>> = {",
    ]
    for codigo, destino in CIUDADES.items():
        puntos, ruta = consultar(destino)
        simples = simplificar(puntos, TOLERANCIA_GRADOS)
        lineas.append(f"  {codigo}: {{")
        lineas.append(f"    distanciaKm: {round(ruta['distance'] / 1000, 1)},")
        lineas.append(f"    duracionMin: {round(ruta['duration'] / 60)},")
        lineas.append("    puntos: [")
        for lat, lng in simples:
            lineas.append(f"      [{lat:.5f}, {lng:.5f}],")
        lineas.append("    ],")
        lineas.append("  },")
        print(codigo, len(puntos), "->", len(simples), "puntos")
    lineas.append("};")
    DESTINO.write_text("\n".join(lineas) + "\n")


if __name__ == "__main__":
    main()
