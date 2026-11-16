const $ = (id) => document.getElementById(id);
const COLORES = { ambar: '#f2b632', azul: '#2966ed', linea: '#2b2d37', rojo: '#e6213f', suave: '#8c90a0', verde: '#33cc5c' };
let historial = [];
let estado = null;

async function api(ruta, opciones) {
  const r = await fetch(ruta, opciones);
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `error ${r.status}`);
  return r.json();
}

/* ---------- curvas ---------- */
function dibujarCurvas() {
  const c = $('curvas');
  const g = c.getContext('2d');
  g.clearRect(0, 0, c.width, c.height);
  g.strokeStyle = COLORES.linea;
  g.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = 16 + (i * (c.height - 36)) / 4;
    g.beginPath(); g.moveTo(36, y); g.lineTo(c.width - 8, y); g.stroke();
  }
  if (historial.length < 2) return;
  const maxPerdida = Math.max(...historial.map((h) => Math.max(h.perdida, h.perdidaValidacion ?? 0)), 0.1);
  const x = (i) => 36 + (i * (c.width - 48)) / (historial.length - 1);
  const yP = (v) => 16 + (1 - v / maxPerdida) * (c.height - 36);
  const yA = (v) => 16 + (1 - v) * (c.height - 36);
  const linea = (color, valores, escala) => {
    g.strokeStyle = color; g.lineWidth = 2; g.beginPath();
    valores.forEach((v, i) => { if (v === null) return; i === 0 ? g.moveTo(x(i), escala(v)) : g.lineTo(x(i), escala(v)); });
    g.stroke();
  };
  linea(COLORES.ambar, historial.map((h) => h.perdida), yP);
  linea(COLORES.rojo, historial.map((h) => h.perdidaValidacion), yP);
  linea(COLORES.verde, historial.map((h) => h.precisionValidacion), yA);
  g.fillStyle = COLORES.suave; g.font = '11px ui-monospace, monospace';
  g.fillText(maxPerdida.toFixed(2), 2, 24); g.fillText('0', 22, c.height - 18);
  g.fillText(`época ${historial.length}`, c.width - 80, c.height - 4);
}

