"""genera los sonidos de la app: portada (arranque, bocina, salida), confirmacion, bienvenida, plus, toque y los
de las escenas (boleto, envio, abordo, pago, inicio y fin de viaje, recordatorio, favorito).

sintesis propia, sin muestras externas, a 44.1 kHz. las campanas usan parciales inarmonicos con pares
desafinados para que brillen; el motor es un tren de explosiones con cuerpo resonante; todo pasa por una
reverberacion corta de sala y un filtro suave para quitar el aspecto de onda pura.

uso: python3 herramientas/generar-sonidos.py
"""
import wave
from pathlib import Path

import numpy as np

TASA = 44100
SALIDA = Path(__file__).resolve().parent.parent / "assets" / "sonidos"
rng = np.random.default_rng(7)


def t_de(segundos):
    return np.linspace(0, segundos, int(TASA * segundos), endpoint=False)


def envolvente(n, subida, bajada):
    e = np.ones(n)
    a, b = max(1, int(TASA * subida)), max(1, int(TASA * bajada))
    e[:a] = np.linspace(0, 1, a)
    e[-b:] = np.minimum(e[-b:], np.linspace(1, 0, b))
    return e


def pasa_bajos(x, corte):
    """filtro de un polo: quita el filo digital de las ondas simples"""
    a = np.exp(-2 * np.pi * corte / TASA)
    salida = np.empty_like(x)
    previo = 0.0
    for i, v in enumerate(x):
        previo = (1 - a) * v + a * previo
        salida[i] = previo
    return salida


def pasa_bajos_rapido(x, corte):
    """el mismo filtro aplicado en el dominio de la frecuencia: sirve para senales largas"""
    espectro = np.fft.rfft(x)
    freq = np.fft.rfftfreq(len(x), 1 / TASA)
    espectro *= 1 / np.sqrt(1 + (freq / corte) ** 4)
    return np.fft.irfft(espectro, len(x))


def pasa_altos(x, corte):
    espectro = np.fft.rfft(x)
    freq = np.fft.rfftfreq(len(x), 1 / TASA)
    espectro *= (freq / corte) ** 2 / (1 + (freq / corte) ** 2)
    return np.fft.irfft(espectro, len(x))


def ruido(n, corte=None):
    r = rng.standard_normal(n)
    return pasa_bajos_rapido(r, corte) if corte else r


def reverb(x, tiempo=0.7, mezcla=0.22):
    """reverberacion de sala pequena: respuesta de ruido que se apaga, con graves recortados"""
    n = int(TASA * tiempo)
    t = np.linspace(0, tiempo, n, endpoint=False)
    respuesta = rng.standard_normal(n) * np.exp(-t * (6.9 / tiempo))
    respuesta = pasa_bajos_rapido(respuesta, 5500)
    respuesta[: int(TASA * 0.004)] *= 0.0
    respuesta /= np.sqrt(np.sum(respuesta**2))
    largo = len(x) + n
    mojado = np.fft.irfft(np.fft.rfft(x, largo) * np.fft.rfft(respuesta, largo), largo)
    seco = np.pad(x, (0, n))
    return (1 - mezcla) * seco + mezcla * mojado * (np.max(np.abs(x)) / max(1e-9, np.max(np.abs(mojado))))


def campana(frecuencia, duracion, caida=4.5, brillo=1.0):
    """nota de campana: parciales inarmonicos de una campana de bronce, cada uno con su propia caida y un par desafinado"""
    t = t_de(duracion)
    parciales = ((1.0, 1.0, 1.0), (2.0, 0.55, 1.5), (2.76, 0.4 * brillo, 2.2), (4.07, 0.22 * brillo, 3.0), (5.4, 0.14 * brillo, 4.2), (8.93, 0.06 * brillo, 6.0))
    senal = np.zeros(len(t))
    for razon, peso, rapidez in parciales:
        for desafine, mitad in ((1.0, 0.6), (1.0021, 0.4)):
            senal += mitad * peso * np.sin(2 * np.pi * frecuencia * razon * desafine * t) * np.exp(-t * caida * rapidez)
    golpe = ruido(len(t), 6000) * np.exp(-t * 260) * 0.25
    return (senal + golpe) * envolvente(len(t), 0.0015, min(0.2, duracion / 3))


