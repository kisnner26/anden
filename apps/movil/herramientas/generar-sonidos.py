"""genera los sonidos de la portada: arranque del motor, bocina, salida del bus, confirmacion y toque.

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


if __name__ == "__main__":
    SALIDA.mkdir(parents=True, exist_ok=True)
    guardar("arranque.wav", arranque())
    guardar("bocina.wav", bocina())
    guardar("salida.wav", salida())
    guardar("confirmacion.wav", confirmacion())
    guardar("toque.wav", toque())
