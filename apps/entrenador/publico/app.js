const $ = (id) => document.getElementById(id);
const css = (nombre) =>
  getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
const CLAVE_OPCIONES = 'anden.entrenador.opciones';
const OPCIONES_DE_SIEMPRE = {
  dimension: 512,
  epocas: 80,
  oculta: 32,
  semilla: 7,
  tasa: 0.01,
};
const UMBRAL = 0.45;
const EJEMPLOS = [
  'cuánto cuesta ir a Boaco',
  'próximo bus a Juigalpa',
  'quedan asientos mañana',
  'qué se come en Boaco',
  'avisame 30 minutos antes',
  'comparte mi viaje',
  'hola',
  'cuánto es dos más dos',
];
const MAXIMO_RENGLONES = 120;

let estado = null;
let frases = [];
let historial = [];
let filtro = '';
let busqueda = '';
let mostrarTodas = false;
let entrenando = false;
let confirmandoGuardar = null;

/* ---------- utilidades ---------- */
async function api(ruta, opciones) {
  let respuesta;
  try {
    respuesta = await fetch(ruta, opciones);
  } catch {
    throw new Error('sin-conexion');
  }
  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => ({}));
    throw new Error(cuerpo.error ?? `error ${respuesta.status}`);
  }
  return respuesta.json();
}

function json(metodo, cuerpo) {
  return {
    body: JSON.stringify(cuerpo),
    headers: { 'Content-Type': 'application/json' },
    method: metodo,
  };
}

function aviso(mensaje) {
  const caja = $('aviso-global');
  caja.hidden = mensaje === null;
  caja.textContent = mensaje ?? '';
}

function toast(mensaje, tipo = 'listo') {
  const nodo = document.createElement('div');
  nodo.className = `toast ${tipo}`;
  nodo.textContent = mensaje;
  $('toasts').append(nodo);
  setTimeout(() => nodo.remove(), 4200);
}