def madera(frecuencia, duracion, caida=14.0):
    """toque de marimba o madera: fundamental con un parcial agudo que muere rapido"""
    t = t_de(duracion)
    senal = np.sin(2 * np.pi * frecuencia * t) * np.exp(-t * caida)
    senal += 0.35 * np.sin(2 * np.pi * frecuencia * 3.93 * t) * np.exp(-t * caida * 4.5)
    senal += 0.15 * np.sin(2 * np.pi * frecuencia * 9.2 * t) * np.exp(-t * caida * 9)
    return senal * envolvente(len(t), 0.001, min(0.05, duracion / 3))


def poner(destino, nota, inicio, volumen=1.0):
    """suma una nota en el segundo indicado"""
    i = int(TASA * inicio)
    fin = min(len(destino), i + len(nota))
    if fin > i:
        destino[i:fin] += volumen * nota[: fin - i]


def motor(frecuencia_explosion, ruido_mecanico=0.18):
    """diesel de bus: un tren de explosiones con algo de irregularidad, un cuerpo que resuena y el rumor del escape"""
    n = len(frecuencia_explosion)
    fase = np.cumsum(frecuencia_explosion) / TASA
    cruces = np.where(np.diff(np.floor(fase)) > 0)[0]
    pulsos = np.zeros(n)
    for c in cruces:
        pulsos[c] = rng.uniform(0.65, 1.0)
    largo = int(TASA * 0.09)
    t = np.arange(largo) / TASA
    cuerpo = np.sin(2 * np.pi * 88 * t) * np.exp(-t * 48) + 0.5 * np.sin(2 * np.pi * 176 * t) * np.exp(-t * 70)
    cuerpo += 0.25 * ruido(largo, 900) * np.exp(-t * 90)
    crudo = np.fft.irfft(np.fft.rfft(pulsos, n + largo) * np.fft.rfft(cuerpo, n + largo), n + largo)[:n]
    rumor = pasa_bajos_rapido(ruido(n), 160) * 9
    mecanico = pasa_altos(pasa_bajos_rapido(ruido(n), 2400), 500) * ruido_mecanico * 3
    senal = crudo + 0.45 * rumor + mecanico * (np.abs(crudo) / max(1e-9, np.max(np.abs(crudo))))
    return np.tanh(pasa_bajos_rapido(senal, 1500) * 1.4)


