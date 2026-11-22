/* Cuadro: busca la toma vigente, la dibuja y encima pone el rótulo de historia real (inicio de cada video o reel)
   y los subtítulos sacados de la voz. */
TOMAS.sort((a, b) => a.ini - b.ini);
const INICIOS = [0, q('Angela Woodruff es abogada.'), q('Angela Woodruff convenció a la policía'), q('Un médico falsificó el testamento')].filter(x => x != null);
const FIN_VOZ = Math.max(...Object.values(C.D.bloques).map(b => b.fin));
window.renderAt = t => {
  g.limpiar();
  let i = 0; while (i + 1 < TOMAS.length && TOMAS[i + 1].ini <= t) i++;
  const tm = TOMAS[i]; g.save(); tm.fn(t, t - tm.ini, (TOMAS[i + 1] ? TOMAS[i + 1].ini : FIN_VOZ + 5) - tm.ini); g.restore();
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  const ini = Math.max(...INICIOS.filter(x => x <= t + 0.01));
  const a = cl((t - ini) / 0.3) * cl((ini + 3.0 - t) / 0.4);
  if (a > 0) {
    g.save(); g.globalAlpha = a; g.font = `600 ${V ? 38 : 30}px ${C.FUENTE}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const txt = 'Historia real · reconstrucción animada' + (INICIOS.length > 1 ? ' · Parte ' + (INICIOS.indexOf(ini) + 1) : ''), w = g.measureText(txt).width + 44, y = V ? 285 : 46;
    g.fillStyle = 'rgba(12,13,18,0.62)'; g.beginPath(); g.roundRect(CX - w / 2, y - 30, w, 60, 30); g.fill(); g.fillStyle = '#ffffff'; g.fillText(txt, CX, y + 1); g.restore();
  }
  oscuro(1 - cl((t - ini) / 0.35));
  C.subtitulos(g, t, V ? { y: 1190 } : {});
};
window.listo = true;