function rgba(color, alfa) {
  const hex = color.replace('#', '');
  const n = parseInt(hex.length === 3 ? hex.replace(/./g, '$&$&') : hex, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alfa})`;
}

function preparar(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const ancho = canvas.clientWidth || canvas.width;
  const proporcion = canvas.height / canvas.width;
  canvas.width = Math.round(ancho * dpr);
  canvas.height = Math.round(ancho * proporcion * dpr);
  const g = canvas.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { g, ancho, alto: ancho * proporcion };
}

function porcentaje(valor) {
  return valor === null || valor === undefined
    ? '--%'
    : `${Math.round(valor * 100)}%`;
}

/* ---------- tablero ---------- */
function pintarTablero() {
  if (!estado) return;
  const meta = estado.modelo.meta;
  $('t-frases').textContent = String(estado.frases);
  $('t-intenciones').textContent = String(estado.modelo.etiquetas.length);
  const parametros =
    estado.parametros ??
    estado.modelo.capas.reduce(
      (s, c) => s + c.entradas * c.salidas + c.salidas,
      0,
    );
  $('t-parametros').textContent = parametros.toLocaleString('es');
  $('t-acierto').textContent = porcentaje(meta.aciertoReal);
  if (!entrenando) {
    const fecha = meta.entrenadoEn
      ? meta.entrenadoEn.slice(0, 10)
      : 'sin fecha';
    $('t-pie').textContent =
      `Modelo del ${fecha}${meta.ejemplos ? ` · entrenado con ${meta.ejemplos} frases` : ''}. El acierto real se mide con plantillas que la red nunca vio.`;
  }
}

/* ---------- curvas ---------- */
function dibujarCurvas() {
  const { g, ancho, alto } = preparar($('curvas'));
  g.clearRect(0, 0, ancho, alto);
  const izq = 40;
  const sup = 14;
  const inf = alto - 26;
  g.strokeStyle = css('--linea');
  g.lineWidth = 1;
  g.fillStyle = css('--tinta-suave');
  g.font = '500 11px JetBrains Mono, ui-monospace, monospace';
  for (let i = 0; i <= 4; i += 1) {
    const y = sup + (i * (inf - sup)) / 4;
    g.beginPath();
    g.moveTo(izq, y);
    g.lineTo(ancho - 8, y);
    g.stroke();
  }
  if (historial.length < 2) {
    g.textAlign = 'center';
    g.fillText('Las curvas aparecen cuando entrenes', ancho / 2, alto / 2);
    g.textAlign = 'left';
    return;
  }
  const maxPerdida = Math.max(
    ...historial.map((h) => Math.max(h.perdida, h.perdidaValidacion ?? 0)),
    0.1,
  );
  const x = (i) => izq + (i * (ancho - izq - 12)) / (historial.length - 1);
  const yP = (v) => sup + (1 - v / maxPerdida) * (inf - sup);
  const yA = (v) => sup + (1 - v) * (inf - sup);
  const trazar = (color, valores, escala) => {
    g.strokeStyle = color;
    g.lineWidth = 2.5;
    g.lineJoin = 'round';
    g.beginPath();
    let empezo = false;
    valores.forEach((v, i) => {
      if (v === null || v === undefined) return;
      if (empezo) g.lineTo(x(i), escala(v));
      else g.moveTo(x(i), escala(v));
      empezo = true;
    });
    g.stroke();
  };
  trazar(
    css('--ambar-titular'),
    historial.map((h) => h.perdida),
    yP,
  );
  trazar(
    css('--cancelado'),
    historial.map((h) => h.perdidaValidacion),
    yP,
  );
  trazar(
    css('--a-tiempo'),
    historial.map((h) => h.precisionValidacion),
    yA,
  );
  g.fillStyle = css('--tinta-suave');
  g.fillText(maxPerdida.toFixed(2), 4, sup + 10);
  g.fillText('0', 24, inf + 4);
  g.textAlign = 'right';
  g.fillText(`época ${historial.length}`, ancho - 8, alto - 6);
  g.textAlign = 'left';
}

/* ---------- la red, sobre el tablero negro ---------- */
function dibujarRed() {
  if (!estado) return;
  const canvas = $('red-canvas');
  const { g, ancho, alto } = preparar(canvas);
  g.clearRect(0, 0, ancho, alto);
  const { capas, etiquetas, dimension } = estado.modelo;
  const ocultas = capas[0];
  const salida = capas[capas.length - 1];
  const nOcultas = Math.min(ocultas.salidas, 26);
  const ambar = '#ffb21e';
  const rojo = '#ff5a6e';
  const verde = '#5fd39a';
  const claro = '#f2efe8';
  const colX = [ancho * 0.11, ancho * 0.5, ancho * 0.78];
  const margen = 34;
  const yOculta = (i) => margen + ((i + 0.5) * (alto - margen - 18)) / nOcultas;
  const ySalida = (i) =>
    margen + ((i + 0.5) * (alto - margen - 18)) / salida.salidas;

  // casillas de entrada: una rejilla de puntos que representa el vector de la frase
  const columnas = 14;
  const filas = 22;
  const bx = colX[0] - 52;
  const by = margen + 6;
  const celda = Math.min(7.4, (alto - margen - 40) / filas);
  for (let f = 0; f < filas; f += 1) {
    for (let c = 0; c < columnas; c += 1) {
      const azar = Math.abs(Math.sin((f * 31 + c * 17) * 12.9898)) % 1;
      g.fillStyle = rgba(claro, azar > 0.82 ? 0.55 : 0.1);
      g.beginPath();
      g.arc(
        bx + c * (celda + 0.6) + celda / 2,
        by + f * (celda + 0.6) + celda / 2,
        celda * 0.34,
        0,
        Math.PI * 2,
      );
      g.fill();
    }
  }
  g.fillStyle = rgba(claro, 0.6);
  g.font = '600 10px JetBrains Mono, ui-monospace, monospace';
  g.textAlign = 'center';
  g.fillText(`${dimension} casillas`, colX[0], alto - 8);

  for (let h = 0; h < nOcultas; h += 1) {
    g.strokeStyle = rgba(claro, 0.07);
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(bx + columnas * (celda + 0.6) + 4, alto / 2);
    g.lineTo(colX[1] - 9, yOculta(h));
    g.stroke();
  }

  // conexiones de la última capa, con su peso
  if (salida.pesos) {
    const maximo = Math.max(...salida.pesos.flat().map(Math.abs), 0.001);
    for (let s = 0; s < salida.salidas; s += 1) {
      for (let h = 0; h < nOcultas; h += 1) {
        const w = salida.pesos[s][h];
        const a = Math.min(0.6, (Math.abs(w) / maximo) * 0.75);
        if (a < 0.05) continue;
        g.strokeStyle = rgba(w > 0 ? ambar : rojo, a);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(colX[1] + 9, yOculta(h));
        g.lineTo(colX[2] - 9, ySalida(s));
        g.stroke();
      }
    }
  }

  const fuerzaMaxima = Math.max(...ocultas.fuerza, 0.0001);
  for (let h = 0; h < nOcultas; h += 1) {
    const intensidad = 0.3 + 0.7 * (ocultas.fuerza[h] / fuerzaMaxima);
    g.fillStyle = rgba(ambar, intensidad);
    g.shadowColor = rgba(ambar, 0.6 * intensidad);
    g.shadowBlur = 8;
    g.beginPath();
    g.arc(colX[1], yOculta(h), 6.5, 0, Math.PI * 2);
    g.fill();
  }
  g.shadowBlur = 0;

  g.textAlign = 'left';
  for (let s = 0; s < salida.salidas; s += 1) {
    g.fillStyle = verde;
    g.beginPath();
    g.arc(colX[2], ySalida(s), 5.5, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = claro;
    g.font = '600 12px JetBrains Mono, ui-monospace, monospace';
    g.fillText(etiquetas[s].replace('_', ' '), colX[2] + 14, ySalida(s) + 4);
  }

  g.fillStyle = rgba(claro, 0.6);
  g.font = '600 10px JetBrains Mono, ui-monospace, monospace';
  g.textAlign = 'center';
  g.fillText('ENTRADA', colX[0], 18);
  g.fillText(
    `OCULTA · ${ocultas.salidas}${ocultas.salidas > nOcultas ? ` (se ven ${nOcultas})` : ''}`,
    colX[1],
    18,
  );
  g.textAlign = 'left';
  g.fillText('INTENCIÓN', colX[2] - 4, 18);

  const total = capas.reduce(
    (suma, k) => suma + k.entradas * k.salidas + k.salidas,
    0,
  );
  $('nota-red').textContent =
    `${total.toLocaleString('es')} parámetros: ocupan unos ${((total * 4) / 1024).toFixed(0)} KB y calculan una respuesta en menos de un milisegundo.`;
}

/* ---------- matriz de confusión ---------- */
function dibujarMatriz() {
  const lienzo = $('matriz');
  const { g, ancho, alto } = preparar(lienzo);
  g.clearRect(0, 0, ancho, alto);
  const contenedor = $('precision-clases');
  contenedor.replaceChildren();
  const m = estado?.matriz;
  if (!m) {
    g.fillStyle = css('--tinta-suave');
    g.font = '500 13px Archivo, sans-serif';
    g.textAlign = 'center';
    g.fillText('Sin datos todavía', ancho / 2, alto / 2);
    contenedor.append(
      Object.assign(document.createElement('p'), {
        className: 'nota',
        textContent: 'Entrená un modelo para medir cada intención.',
      }),
    );
    return;
  }
  $('nota-matriz').textContent =
    'Cada celda cuenta cuántas frases de esa fila la red puso en esa columna.';
  const etiquetas = estado.modelo.etiquetas;
  const n = m.length;
  const izq = 108;
  const sup = 92;
  const lado = Math.min((ancho - izq - 8) / n, (alto - sup - 8) / n);
  const verde = css('--a-tiempo');
  const rojo = css('--cancelado');
  m.forEach((fila, i) => {
    const total = fila.reduce((s, v) => s + v, 0) || 1;
    fila.forEach((v, j) => {
      const a = v / total;
      g.fillStyle =
        i === j
          ? rgba(verde, 0.12 + 0.88 * a)
          : rgba(rojo, v === 0 ? 0.05 : 0.25 + 0.75 * a);
      g.beginPath();
      g.roundRect(
        izq + j * lado + 1,
        sup + i * lado + 1,
        lado - 2,
        lado - 2,
        4,
      );
      g.fill();
      if (v > 0 && lado > 22) {
        g.fillStyle = a > 0.55 && i === j ? '#fff' : css('--tinta');
        g.font = '600 10px JetBrains Mono, ui-monospace, monospace';
        g.textAlign = 'center';
        g.fillText(
          String(v),
          izq + j * lado + lado / 2,
          sup + i * lado + lado / 2 + 3,
        );
      }
    });
    g.fillStyle = css('--tinta');
    g.font = '500 11px JetBrains Mono, ui-monospace, monospace';
    g.textAlign = 'right';
    g.fillText(
      etiquetas[i].replace('_', ' '),
      izq - 8,
      sup + i * lado + lado / 2 + 4,
    );
    g.save();
    g.translate(izq + i * lado + lado / 2, sup - 8);
    g.rotate(-Math.PI / 3.2);
    g.textAlign = 'left';
    g.fillText(etiquetas[i].replace('_', ' '), 0, 0);
    g.restore();
  });
  estado.precisionPorClase.forEach((p, i) => {
    const nombre = etiquetas[i].replace('_', ' ');
    const nivel = p === null ? '' : p >= 0.9 ? '' : p >= 0.7 ? 'media' : 'baja';
    const fila = document.createElement('div');
    fila.className = 'barra';
    const a = Object.assign(document.createElement('span'), {
      textContent: nombre,
    });
    const pista = document.createElement('div');
    pista.className = 'pista';
    const relleno = document.createElement('div');
    relleno.className = `relleno ${nivel}`;
    relleno.style.width = `${Math.round((p ?? 0) * 100)}%`;
    pista.append(relleno);
    const valor = Object.assign(document.createElement('span'), {
      className: 'valor',
      textContent: p === null ? 'sin datos' : porcentaje(p),
    });
    fila.append(a, pista, valor);
    contenedor.append(fila);
  });
}

/* ---------- frases ---------- */
function pintarChips() {
  const caja = $('chips-intenciones');
  caja.replaceChildren();
  const porEtiqueta = estado?.porEtiqueta ?? {};
  const total = Object.values(porEtiqueta).reduce((s, v) => s + v, 0);
  const crear = (valor, texto) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = texto;
    b.setAttribute('aria-pressed', String(filtro === valor));
    b.onclick = () => {
      filtro = valor;
      mostrarTodas = false;
      pintarChips();
      pintarTabla();
    };
    caja.append(b);
  };
  crear('', `todas · ${total}`);
  for (const etiqueta of estado?.modelo.etiquetas ?? [])
    crear(
      etiqueta,
      `${etiqueta.replace('_', ' ')} · ${porEtiqueta[etiqueta] ?? 0}`,
    );
}

function pintarTabla() {
  const tabla = $('tabla-frases');
  tabla.replaceChildren();
  const texto = busqueda.trim().toLowerCase();
  const visibles = frases.filter(
    (f) =>
      (filtro === '' || f.etiqueta === filtro) &&
      (texto === '' || f.texto.toLowerCase().includes(texto)),
  );
  if (visibles.length === 0) {
    tabla.append(
      Object.assign(document.createElement('p'), {
        className: 'vacio-tabla',
        textContent: 'No hay frases con ese filtro.',
      }),
    );
  }
  const lista = mostrarTodas ? visibles : visibles.slice(0, MAXIMO_RENGLONES);
  for (const frase of lista) {
    const fila = document.createElement('div');
    fila.className = 'renglon';
    fila.append(
      Object.assign(document.createElement('span'), {
        className: 'etiqueta',
        textContent: frase.etiqueta.replace('_', ' '),
      }),
      Object.assign(document.createElement('span'), {
        textContent: frase.texto,
      }),
    );
    if (frase.origen === 'propia') {
      const quitar = document.createElement('button');
      quitar.type = 'button';
      quitar.className = 'chico peligro';
      quitar.textContent = 'Quitar';
      quitar.setAttribute('aria-label', `Quitar la frase: ${frase.texto}`);
      quitar.onclick = async () => {
        try {
          await api(
            '/api/frases',
            json('DELETE', { etiqueta: frase.etiqueta, texto: frase.texto }),
          );
          toast('Frase quitada.');
          await cargar();
        } catch (error) {
          toast(mensajeDe(error), 'error');
        }
      };
      fila.append(quitar);
    } else {
      fila.append(
        Object.assign(document.createElement('span'), {
          className: 'origen',
          textContent: 'plantilla',
        }),
      );
    }
    tabla.append(fila);
  }
  const resto = visibles.length - lista.length;
  $('conteo-frases').textContent =
    resto > 0
      ? `Mostrando ${lista.length} de ${visibles.length} frases.`
      : `${visibles.length} frases.`;
  if (resto > 0) {
    const mas = document.createElement('button');
    mas.type = 'button';
    mas.className = 'chico';
    mas.textContent = `Mostrar las ${resto} que faltan`;
    mas.onclick = () => {
      mostrarTodas = true;
      pintarTabla();
    };
    $('conteo-frases').append(' ', mas);
  }
}

function pintarSelector() {
  const selector = $('etiqueta-frase');
  const actual = selector.value;
  selector.replaceChildren(
    ...(estado?.modelo.etiquetas ?? []).map((e) =>
      Object.assign(document.createElement('option'), {
        textContent: e.replace('_', ' '),
        value: e,
      }),
    ),
  );
  if (actual) selector.value = actual;
}

function mensajeDe(error) {
  return error.message === 'sin-conexion'
    ? 'No hay conexión con el entrenador.'
    : error.message;
}

async function cargar() {
  try {
    [estado, frases] = await Promise.all([
      api('/api/estado'),
      api('/api/frases'),
    ]);
    aviso(null);
  } catch (error) {
    aviso(
      error.message === 'sin-conexion'
        ? 'Se perdió la conexión con el entrenador. Revisá que siga corriendo (pnpm --filter @anden/entrenador iniciar) y volvé a abrir esta página.'
        : error.message,
    );
    return;
  }
  pintarTablero();
  pintarChips();
  pintarSelector();
  pintarTabla();
  dibujarRed();
  dibujarMatriz();
  $('boton-exportar').disabled = !estado.sinExportar;
}

/* ---------- agregar frase ---------- */
$('form-frase').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const entrada = $('texto-frase');
  const texto = entrada.value.trim();
  if (texto.length < 2) return;
  try {
    await api(
      '/api/frases',
      json('POST', { etiqueta: $('etiqueta-frase').value, texto }),
    );
    entrada.value = '';
    $('nota-frase').textContent =
      'Agregada. Entrená de nuevo para que la red la aprenda.';
    toast('Frase agregada.');
    await cargar();
    entrada.focus();
  } catch (error) {
    $('nota-frase').textContent = mensajeDe(error);
    $('nota-frase').classList.add('alerta');
    setTimeout(() => $('nota-frase').classList.remove('alerta'), 3000);
  }
});
$('buscar-frase').addEventListener('input', (e) => {
  busqueda = e.target.value;
  mostrarTodas = false;
  pintarTabla();
});

/* ---------- entrenar ---------- */
function leerOpciones() {
  try {
    return {
      ...OPCIONES_DE_SIEMPRE,
      ...JSON.parse(localStorage.getItem(CLAVE_OPCIONES) ?? '{}'),
    };
  } catch {
    return { ...OPCIONES_DE_SIEMPRE };
  }
}

function ponerOpciones(opciones) {
  for (const [nombre, valor] of Object.entries(opciones)) {
    const campo = document.querySelector(`#form-entrenar [name=${nombre}]`);
    if (campo) campo.value = valor;
  }
}

