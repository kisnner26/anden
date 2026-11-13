"""genera los sonidos de la app: portada (arranque, bocina, salida), confirmacion, toque y los de las escenas
(boleto, envio, abordo, pago, inicio y fin de viaje, recordatorio, favorito).

sintesis propia, sin muestras externas. uso: python3 herramientas/generar-sonidos.py
"""
import wave
from pathlib import Path

import numpy as np

TASA = 22050
SALIDA = Path(__file__).resolve().parent.parent / "assets" / "sonidos"
rng = np.random.default_rng(7)


def t_de(segundos):
    return np.linspace(0, segundos, int(TASA * segundos), endpoint=False)


def envolvente(n, subida, bajada):
    e = np.ones(n)
    a, b = int(TASA * subida), int(TASA * bajada)
    e[:a] = np.linspace(0, 1, a)
    e[-b:] = np.linspace(1, 0, b)
    return e


def motor(frecuencia_base):
    """ronroneo de diesel: armonicos de la frecuencia de explosion mas ruido filtrado"""
    fase = 2 * np.pi * np.cumsum(frecuencia_base) / TASA
    onda = sum(np.sin(fase * k) / k for k in (1, 2, 3, 4, 6))
    pulso = 0.6 + 0.4 * np.sin(fase * 0.5)
    ruido = np.convolve(rng.standard_normal(len(fase)), np.ones(40) / 40, "same")
    return (onda * pulso + 0.8 * ruido) / 3.2


