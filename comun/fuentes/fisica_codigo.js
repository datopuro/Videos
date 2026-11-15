/* Física 2D precalculada para render por cuadros sueltos. Referencias:
   https://github.com/liabru/matter-js (MIT): motor de cuerpos rígidos (Bodies, Composite, Engine.update, eventos de colisión).
   https://brm.io/matter-js/docs/classes/Engine.html: paso fijo con Engine.update(engine, ms) para que el resultado sea siempre el mismo.
   La simulación entera se calcula una vez al cargar la página (de 0 a dur) y renderAt(t) solo consulta la tabla:
   así cualquier cuadro, en cualquier orden y en cualquier proceso, sale idéntico. */
(() => {
  const K = window.K = window.K || {};
  const M = window.Matter;
  K.fisica = (construir, o = {}) => {
    const { dur = 10, hz = 120, guardar = 60, gravedad = 1 } = o;
    const motor = M.Engine.create({ enableSleeping: false });
    motor.gravity.y = gravedad;
    const mundo = motor.world, agenda = [];
    const en = (t, fn) => agenda.push({ t, fn, hecho: false });
    construir(M, mundo, en, motor);
    const plantillas = new Map(), cuadros = [], choques = [];
    const plantilla = b => {
      if (plantillas.has(b.id)) return;
      const partes = (b.parts.length > 1 ? b.parts.slice(1) : [b]).map(p => ({
        r: p.circleRadius || 0,
        c: [p.position.x - b.position.x, p.position.y - b.position.y],
        v: p.vertices.map(v => [v.x - b.position.x, v.y - b.position.y]),
      }));
      plantillas.set(b.id, { partes, a0: b.angle, cuerpo: b });
    };
    M.Events.on(motor, 'collisionStart', ev => ev.pairs.forEach(p => {
      const v = Math.hypot(p.bodyA.velocity.x - p.bodyB.velocity.x, p.bodyA.velocity.y - p.bodyB.velocity.y);
      if (v > 2) choques.push({ t: motor.timing.timestamp / 1000, a: p.bodyA.label, b: p.bodyB.label, v: +v.toFixed(2) });
    }));
    const dt = 1000 / hz, cada = Math.round(hz / guardar);
    const foto = () => cuadros.push(M.Composite.allBodies(mundo).map(b => { plantilla(b); return [b.id, b.position.x, b.position.y, b.angle]; }));
    foto();
    for (let i = 1; i <= Math.ceil(dur * hz); i++) {
      const t = (i * dt) / 1000;
      agenda.forEach(a => { if (!a.hecho && t >= a.t) { a.hecho = true; a.fn(M, mundo, motor); } });
      M.Engine.update(motor, dt);
      if (i % cada === 0) foto();
    }
    const F = { choques, motor, mundo, M };
    F.cuerpos = t => {
      const f = Math.max(0, Math.min(cuadros.length - 1, t * guardar)), i = Math.floor(f), k = f - i;
      const A = cuadros[i], B = cuadros[Math.min(i + 1, cuadros.length - 1)], mB = new Map(B.map(c => [c[0], c]));
      return A.map(([id, x, y, ang]) => {
        const b2 = mB.get(id), P = plantillas.get(id);
        if (b2) { x += (b2[1] - x) * k; y += (b2[2] - y) * k; ang += (b2[3] - ang) * k; }
        return { id, x, y, ang, cuerpo: P.cuerpo, partes: P.partes, giro: ang - P.a0 };
      });
    };
    F.dibujar = (g, t, op = {}) => {
      const { color = '#ffd23f', borde = 'rgba(0,0,0,.55)', grosor = 3 } = op;
      F.cuerpos(t).forEach(c => {
        const b = c.cuerpo, est = Object.assign({}, b.plugin && b.plugin.dp);
        if (b.render && b.render.visible === false || est.oculto) return;
        const cs = Math.cos(c.giro), sn = Math.sin(c.giro), rot = ([px, py]) => [c.x + px * cs - py * sn, c.y + px * sn + py * cs];
        g.save();
        g.fillStyle = est.color || (b.isStatic ? 'rgba(255,255,255,.25)' : color); g.strokeStyle = est.borde || borde; g.lineWidth = est.grosor ?? grosor;
        c.partes.forEach(p => {
          g.beginPath();
          if (p.r) { const [cx, cy] = rot(p.c); g.arc(cx, cy, p.r, 0, Math.PI * 2); }
          else p.v.forEach((v, j) => { const [vx, vy] = rot(v); j ? g.lineTo(vx, vy) : g.moveTo(vx, vy); });
          g.closePath(); g.fill(); if (g.lineWidth) g.stroke();
        });
        g.restore();
        if (est.icono && K.ico) K.ico(g, est.icono, c.x, c.y, est.tamIcono || (c.partes[0].r ? c.partes[0].r * 1.2 : 40), { color: est.colorIcono || '#141414', rot: c.giro });
        if (est.etiqueta) { g.save(); g.font = `800 ${est.fs || 30}px "Inter Display", Inter, sans-serif`; g.textAlign = 'center'; g.fillStyle = est.colorTexto || '#141414'; g.translate(c.x, c.y); g.rotate(c.giro); g.fillText(est.etiqueta, 0, (est.fs || 30) * 0.35); g.restore(); }
      });
    };
    return F;
  };
})();