function guardarOpciones() {
  try {
    localStorage.setItem(
      CLAVE_OPCIONES,
      JSON.stringify(Object.fromEntries(new FormData($('form-entrenar')))),
    );
  } catch {
    /* sin almacenamiento se usan los valores de siempre */
  }
}

function progreso(fraccion) {
  $('barra-progreso').style.width = `${Math.round(fraccion * 100)}%`;
  $('barra-progreso').parentElement.setAttribute(
    'aria-valuenow',
    String(Math.round(fraccion * 100)),
  );
}

$('boton-restablecer').addEventListener('click', () => {
  ponerOpciones(OPCIONES_DE_SIEMPRE);
  guardarOpciones();
  toast('Valores de siempre.');
});

$('form-entrenar').addEventListener('submit', (evento) => {
  evento.preventDefault();
  if (entrenando) return;
  guardarOpciones();
  const datos = new URLSearchParams(new FormData(evento.target));
  const total = Number(datos.get('epocas')) || 1;
  historial = [];
  entrenando = true;
  progreso(0);
  const boton = $('boton-entrenar');
  boton.disabled = true;
  boton.textContent = 'Entrenando…';
  $('nota-entrenar').textContent = 'Entrenando con todas las frases…';
  const fuente = new EventSource(`/api/entrenar?${datos}`);
  let termino = false;
  const cerrar = () => {
    entrenando = false;
    fuente.close();
    boton.disabled = false;
    boton.textContent = 'Entrenar';
  };
  fuente.addEventListener('epoca', (e) => {
    const info = JSON.parse(e.data);
    historial.push(info);
    progreso(info.epoca / total);
    $('t-pie').textContent =
      `Entrenando · época ${info.epoca} de ${total} · pérdida ${info.perdida.toFixed(3)}${info.precisionValidacion !== null ? ` · validación ${porcentaje(info.precisionValidacion)}` : ''}`;
    dibujarCurvas();
  });
  fuente.addEventListener('midiendo', () => {
    $('t-pie').textContent =
      'Midiendo el acierto real con plantillas que la red nunca vio…';
    $('nota-entrenar').textContent = 'Midiendo el acierto real…';
  });
  fuente.addEventListener('fin', async () => {
    termino = true;
    cerrar();
    progreso(1);
    $('nota-entrenar').textContent =
      'Listo. Probala y, si te gusta, guardala en la app.';
    toast('Entrenamiento terminado.');
    await cargar();
  });
  fuente.addEventListener('error', (e) => {
    if (termino) return;
    cerrar();
    $('nota-entrenar').textContent = 'El entrenamiento se interrumpió.';
    toast(
      e.data ? JSON.parse(e.data).mensaje : 'Se interrumpió el entrenamiento.',
      'error',
    );
    cargar();
  });
});

