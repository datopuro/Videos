import os
import subprocess
import sys

import numpy as np

KIT = os.path.dirname(os.path.abspath(__file__))
M = f"{KIT}/whisper-small"
URL = "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2"


def preparar():
    try:
        import sherpa_onnx
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", "--break-system-packages", "-q", "sherpa-onnx"], check=True)
    if not os.path.exists(f"{M}/small-encoder.int8.onnx"):
        subprocess.run(f"curl -sSL {URL} | tar xj -C {KIT} && mv {KIT}/sherpa-onnx-whisper-small {M}", shell=True, check=True)


def transcribir(mp3, cortes, tempo=1.06):
    import sherpa_onnx as so
    rec = so.OfflineRecognizer.from_whisper(encoder=f"{M}/small-encoder.int8.onnx", decoder=f"{M}/small-decoder.int8.onnx", tokens=f"{M}/small-tokens.txt", language="es", task="transcribe", num_threads=2)
    x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", mp3, "-af", f"atempo={tempo}", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout, dtype=np.float32)
    for a, b in zip(cortes[:-1], cortes[1:]):
        s = rec.create_stream()
        s.accept_waveform(16000, x[int(a * 16000):int(b * 16000)])
        rec.decode_stream(s)
        print(f"{a:6.2f}-{b:6.2f}  {s.result.text}", flush=True)


if __name__ == "__main__":
    sys.path.insert(0, KIT)
    from pausas import leer, pausas
    mp3 = sys.argv[1]
    tempo = float(sys.argv[2]) if len(sys.argv) > 2 else 1.06
    preparar()
    x = leer(mp3, tempo)
    ini, fin, ps = pausas(x, -40, 0.3)
    cortes = [0.0] + [(a + b) / 2 for a, b in ps] + [len(x) / 44100]
    transcribir(mp3, cortes, tempo)
