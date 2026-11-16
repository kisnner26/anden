"""genera src/datos/mapaPuntos.ts: una cuadrícula de puntos de Nicaragua y sus vecinos, para dibujar el mapa del pasaporte.
fuente: Natural Earth 1:50m (dominio público), ne_50m_admin_0_countries.geojson
uso: python3 scripts/generar-mapa-puntos.py ruta/a/ne_50m_admin_0_countries.geojson"""
import json, sys

LON0, LON1, LAT0, LAT1, PASO = -88.0, -84.4, 11.1, 13.1, 0.025
VECINOS = {'Honduras', 'El Salvador', 'Guatemala', 'Costa Rica', 'Panama', 'Belize', 'Colombia', 'Mexico'}

def poligonos(geom):
    if geom['type'] == 'Polygon':
        return [geom['coordinates']]
    return geom['coordinates']

def dentro(x, y, anillo):
    c = False
    j = len(anillo) - 1
    for i in range(len(anillo)):
        xi, yi = anillo[i][:2]
        xj, yj = anillo[j][:2]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            c = not c
        j = i
    return c

def en_pais(x, y, partes):
    for poligono in partes:
        if dentro(x, y, poligono[0]) and not any(dentro(x, y, h) for h in poligono[1:]):
            return True
    return False

datos = json.load(open(sys.argv[1]))
paises = {f['properties']['ADMIN']: poligonos(f['geometry']) for f in datos['features']}
nicaragua = paises['Nicaragua']
vecinos = [paises[n] for n in VECINOS if n in paises]

filas = []
y = LAT1
while y >= LAT0:
    fila = ''
    x = LON0
    while x <= LON1:
        if en_pais(x, y, nicaragua):
            fila += '2'
        elif any(en_pais(x, y, v) for v in vecinos):
            fila += '1'
        else:
            fila += '0'
        x += PASO
    filas.append(fila)
    y -= PASO

lineas = ",\n  ".join(f"'{f}'" for f in filas)
print(f"""// generado por scripts/generar-mapa-puntos.py a partir de Natural Earth (dominio público): no se edita a mano
/** una cuadrícula de puntos de Nicaragua y sus vecinos: 2 es Nicaragua, 1 es otro país y 0 es mar; la fila 0 es el norte */
export const MAPA_PUNTOS = {{
  lat0: {LAT0},
  lat1: {LAT1},
  lon0: {LON0},
  lon1: {LON1},
  paso: {PASO},
  filas: [
  {lineas},
  ],
}} as const;""")