/* ---------- guardar el modelo en la app (con confirmación) ---------- */
$('boton-exportar').addEventListener('click', async () => {
  const boton = $('boton-exportar');
  if (!confirmandoGuardar) {
    boton.textContent = 'Confirmar: reescribe intenciones.ts';
    confirmandoGuardar = setTimeout(() => {
      confirmandoGuardar = null;
      boton.textContent = 'Guardar este modelo en la app';
    }, 4000);
    return;
  }
  clearTimeout(confirmandoGuardar);
  confirmandoGuardar = null;
  boton.textContent = 'Guardar este modelo en la app';
  try {
    const r = await api('/api/exportar', { method: 'POST' });
    $('nota-exportar').textContent =
      `Guardado en ${r.archivo}. Hacé commit de ese archivo y volvé a compilar la app.`;
    toast('Modelo guardado en la app.');
  } catch (error) {
    toast(mensajeDe(error), 'error');
  }
});

/* ---------- probar ---------- */
function pintarResultado(lista) {
  const caja = $('resultado-probar');
  caja.replaceChildren();
  lista.forEach((p, i) => {
    const fila = document.createElement('div');
    fila.className = `renglon-led${i === 0 ? ' primero' : ''}`;
    const nombre = Object.assign(document.createElement('span'), {
      className: 'nombre',
      textContent: p.etiqueta.replace('_', ' '),
    });
    const segmentos = document.createElement('div');
    segmentos.className = 'segmentos';
    const encendidos = Math.round(p.probabilidad * 20);
    for (let k = 0; k < 20; k += 1)
      segmentos.append(
        Object.assign(document.createElement('i'), {
          className: k < encendidos ? 'on' : '',
        }),
      );
    const valor = Object.assign(document.createElement('span'), {
      className: 'valor',
      textContent: `${(p.probabilidad * 100).toFixed(1)}%`,
    });
    fila.append(nombre, segmentos, valor);
    caja.append(fila);
  });
  const primera = lista[0];
  if (primera && primera.probabilidad < UMBRAL) {
    caja.append(
      Object.assign(document.createElement('p'), {
        className: 'vacio',
        style: 'margin-top:12px',
        textContent: 'POR DEBAJO DEL 45 %: EN LA APP DIRÍA «NO TE ENTENDÍ».',
      }),
    );
  }
}