def guardar(nombre, senal, volumen=0.8):
    senal = senal - np.mean(senal)
    senal = senal / max(1e-9, np.max(np.abs(senal))) * volumen
    datos = (np.clip(senal, -1, 1) * 32767).astype("<i2")
    with wave.open(str(SALIDA / nombre), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(TASA)
        w.writeframes(datos.tobytes())


def arranque():
    """la llave gira, el motor tose dos veces, agarra y se estabiliza en ralenti"""
    t = t_de(2.4)
    frecuencia = np.where(t < 0.5, 7 + 8 * t, 11 + 0 * t)
    frecuencia = np.where((t >= 0.5) & (t < 0.95), 11 + 24 * (t - 0.5) / 0.45, frecuencia)
    frecuencia = np.where((t >= 0.95), 35 - 10 * np.minimum(1, (t - 0.95) / 0.9) + 0.8 * np.sin(2 * np.pi * 5 * t), frecuencia)
    senal = motor(frecuencia) * envolvente(len(t), 0.04, 0.5)
    llave = ruido(len(t), 3000) * np.exp(-((t - 0.04) / 0.02) ** 2) * 0.5
    return reverb(senal + llave, 0.45, 0.16)


def bocina():
    """bocina de aire de bus: dos tonos con armonicos de diente de sierra suavizados y un ataque con aire"""
    t = t_de(1.1)
    ataque = 1 - np.exp(-t * 90)
    caida = np.where(t < 0.7, 1.0, np.exp(-(t - 0.7) * 18))
    senal = np.zeros(len(t))
    for base, peso in ((392.0, 1.0), (493.9, 0.9)):
        vibra = 1 + 0.002 * np.sin(2 * np.pi * 5.5 * t)
        for k in range(1, 9):
            senal += peso * np.sin(2 * np.pi * base * k * t * vibra) / (k**1.15)
    senal = np.tanh(senal * 0.9)
    aire = ruido(len(t), 2500) * np.exp(-t * 30) * 0.5
    return reverb((senal * 0.75 + aire) * ataque * caida, 0.6, 0.25)


def salida():
    """el bus acelera, cambia de marcha y se aleja: tono que sube, volumen que se apaga"""
    t = t_de(3.0)
    base = 24 + 40 * (1 - np.exp(-t * 1.3))
    base *= 1 - 0.16 * ((t > 1.2) & (t < 1.32))
    senal = motor(base)
    lejania = np.exp(-np.maximum(0, t - 0.4) * 0.95)
    return reverb(senal * lejania * envolvente(len(t), 0.05, 0.4), 0.6, 0.2)


def confirmacion():
    """sello de boleto y arpegio de campanas ascendente: do, mi, sol, do agudo"""
    senal = np.zeros(int(TASA * 2.0))
    t = t_de(2.0)
    senal += 0.9 * np.sin(2 * np.pi * 95 * t) * np.exp(-t * 38) + 0.35 * ruido(len(t), 1800) * np.exp(-t * 90)
    for inicio, nota, vol in ((0.10, 523.25, 0.55), (0.24, 659.25, 0.55), (0.38, 783.99, 0.6), (0.54, 1046.5, 0.75)):
        poner(senal, campana(nota, 1.4, 3.6), inicio, vol)
    return reverb(senal * envolvente(len(senal), 0.002, 0.5), 0.9, 0.28)


def bienvenida():
    """un acorde de do mayor que se abre como una puerta y termina con un destello agudo"""
    senal = np.zeros(int(TASA * 2.8))
    for inicio, nota, vol in ((0.0, 261.63, 0.6), (0.10, 329.63, 0.55), (0.20, 392.0, 0.55), (0.32, 523.25, 0.55), (0.46, 659.25, 0.5), (0.62, 1046.5, 0.45)):
        poner(senal, campana(nota, 2.2, 2.6, 0.8), inicio, vol)
    t = t_de(2.8)
    suave = np.zeros(len(t))
    for frecuencia in (130.81, 196.0, 261.63):
        suave += np.sin(2 * np.pi * frecuencia * t)
    senal += 0.12 * suave * (1 - np.exp(-t * 8)) * np.exp(-t * 1.1)
    return reverb(senal * envolvente(len(senal), 0.002, 0.8), 1.2, 0.32)


def plus():
    """fanfarria breve de campanas y un barrido brillante: suena a premio"""
    senal = np.zeros(int(TASA * 3.0))
    notas = ((0.00, 523.25), (0.12, 659.25), (0.24, 783.99), (0.36, 1046.5), (0.52, 1318.5), (0.68, 1568.0))
    for inicio, nota in notas:
        poner(senal, campana(nota, 1.8, 3.4), inicio, 0.5)
    poner(senal, campana(2093.0, 2.2, 2.4, 1.2), 0.86, 0.5)
    t = t_de(3.0)
    destello = ruido(len(t), 9000) * np.exp(-((t - 0.95) / 0.25) ** 2) * 0.16
    acorde = sum(np.sin(2 * np.pi * f * t) for f in (261.63, 329.63, 392.0, 523.25))
    senal += destello + 0.1 * acorde * (1 - np.exp(-(t - 0.8).clip(0) * 9)) * (t >= 0.8) * np.exp(-(t - 0.8).clip(0) * 1.3)
    return reverb(senal * envolvente(len(senal), 0.002, 0.9), 1.3, 0.34)


def toque():
    """golpecito de madera al elegir un asiento: seco, corto y sin metal"""
    return reverb(madera(1175.0, 0.16, 30.0), 0.12, 0.1)


def boleto():
    """papel que se desprende con textura y una campanita limpia al final"""
    t = t_de(1.3)
    arrastre = pasa_altos(ruido(len(t), 7000), 1800) * (t < 0.34) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 38 * t)))
    arrastre *= np.exp(-t * 4.5)
    dientes = ruido(len(t), 8000) * (np.sin(2 * np.pi * 95 * t) > 0.92) * (t < 0.34) * 0.5
    senal = 0.9 * arrastre + dientes
    poner(senal, campana(1318.5, 0.9, 5.5), 0.32, 0.7)
    return reverb(senal * envolvente(len(t), 0.004, 0.3), 0.4, 0.2)


def envio():
    """el paquete cae en el bus: soplo que baja, golpe grave con cuerpo y campanita de entrega"""
    t = t_de(1.5)
    soplo = pasa_bajos_rapido(ruido(len(t)), 2200) * np.exp(-((t - 0.25) / 0.17) ** 2) * 0.8
    barrido = np.sin(2 * np.pi * np.cumsum(900 - 700 * np.minimum(1, t / 0.4)) / TASA) * np.exp(-t * 6) * (t < 0.45) * 0.3
    local = np.clip(t - 0.42, 0, None)
    golpe = (np.sin(2 * np.pi * 68 * local) + 0.5 * np.sin(2 * np.pi * 136 * local)) * np.exp(-local * 14) * (t >= 0.42)
    golpe += 0.35 * ruido(len(t), 500) * np.exp(-local * 32) * (t >= 0.42)
    senal = soplo + barrido + 1.1 * golpe
    poner(senal, campana(659.25, 1.0, 5.0), 0.62, 0.4)
    poner(senal, campana(987.77, 1.0, 5.0), 0.66, 0.35)
    return reverb(senal * envolvente(len(t), 0.004, 0.35), 0.5, 0.22)