def guardar(nombre, senal, volumen=0.8):
    senal = senal / max(1e-9, np.max(np.abs(senal))) * volumen
    datos = (senal * 32767).astype("<i2")
    with wave.open(str(SALIDA / nombre), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(TASA)
        w.writeframes(datos.tobytes())


def arranque():
    """el motor se enciende con dos tirones y se estabiliza en ralenti"""
    t = t_de(1.8)
    base = np.where(t < 0.55, 9 + 20 * t, 20 + 4 * np.sin(2 * np.pi * 7 * t))
    base = np.where((t > 0.55) & (t < 0.8), 20 + 90 * (t - 0.55), base)
    base = np.where(t >= 0.8, 42 - 22 * np.minimum(1, (t - 0.8) / 0.5), base)
    senal = motor(base) * envolvente(len(t), 0.03, 0.35)
    return senal


def bocina():
    """dos tonos de bocina de bus, quinta justa"""
    t = t_de(0.9)
    tono = np.sin(2 * np.pi * 392 * t) + np.sin(2 * np.pi * 523 * t)
    tono += 0.35 * np.sin(2 * np.pi * 784 * t) + 0.25 * np.sin(2 * np.pi * 1046 * t)
    tono = np.tanh(tono * 1.6)
    corte = np.where(t < 0.62, 1.0, np.exp(-(t - 0.62) * 22))
    return tono * corte * envolvente(len(t), 0.012, 0.03)


def salida():
    """el bus acelera y se aleja: el tono sube y el volumen se apaga"""
    t = t_de(2.6)
    base = 22 + 46 * (1 - np.exp(-t * 1.6))
    senal = motor(base)
    lejania = np.exp(-np.maximum(0, t - 0.5) * 1.15)
    return senal * lejania * envolvente(len(t), 0.04, 0.2)


def confirmacion():
    """sello de boleto y arpegio ascendente: do, mi, sol, do agudo"""
    t = t_de(1.3)
    senal = np.zeros(len(t))
    golpe = np.exp(-t * 60) * (np.sin(2 * np.pi * 110 * t) + 0.4 * rng.standard_normal(len(t)))
    senal += 0.7 * golpe
    for inicio, nota in ((0.12, 523.25), (0.26, 659.25), (0.40, 783.99), (0.56, 1046.5)):
        local = np.clip(t - inicio, 0, None)
        vivo = (t >= inicio).astype(float)
        campana = np.sin(2 * np.pi * nota * local) + 0.3 * np.sin(2 * np.pi * nota * 2 * local)
        senal += 0.55 * campana * np.exp(-local * 5.5) * vivo
    return senal * envolvente(len(t), 0.004, 0.25)


def toque():
    """clic seco y breve al elegir un asiento: dos parciales con caida rapida"""
    t = t_de(0.09)
    senal = np.sin(2 * np.pi * 880 * t) + 0.5 * np.sin(2 * np.pi * 1320 * t)
    return senal * np.exp(-t * 55) * envolvente(len(t), 0.002, 0.02)


def filtrar_ruido(n, ventana):
    """ruido de banda baja: promedio movil de ruido blanco"""
    return np.convolve(rng.standard_normal(n), np.ones(ventana) / ventana, "same")


def boleto():
    """papel que se desprende y una campanita corta al final"""
    t = t_de(0.95)
    papel = filtrar_ruido(len(t), 6) * np.exp(-t * 9) * (t < 0.35)
    papel += 0.5 * rng.standard_normal(len(t)) * np.exp(-t * 40)
    local = np.clip(t - 0.30, 0, None)
    campana = np.sin(2 * np.pi * 1318.5 * local) + 0.3 * np.sin(2 * np.pi * 2637 * local)
    campana *= np.exp(-local * 7) * (t >= 0.30)
    return (0.9 * papel + 0.7 * campana) * envolvente(len(t), 0.004, 0.2)


def envio():
    """el paquete cae en el bus: soplo que baja y golpe grave"""
    t = t_de(1.1)
    soplo = filtrar_ruido(len(t), 18) * np.exp(-((t - 0.25) / 0.18) ** 2)
    barrido = np.sin(2 * np.pi * np.cumsum(900 - 700 * np.minimum(1, t / 0.4)) / TASA)
    barrido *= np.exp(-t * 6) * (t < 0.45)
    golpe = np.sin(2 * np.pi * 70 * np.clip(t - 0.42, 0, None))
    golpe *= np.exp(-np.clip(t - 0.42, 0, None) * 16) * (t >= 0.42)
    golpe += 0.5 * filtrar_ruido(len(t), 12) * np.exp(-np.clip(t - 0.42, 0, None) * 30) * (t >= 0.42)
    senal = 0.7 * soplo + 0.35 * barrido + 1.1 * golpe
    local = np.clip(t - 0.62, 0, None)
    senal += 0.5 * (np.sin(2 * np.pi * 659.25 * local) + np.sin(2 * np.pi * 987.77 * local)) * np.exp(-local * 6) * (t >= 0.62)
    return senal * envolvente(len(t), 0.004, 0.25)


def abordo():
    """dos toques secos y graves, como un sello suave"""
    t = t_de(0.22)
    senal = np.zeros(len(t))
    for inicio, frecuencia in ((0.0, 320.0), (0.085, 420.0)):
        local = np.clip(t - inicio, 0, None)
        senal += np.sin(2 * np.pi * frecuencia * local) * np.exp(-local * 45) * (t >= inicio)
    return senal * envolvente(len(t), 0.002, 0.04)


def pago():
    """monedas que chocan: parciales metalicos inarmonicos"""
    t = t_de(0.7)
    senal = np.zeros(len(t))
    for inicio, base in ((0.0, 2093.0), (0.09, 2637.0)):
        local = np.clip(t - inicio, 0, None)
        for parcial, peso in ((1.0, 1.0), (2.76, 0.6), (5.4, 0.35)):
            senal += peso * np.sin(2 * np.pi * base * parcial * local) * np.exp(-local * (9 + 4 * parcial)) * (t >= inicio)
    return senal * envolvente(len(t), 0.002, 0.15)


def inicio_viaje():
    """el motor sube de vueltas, suelta el freno de aire y arranca"""
    t = t_de(2.2)
    base = 16 + 40 * (1 - np.exp(-t * 1.4))
    senal = 0.9 * motor(base) * envolvente(len(t), 0.05, 0.4)
    aire = filtrar_ruido(len(t), 5) * np.exp(-((t - 0.3) / 0.12) ** 2) * 0.9
    local = np.clip(t - 1.1, 0, None)
    campana = np.sin(2 * np.pi * 784 * local) * np.exp(-local * 4) * (t >= 1.1)
    campana += np.sin(2 * np.pi * 1046.5 * np.clip(t - 1.25, 0, None)) * np.exp(-np.clip(t - 1.25, 0, None) * 4) * (t >= 1.25)
    return senal + aire + 0.45 * campana


def fin_viaje():
    """el bus frena con aire y suena una cadencia que baja: sol, mi, do"""
    t = t_de(2.0)
    aire = filtrar_ruido(len(t), 6) * np.exp(-((t - 0.15) / 0.22) ** 2)
    base = 40 - 26 * np.minimum(1, t / 0.9)
    freno = 0.5 * motor(base) * np.exp(-t * 2.2)
    senal = aire + freno
    for inicio, nota in ((0.55, 783.99), (0.85, 659.25), (1.15, 523.25)):
        local = np.clip(t - inicio, 0, None)
        campana = np.sin(2 * np.pi * nota * local) + 0.3 * np.sin(2 * np.pi * nota * 2 * local)
        senal += 0.5 * campana * np.exp(-local * 4.2) * (t >= inicio)
    return senal * envolvente(len(t), 0.01, 0.4)


def recordatorio():
    """timbre de campana doble, claro y corto"""
    t = t_de(1.0)
    senal = np.zeros(len(t))
    for inicio, nota in ((0.0, 1174.7), (0.18, 1568.0)):
        local = np.clip(t - inicio, 0, None)
        senal += (np.sin(2 * np.pi * nota * local) + 0.4 * np.sin(2 * np.pi * nota * 2.76 * local)) * np.exp(-local * 6) * (t >= inicio)
    return senal * envolvente(len(t), 0.003, 0.2)


def favorito():
    """destello ascendente de tres notas muy cortas"""
    t = t_de(0.5)
    senal = np.zeros(len(t))
    for inicio, nota in ((0.0, 1318.5), (0.07, 1760.0), (0.14, 2349.3)):
        local = np.clip(t - inicio, 0, None)
        senal += np.sin(2 * np.pi * nota * local) * np.exp(-local * 14) * (t >= inicio)
    return senal * envolvente(len(t), 0.002, 0.12)


if __name__ == "__main__":
    SALIDA.mkdir(parents=True, exist_ok=True)
    guardar("arranque.wav", arranque())
    guardar("bocina.wav", bocina())
    guardar("salida.wav", salida())
    guardar("confirmacion.wav", confirmacion())
    guardar("toque.wav", toque())
    guardar("boleto.wav", boleto())
    guardar("envio.wav", envio())
    guardar("abordo.wav", abordo(), 0.7)
    guardar("pago.wav", pago(), 0.7)
    guardar("inicio.wav", inicio_viaje())
    guardar("fin.wav", fin_viaje())
    guardar("recordatorio.wav", recordatorio(), 0.7)
    guardar("favorito.wav", favorito(), 0.6)