async function probar(texto) {
  try {
    pintarResultado(await api('/api/probar', json('POST', { texto })));
  } catch (error) {
    toast(mensajeDe(error), 'error');
  }
}

$('form-probar').addEventListener('submit', (evento) => {
  evento.preventDefault();
  void probar($('texto-probar').value);
});

for (const ejemplo of EJEMPLOS) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = ejemplo;
  b.onclick = () => {
    $('texto-probar').value = ejemplo;
    void probar(ejemplo);
  };
  $('ejemplos').append(b);
}

/* ---------- navegación ---------- */
const enlaces = [...document.querySelectorAll('[data-seccion]')];
const observador = new IntersectionObserver(
  (entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      for (const a of enlaces)
        a.setAttribute(
          'aria-current',
          String(a.dataset.seccion === entrada.target.id),
        );
    }
  },
  { rootMargin: '-35% 0px -55% 0px' },
);
for (const a of enlaces) {
  const seccion = document.getElementById(a.dataset.seccion);
  if (seccion) observador.observe(seccion);
}

/* ---------- arranque ---------- */
ponerOpciones(leerOpciones());
dibujarCurvas();
void cargar();
window.addEventListener('resize', () => {
  dibujarCurvas();
  dibujarRed();
  dibujarMatriz();
});
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', () => {
    dibujarCurvas();
    dibujarRed();
    dibujarMatriz();
  });
