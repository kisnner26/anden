#!/usr/bin/env python3
"""Genera los sonidos de la app (assets/sonidos/*.wav) por síntesis: campanas, marimba, bocina, motor y soplidos con un poco de reverberación.

Uso: python3 scripts/generar-sonidos.py   (desde apps/movil)
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
RNG = np.random.default_rng(7)
DESTINO = Path(__file__).resolve().parent.parent / "assets" / "sonidos"


def t_de(dur):
    return np.arange(int(SR * dur)) / SR


def sobre(n, ataque=0.005, caida=None):
    """envolvente: ataque corto y caída exponencial"""
    t = np.arange(n) / SR
    a = np.minimum(1, t / max(ataque, 1e-4))
    if caida is None:
        caida = n / SR / 4
    return a * np.exp(-t / caida)


def campana(f, dur=1.4, amp=0.5):
    """campana suave: parciales inarmónicos que decaen a distinto ritmo"""
    t = t_de(dur)
    out = np.zeros_like(t)
    for ratio, a, c in [(1, 1, 0.55), (2.01, 0.45, 0.32), (2.76, 0.3, 0.22), (5.4, 0.14, 0.12), (8.93, 0.06, 0.07)]:
        out += a * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t / (c * dur))
    out *= np.minimum(1, t / 0.003)
    return amp * out / 1.6


def marimba(f, dur=0.5, amp=0.5):
    t = t_de(dur)
    out = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.12)
    out += 0.4 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.035)
    out += 0.15 * np.sin(2 * np.pi * f * 10 * t) * np.exp(-t / 0.012)
    out *= np.minimum(1, t / 0.002)
    return amp * out


def colchon(freqs, dur=2.0, amp=0.25, ataque=0.35):
    """acorde suave: senos casi iguales con un leve desafinado que laten"""
    t = t_de(dur)
    out = np.zeros_like(t)
    for f in freqs:
        for d in (-0.15, 0.0, 0.15):
            out += np.sin(2 * np.pi * (f + d) * t + RNG.uniform(0, 6.28))
            out += 0.25 * np.sin(2 * np.pi * (f + d) * 2 * t)
    env = np.minimum(1, t / ataque) * np.minimum(1, (dur - t) / 0.5)
    return amp * out * env / (len(freqs) * 3)


def bocina(f, dur=0.5, amp=0.4, subida=0.0):
    t = t_de(dur)
    freq = f * (1 + subida * t / dur)
    fase = 2 * np.pi * np.cumsum(freq) / SR
    out = np.zeros_like(t)
    for k, a in enumerate([1, 0.6, 0.45, 0.3, 0.2, 0.12], start=1):
        out += a * np.sin(k * fase + 0.2 * np.sin(2 * np.pi * 5.5 * t))
    env = np.minimum(1, t / 0.02) * np.minimum(1, (dur - t) / 0.08)
    return amp * out * env / 2.2


def ruido_filtrado(dur, barrido, amp=0.4):
    """ruido que pasa por un filtro de un polo cuyo corte sube y baja: el soplido de algo que pasa"""
    n = int(SR * dur)
    ruido = RNG.normal(0, 1, n)
    corte = barrido(np.arange(n) / SR / dur)
    out = np.zeros(n)
    y = 0.0
    for i in range(n):
        a = min(0.99, 2 * np.pi * corte[i] / SR)
        y += a * (ruido[i] - y)
        out[i] = y
    return amp * out / (np.max(np.abs(out)) + 1e-9)


def motor(dur=1.0, rpm0=28, rpm1=70, amp=0.45):
    t = t_de(dur)
    f = rpm0 + (rpm1 - rpm0) * (t / dur) ** 0.6
    fase = 2 * np.pi * np.cumsum(f) / SR
    out = np.zeros_like(t)
    for k, a in enumerate([1, 0.7, 0.5, 0.35, 0.22], start=1):
        out += a * np.sin(k * fase)
    # golpeteo de los cilindros
    out *= 0.65 + 0.35 * np.sin(2 * np.pi * f * 1.5 * t) ** 2
    out *= np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.25)
    return amp * out / 2.4


def clic(amp=0.5):
    n = int(SR * 0.02)
    return amp * RNG.normal(0, 1, n) * np.exp(-np.arange(n) / SR / 0.004)


def reverb(x, mezcla=0.22, cola=0.9):
    n = int(SR * cola)
    ir = RNG.normal(0, 1, n) * np.exp(-np.arange(n) / SR / (cola / 4))
    ir[: int(SR * 0.012)] *= 0.2
    ir /= np.sqrt(np.sum(ir**2))
    largo = len(x) + n
    mojado = np.fft.irfft(np.fft.rfft(x, largo) * np.fft.rfft(ir, largo), largo)
    seco = np.pad(x, (0, n))
    return (1 - mezcla) * seco + mezcla * mojado


def poner(base, sonido, en):
    i = int(SR * en)
    fin = i + len(sonido)
    if fin > len(base):
        base = np.pad(base, (0, fin - len(base)))
    base[i:fin] += sonido
    return base


def guardar(nombre, x, rev=0.2, cola=0.9, pico=0.82):
    if rev > 0:
        x = reverb(x, rev, cola)
    # se corta la cola cuando ya casi no se oye: los sonidos de la interfaz tienen que ser breves
    fuerte = np.nonzero(np.abs(x) > 0.02 * np.max(np.abs(x)))[0]
    x = x[: fuerte[-1] + int(SR * 0.05)]
    n = int(SR * 0.04)
    x[-n:] *= np.linspace(1, 0, n)
    x = x / (np.max(np.abs(x)) + 1e-9) * pico
    datos = (x * 32767).astype("<i2")
    with wave.open(str(DESTINO / f"{nombre}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(datos.tobytes())
    print(f"{nombre:16s} {len(x) / SR:4.2f}s")


def nota(m):
    """frecuencia de una nota MIDI"""
    return 440 * 2 ** ((m - 69) / 12)


DO5, MI5, SOL5, SI5, RE6 = nota(72), nota(76), nota(79), nota(83), nota(86)


def componer():
    # arranque: el motor tose y agarra, y sobre él se abre un acorde con campanitas que suben
    x = np.zeros(int(SR * 0.1))
    x = poner(x, motor(1.1, 22, 64), 0.0)
    x = poner(x, clic(0.35), 0.0)
    x = poner(x, clic(0.25), 0.28)
    x = poner(x, colchon([nota(60), nota(64), nota(67), nota(71)], 2.2, 0.55), 0.7)
    for i, f in enumerate([DO5, MI5, SOL5, SI5, RE6]):
        x = poner(x, campana(f, 1.5, 0.5 - i * 0.04), 0.95 + i * 0.13)
    guardar("arranque", x, 0.28, 1.1)

    # bocina: dos golpes de dos tonos, el segundo más largo y con un leve ascenso
    x = np.zeros(int(SR * 0.1))
    for fa, fb, ini, dur, sub in [(nota(65), nota(70), 0.0, 0.26, 0.0), (nota(65), nota(70), 0.34, 0.5, 0.025)]:
        x = poner(x, bocina(fa, dur, 0.45, sub) + bocina(fb, dur, 0.4, sub), ini)
    guardar("bocina", x, 0.12, 0.5)

    # salida: el bus pasa de largo con un soplido y el motor que se aleja
    soplido = ruido_filtrado(1.7, lambda p: 250 + 2600 * np.sin(np.pi * p) ** 1.5, 0.5)
    soplido *= np.sin(np.pi * np.linspace(0, 1, len(soplido))) ** 1.2
    x = poner(np.zeros(int(SR * 0.1)), soplido, 0.0)
    x = poner(x, motor(1.6, 85, 46, 0.4), 0.05)
    x = poner(x, campana(SOL5, 1.2, 0.3), 1.0)
    guardar("salida", x, 0.2, 0.9)

    # toque: golpecito de madera, casi sin cola
    guardar("toque", marimba(nota(84), 0.18, 0.5) + np.pad(clic(0.12), (0, int(SR * 0.16))), 0.05, 0.2)

    # confirmación: dos campanas que suben
    x = poner(np.zeros(1), campana(MI5, 1.2, 0.5), 0.0)
    x = poner(x, campana(SI5, 1.5, 0.5), 0.16)
    guardar("confirmacion", x, 0.25, 1.0)

    # boleto: el sello de la perforadora y una campanita
    x = poner(np.zeros(1), clic(0.7), 0.0)
    x = poner(x, marimba(nota(55), 0.25, 0.5), 0.0)
    x = poner(x, campana(SOL5, 1.1, 0.45), 0.08)
    x = poner(x, campana(DO5 * 2, 1.2, 0.4), 0.2)
    guardar("boleto", x, 0.2, 0.8)

    # pago: monedas, dos notas agudas rápidas
    x = poner(np.zeros(1), campana(nota(88), 0.9, 0.45), 0.0)
    x = poner(x, campana(nota(93), 1.1, 0.45), 0.09)
    guardar("pago", x, 0.18, 0.7)

    # envío: soplido que sube y campana
    s = ruido_filtrado(0.7, lambda p: 300 + 3000 * p**2, 0.35) * np.linspace(0.2, 1, int(SR * 0.7))
    x = poner(np.zeros(1), s, 0.0)
    x = poner(x, campana(nota(91), 1.2, 0.5), 0.55)
    guardar("envio", x, 0.22, 0.9)

    # favorito: dos golpes de marimba hacia arriba
    x = poner(np.zeros(1), marimba(nota(76), 0.4, 0.5), 0.0)
    x = poner(x, marimba(nota(83), 0.5, 0.5), 0.1)
    guardar("favorito", x, 0.15, 0.6)

    # abordo: dos toquecitos y una campana corta
    x = poner(np.zeros(1), marimba(nota(60), 0.2, 0.5), 0.0)
    x = poner(x, marimba(nota(60), 0.2, 0.5), 0.11)
    x = poner(x, campana(nota(79), 0.7, 0.4), 0.2)
    guardar("abordo", x, 0.15, 0.5)

    # fin: acorde que baja y se resuelve
    x = poner(np.zeros(1), colchon([nota(55), nota(60), nota(64)], 2.2, 0.5), 0.0)
    for i, f in enumerate([nota(79), nota(76), nota(72)]):
        x = poner(x, campana(f, 1.6, 0.5), 0.1 + i * 0.22)
    guardar("fin", x, 0.28, 1.1)

    # inicio: motor corto y dos campanas
    x = poner(np.zeros(1), motor(0.8, 30, 60, 0.4), 0.0)
    x = poner(x, campana(DO5, 1.2, 0.45), 0.5)
    x = poner(x, campana(SOL5, 1.4, 0.45), 0.66)
    guardar("inicio", x, 0.22, 0.9)

    # recordatorio: tres notas suaves que suben
    x = np.zeros(1)
    for i, f in enumerate([SOL5, DO5 * 2, MI5 * 2]):
        x = poner(x, campana(f, 1.4, 0.45), i * 0.2)
    guardar("recordatorio", x, 0.25, 1.0)

    # bienvenida: melodía pentatónica sobre un colchón
    x = poner(np.zeros(1), colchon([nota(60), nota(67), nota(71)], 3.0, 0.5), 0.0)
    for i, m in enumerate([72, 76, 79, 76, 84]):
        x = poner(x, campana(nota(m), 1.4, 0.45), 0.15 + i * 0.28)
    guardar("bienvenida", x, 0.3, 1.2)

    # plus: arpegio que brilla y sube
    x = poner(np.zeros(1), colchon([nota(64), nota(71), nota(76)], 3.2, 0.45, 0.6), 0.0)
    for i, m in enumerate([76, 79, 83, 88, 91, 95]):
        x = poner(x, campana(nota(m), 1.6, 0.42 - i * 0.03), 0.2 + i * 0.16)
    guardar("plus", x, 0.32, 1.3)

    # la mascota
    x = poner(np.zeros(1), marimba(nota(76), 0.25, 0.5), 0.0)
    x = poner(x, marimba(nota(83), 0.3, 0.5), 0.09)
    guardar("mascotaHola", x, 0.12, 0.4)

    t = t_de(0.3)
    f = 520 * np.exp(-t * 5) + 200
    boing = 0.55 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12)
    boing *= 1 + 0.25 * np.sin(2 * np.pi * 28 * t)
    guardar("mascotaBoing", boing, 0.1, 0.4)

    resp = ruido_filtrado(0.8, lambda p: 180 + 120 * np.sin(np.pi * p), 0.5)
    resp *= np.sin(np.pi * np.linspace(0, 1, len(resp))) ** 2
    resp += 0.25 * np.sin(2 * np.pi * 70 * t_de(0.8)) * np.sin(np.pi * np.linspace(0, 1, len(resp))) ** 2
    guardar("mascotaZzz", resp, 0.1, 0.5)


if __name__ == "__main__":
    componer()