def abordo():
    """dos toques de madera graves, como un sello suave sobre el pase"""
    senal = np.zeros(int(TASA * 0.4))
    poner(senal, madera(330.0, 0.25, 24.0), 0.0, 1.0)
    poner(senal, madera(440.0, 0.25, 24.0), 0.09, 0.9)
    return reverb(senal, 0.18, 0.12)


def pago():
    """monedas que chocan: metal agudo con varios parciales y un tintineo de rebote"""
    senal = np.zeros(int(TASA * 1.0))
    for inicio, base, vol in ((0.0, 2093.0, 0.8), (0.07, 2637.0, 0.7), (0.15, 3136.0, 0.45), (0.19, 2349.0, 0.3)):
        poner(senal, campana(base, 0.7, 9.0, 1.4), inicio, vol)
    return reverb(senal, 0.3, 0.18)


def inicio_viaje():
    """el freno de aire suelta, el motor sube de vueltas y dos campanas anuncian la salida"""
    t = t_de(2.8)
    base = 16 + 40 * (1 - np.exp(-t * 1.3))
    senal = 0.9 * motor(base) * envolvente(len(t), 0.05, 0.5)
    aire = pasa_altos(ruido(len(t), 6000), 1500) * np.exp(-((t - 0.3) / 0.14) ** 2) * 0.7
    senal += aire
    poner(senal, campana(784.0, 1.4, 4.0), 1.1, 0.35)
    poner(senal, campana(1046.5, 1.4, 4.0), 1.28, 0.35)
    return reverb(senal, 0.55, 0.2)


def fin_viaje():
    """el bus frena con aire y suena una cadencia de campanas que baja: sol, mi, do"""
    t = t_de(2.6)
    aire = pasa_altos(ruido(len(t), 6000), 1200) * np.exp(-((t - 0.18) / 0.24) ** 2) * 0.9
    base = 38 - 24 * np.minimum(1, t / 1.0)
    freno = 0.55 * motor(base) * np.exp(-t * 2.0)
    senal = aire + freno
    for inicio, nota in ((0.55, 783.99), (0.87, 659.25), (1.2, 523.25)):
        poner(senal, campana(nota, 1.4, 3.6), inicio, 0.5)
    return reverb(senal * envolvente(len(t), 0.01, 0.5), 0.7, 0.24)


def recordatorio():
    """timbre de campana doble, claro, con un eco de sala corto"""
    senal = np.zeros(int(TASA * 1.6))
    poner(senal, campana(1174.7, 1.2, 4.2), 0.0, 0.8)
    poner(senal, campana(1568.0, 1.2, 4.2), 0.2, 0.8)
    return reverb(senal * envolvente(len(senal), 0.002, 0.4), 0.7, 0.26)


def favorito():
    """destello ascendente de tres notas de madera brillante y una chispa de campana"""
    senal = np.zeros(int(TASA * 0.8))
    for inicio, nota in ((0.0, 1318.5), (0.07, 1760.0), (0.14, 2349.3)):
        poner(senal, madera(nota, 0.3, 11.0), inicio, 0.7)
    poner(senal, campana(3136.0, 0.5, 8.0, 1.2), 0.2, 0.3)
    return reverb(senal, 0.3, 0.18)


if __name__ == "__main__":
    SALIDA.mkdir(parents=True, exist_ok=True)
    guardar("arranque.wav", arranque())
    guardar("bocina.wav", bocina())
    guardar("salida.wav", salida())
    guardar("confirmacion.wav", confirmacion())
    guardar("bienvenida.wav", bienvenida())
    guardar("plus.wav", plus())
    guardar("toque.wav", toque(), 0.7)
    guardar("boleto.wav", boleto())
    guardar("envio.wav", envio())
    guardar("abordo.wav", abordo(), 0.7)
    guardar("pago.wav", pago(), 0.7)
    guardar("inicio.wav", inicio_viaje())
    guardar("fin.wav", fin_viaje())
    guardar("recordatorio.wav", recordatorio(), 0.7)
    guardar("favorito.wav", favorito(), 0.6)