/* ---------- la red ---------- */
function dibujarRed() {
  const c = $('red');
  const g = c.getContext('2d');
  g.clearRect(0, 0, c.width, c.height);
  if (!estado) return;
  const { capas, etiquetas, dimension } = estado.modelo;
  const ocultas = capas[0];
  const salida = capas[capas.length - 1];
  const nOcultas = Math.min(ocultas.salidas, 24);
  const colX = [90, c.width / 2, c.width - 150];
  const alto = c.height - 30;
  const yOculta = (i) => 15 + ((i + 0.5) * alto) / nOcultas;
  const ySalida = (i) => 15 + ((i + 0.5) * alto) / salida.salidas;
  const maxPeso = Math.max(...(salida.pesos ?? [[1]]).flat().map(Math.abs), 0.001);
  // líneas de la última capa: azul si empuja a favor y rojo si empuja en contra
  if (salida.pesos) {
    for (let s = 0; s < salida.salidas; s += 1) {
      for (let h = 0; h < nOcultas; h += 1) {
        const w = salida.pesos[s][h];
        const a = Math.min(0.55, (Math.abs(w) / maxPeso) * 0.7);
        if (a < 0.04) continue;
        g.strokeStyle = w > 0 ? `rgba(41,102,237,${a})` : `rgba(230,33,63,${a})`;
        g.lineWidth = 1;
        g.beginPath(); g.moveTo(colX[1] + 8, yOculta(h)); g.lineTo(colX[2] - 8, ySalida(s)); g.stroke();
      }
    }
  }
  // entrada: un bloque
  g.fillStyle = '#101116'; g.strokeStyle = COLORES.linea;
  g.beginPath(); g.roundRect(colX[0] - 44, 40, 88, alto - 50, 16); g.fill(); g.stroke();
  g.fillStyle = COLORES.suave; g.font = '11px ui-monospace, monospace'; g.textAlign = 'center';
  g.fillText(`${dimension}`, colX[0], alto / 2 - 4); g.fillText('casillas', colX[0], alto / 2 + 12);
  for (let h = 0; h < nOcultas; h += 1) {
    g.strokeStyle = 'rgba(140,144,160,0.10)';
    g.beginPath(); g.moveTo(colX[0] + 44, alto / 2); g.lineTo(colX[1] - 8, yOculta(h)); g.stroke();
  }
  // ocultas: más claras las que más pesan
  const maxF = Math.max(...ocultas.fuerza, 0.0001);
  for (let h = 0; h < nOcultas; h += 1) {
    g.fillStyle = `rgba(242,182,50,${0.25 + 0.75 * (ocultas.fuerza[h] / maxF)})`;
    g.beginPath(); g.arc(colX[1], yOculta(h), 7, 0, Math.PI * 2); g.fill();
  }
  // salidas con su nombre
  g.textAlign = 'left';
  for (let s = 0; s < salida.salidas; s += 1) {
    g.fillStyle = COLORES.verde; g.beginPath(); g.arc(colX[2], ySalida(s), 6, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#f1f2f6'; g.font = '12px -apple-system, system-ui, sans-serif';
    g.fillText(etiquetas[s], colX[2] + 14, ySalida(s) + 4);
  }
  g.fillStyle = COLORES.suave; g.font = '10px ui-monospace, monospace'; g.textAlign = 'center';
  g.fillText('ENTRADA', colX[0], 12); g.fillText(`OCULTA (${ocultas.salidas}${ocultas.salidas > nOcultas ? `, se ven ${nOcultas}` : ''})`, colX[1], 12);
  g.fillText('INTENCIÓN', colX[2] + 30, 12);
  const total = capas.reduce((s, k) => s + k.entradas * k.salidas + k.salidas, 0);
  $('nota-red').textContent = `${total.toLocaleString('es')} parámetros: caben en ${(total * 4 / 1024).toFixed(0)} KB de memoria. Azul: la neurona empuja hacia esa intención; rojo: en contra. Más claro, más peso.`;
}

/* ---------- matriz ---------- */
function dibujarMatriz() {
  const c = $('matriz');
  const g = c.getContext('2d');
  g.clearRect(0, 0, c.width, c.height);
  const m = estado?.matriz;
  const cont = $('precision-clases');
  cont.innerHTML = '';
  if (!m) return;
  $('nota-matriz').textContent = 'Filas: lo que era. Columnas: lo que la red dijo. La diagonal es lo que acertó.';
  const n = m.length;
  const lado = Math.min((c.width - 110) / n, (c.height - 80) / n);
  const etiquetas = estado.modelo.etiquetas;
  m.forEach((fila, i) => {
    const total = fila.reduce((s, v) => s + v, 0) || 1;
    fila.forEach((v, j) => {
      const a = v / total;
      g.fillStyle = i === j ? `rgba(51,204,92,${0.1 + 0.9 * a})` : `rgba(230,33,63,${a === 0 ? 0.03 : 0.2 + 0.8 * a})`;
      g.fillRect(100 + j * lado, 60 + i * lado, lado - 2, lado - 2);
    });
    g.fillStyle = '#f1f2f6'; g.font = '10px ui-monospace, monospace'; g.textAlign = 'right';
    g.fillText(etiquetas[i].slice(0, 12), 94, 60 + i * lado + lado / 2 + 3);
    g.save(); g.translate(100 + i * lado + lado / 2, 54); g.rotate(-Math.PI / 4); g.textAlign = 'left';
    g.fillText(etiquetas[i].slice(0, 12), 0, 0); g.restore();
  });
  estado.precisionPorClase.forEach((p, i) => {
    cont.append(barra(etiquetas[i], p ?? 0, p === null ? 'sin datos' : `${Math.round(p * 100)}%`));
  });
}

function barra(nombre, fraccion, texto) {
  const d = document.createElement('div');
  d.className = 'barra';
  d.innerHTML = '<span></span><div class="pista"><div class="relleno"></div></div><span class="valor"></span>';
  d.children[0].textContent = nombre;
  d.querySelector('.relleno').style.width = `${Math.round(fraccion * 100)}%`;
  d.querySelector('.valor').textContent = texto;
  return d;
}

/* ---------- estado, frases, pruebas ---------- */
async function cargarEstado() {
  estado = await api('/api/estado');
  const m = estado.modelo.meta;
  $('estado').textContent = `${estado.frases} frases · ${estado.modelo.etiquetas.length} intenciones${m.entrenadoEn ? ` · modelo del ${m.entrenadoEn.slice(0, 10)}` : ''}${m.precisionValidacion !== null ? ` · ${Math.round(m.precisionValidacion * 100)}% en validación` : ''}`;
  const opciones = estado.modelo.etiquetas.map((e) => `<option value="${e}">${e} (${estado.porEtiqueta[e] ?? 0})</option>`).join('');
  $('etiqueta-frase').innerHTML = opciones;
  const filtro = $('filtro-etiqueta');
  const actual = filtro.value;
  filtro.innerHTML = `<option value="">todas las intenciones</option>${opciones}`;
  filtro.value = actual;
  $('boton-exportar').disabled = !estado.sinExportar;
  dibujarRed();
  dibujarMatriz();
}

async function cargarFrases() {
  const frases = await api('/api/frases');
  const f = $('filtro-etiqueta').value;
  const visibles = frases.filter((x) => f === '' || x.etiqueta === f);
  $('conteo-frases').textContent = `${visibles.length} de ${frases.length}`;
  const tabla = $('tabla-frases');
  tabla.innerHTML = '';
  for (const frase of visibles.slice(0, 400)) {
    const fila = document.createElement('div');
    fila.className = 'renglon';
    const e = document.createElement('span'); e.className = 'etiqueta'; e.textContent = frase.etiqueta;
    const t = document.createElement('span'); t.textContent = frase.texto;
    fila.append(e, t);
    if (frase.origen === 'propia') {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = 'Quitar';
      b.onclick = async () => { await api('/api/frases', { body: JSON.stringify({ etiqueta: frase.etiqueta, texto: frase.texto }), headers: { 'Content-Type': 'application/json' }, method: 'DELETE' }); await refrescar(); };
      fila.append(b);
    } else {
      const s = document.createElement('span'); s.className = 'base'; s.textContent = 'plantilla'; fila.append(s);
    }
    tabla.append(fila);
  }
}

async function refrescar() { await cargarEstado(); await cargarFrases(); }

$('form-frase').addEventListener('submit', async (e) => {
  e.preventDefault();
  const texto = $('texto-frase').value;
  try {
    await api('/api/frases', { body: JSON.stringify({ etiqueta: $('etiqueta-frase').value, texto }), headers: { 'Content-Type': 'application/json' }, method: 'POST' });
    $('texto-frase').value = '';
    await refrescar();
  } catch (error) { $('conteo-frases').textContent = error.message; }
});
$('filtro-etiqueta').addEventListener('change', cargarFrases);

$('form-probar').addEventListener('submit', async (e) => {
  e.preventDefault();
  const r = await api('/api/probar', { body: JSON.stringify({ texto: $('texto-probar').value }), headers: { 'Content-Type': 'application/json' }, method: 'POST' });
  const cont = $('resultado-probar');
  cont.innerHTML = '';
  for (const p of r) cont.append(barra(p.etiqueta, p.probabilidad, `${(p.probabilidad * 100).toFixed(1)}%`));
});

$('form-entrenar').addEventListener('submit', (e) => {
  e.preventDefault();
  const datos = new URLSearchParams(new FormData(e.target));
  historial = [];
  const boton = $('boton-entrenar');
  boton.disabled = true; boton.textContent = 'Entrenando…';
  const fuente = new EventSource(`/api/entrenar?${datos}`);
  fuente.addEventListener('epoca', (ev) => { historial.push(JSON.parse(ev.data)); dibujarCurvas(); });
  const terminar = async () => { fuente.close(); boton.disabled = false; boton.textContent = 'Entrenar con todas las frases'; await refrescar(); };
  fuente.addEventListener('fin', terminar);
  fuente.addEventListener('error', terminar);
});

$('boton-exportar').addEventListener('click', async () => {
  const r = await api('/api/exportar', { method: 'POST' });
  $('nota-exportar').textContent = `Guardado en ${r.archivo}. Hacé commit y volvé a compilar la app para que lo use.`;
});

refrescar().catch((e) => { $('estado').textContent = e.message; });
dibujarCurvas();
